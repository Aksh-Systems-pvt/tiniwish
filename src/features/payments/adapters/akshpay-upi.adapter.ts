import {
  UPIPay,
  rupeesToPaise,
  generateUPIQR,
  buildIntentLinks,
  UPIPayError,
  WebhookVerificationError,
} from "akshpay";
import {
  IPaymentProvider,
  PaymentProviderName,
  DomainPaymentMethod,
  DomainPaymentStatus,
  CreatePaymentInput,
  PaymentCreationResult,
  CheckPaymentStatusInput,
  PaymentStatusResult,
  VerifyWebhookInput,
  WebhookVerificationResult,
  RefundPaymentInput,
  PaymentRefundResult,
} from "../types";
import { logger } from "@/lib/logger";

interface AkshPayAdapterConfig {
  provider: "phonepe" | "paytm";
  environment?: "sandbox" | "production";
  credentials?: {
    // PhonePe
    merchantId?: string;
    saltKey?: string;
    saltIndex?: string;
    // Paytm
    merchantKey?: string;
  };
  vpa?: string;
  merchantName?: string;
}

export class AkshPayUPIAdapter implements IPaymentProvider {
  public readonly name: PaymentProviderName;
  public readonly supportedMethods: readonly DomainPaymentMethod[] = ["UPI"];
  public readonly isEnabled: boolean = true;

  private client: UPIPay | null = null;
  private readonly providerType: "phonepe" | "paytm";
  private readonly defaultVpa: string;
  private readonly defaultMerchantName: string;

  constructor(config?: AkshPayAdapterConfig) {
    const providerType = config?.provider || (process.env.AKSHPAY_PROVIDER === "paytm" ? "paytm" : "phonepe");
    this.providerType = providerType;
    this.name = providerType === "paytm" ? "AKSHPAY_PAYTM" : "AKSHPAY_PHONEPE";
    this.defaultVpa = config?.vpa || process.env.AKSHPAY_UPI_VPA || "tiniwish@ybl";
    this.defaultMerchantName = config?.merchantName || process.env.AKSHPAY_MERCHANT_NAME || "TiniWish Luxury";

    const env =
      config?.environment ||
      (process.env.PHONEPE_ENV === "production" ||
      process.env.AKSHPAY_ENV === "production" ||
      process.env.NODE_ENV === "production"
        ? "production"
        : "sandbox");

    if (typeof window === "undefined") {
      try {
        if (providerType === "phonepe") {
          const merchantId =
            config?.credentials?.merchantId ||
            process.env.PHONEPE_MERCHANT_ID ||
            process.env.PHONEPE_CLIENTID ||
            process.env.PHONEPE_CLIENT_ID ||
            "MERCHANTUAT";

          let saltKey =
            config?.credentials?.saltKey ||
            process.env.PHONEPE_SALT_KEY ||
            process.env.PHONEPE_CLIENT_SECRET ||
            process.env.PHONEPE_WEBHOOK ||
            process.env.PHONEPE_WEBHOOK_SECRET ||
            "ab1c2d3e-f4g5-6789-abcd-ef1234567890";

          // If a base64-encoded salt/secret key was passed, decode it if the decoded form is a valid hex/UUID string
          if (saltKey && !saltKey.includes("-") && saltKey.length > 36) {
            try {
              const decoded = Buffer.from(saltKey, "base64").toString("utf-8");
              if (/^[0-9a-fA-F-]+$/.test(decoded)) {
                saltKey = decoded;
              }
            } catch {
              // keep as-is
            }
          }

          const saltIndex =
            config?.credentials?.saltIndex ||
            process.env.PHONEPE_SALT_INDEX ||
            "1";

          this.client = new UPIPay({
            provider: "phonepe",
            environment: env,
            credentials: { merchantId, saltKey, saltIndex },
          });
        } else {
          const merchantId =
            config?.credentials?.merchantId ||
            process.env.PAYTM_MERCHANT_ID;
          const merchantKey =
            config?.credentials?.merchantKey ||
            process.env.PAYTM_MERCHANT_KEY;

          if (
            merchantId &&
            merchantKey &&
            !merchantId.includes("placeholder") &&
            !merchantKey.includes("placeholder")
          ) {
            this.client = new UPIPay({
              provider: "paytm",
              environment: env,
              credentials: { merchantId, merchantKey },
            });
          } else {
            this.client = null;
          }
        }
      } catch (err) {
        logger.warn(`Failed to initialize AkshPay UPI client for ${this.name}`, { err });
        this.client = null;
      }
    }
  }

  /**
   * Creates a payment intent via AkshPay (Dynamic QR or Hosted PG Redirect).
   */
  async createPayment(input: CreatePaymentInput): Promise<PaymentCreationResult> {
    const amountInPaise = input.amountInPaise || rupeesToPaise(input.amountInRupees);
    const amountInRupees = input.amountInRupees || amountInPaise / 100;
    const vpa = input.upiOptions?.vpa || this.defaultVpa;
    const merchantName = input.upiOptions?.merchantName || this.defaultMerchantName;

    // 1. If dynamic QR flow requested or no hosted client, generate instant NPCI QR & deep links
    const shouldGenerateQR = input.upiOptions?.generateQR !== false;
    let qrDataUrl: string | undefined;
    let upiUri: string | undefined;
    let intentLinks: PaymentCreationResult["intentLinks"] | undefined;

    if (shouldGenerateQR) {
      try {
        const qrResponse = await generateUPIQR({
          vpa,
          name: merchantName,
          amount: amountInRupees,
          orderId: input.orderNumber,
          note: `Payment for order ${input.orderNumber}`,
          mode: "fixed",
        });

        qrDataUrl = qrResponse.qrImage;
        upiUri = qrResponse.upiUri;
        intentLinks = buildIntentLinks(qrResponse.upiUri);
      } catch (qrErr) {
        logger.warn("Failed to generate dynamic UPI QR", { qrErr });
      }
    }

    // 2. If hosted PSP client is available, also obtain payment redirect URL
    let redirectUrl: string | undefined;
    let providerTransactionId: string | undefined;
    let rawResponse: Record<string, unknown> | undefined;

    if (this.client) {
      try {
        const pspResponse = await this.client.createPayment({
          orderId: input.orderNumber,
          amount: amountInPaise,
          customerPhone: input.customer.phone,
          customerEmail: input.customer.email,
          redirectUrl: input.returnUrl || "https://tiniwish.com/checkout/confirmation",
          callbackUrl: input.callbackUrl || "https://tiniwish.com/api/v1/checkout/webhook/akshpay",
        });

        redirectUrl = pspResponse.paymentUrl;
        providerTransactionId = pspResponse.providerTransactionId;
        rawResponse = pspResponse.rawResponse as Record<string, unknown>;
      } catch (pspErr) {
        // If hosted gateway call fails (e.g. sandbox offline), the dynamic NPCI QR remains a valid zero-commission payment option
        logger.warn("AkshPay hosted payment creation skipped or unavailable; using UPI QR fallback", {
          pspErr,
        });
      }
    }

    return {
      success: true,
      provider: this.name,
      providerReferenceId: input.orderNumber,
      providerTransactionId,
      amountInPaise,
      currency: input.currency || "INR",
      status: "INITIATED",
      redirectUrl,
      qrDataUrl,
      upiUri,
      intentLinks,
      rawResponse,
    };
  }

  /**
   * Polls payment status via AkshPay PSP Status API.
   */
  async checkStatus(input: CheckPaymentStatusInput): Promise<PaymentStatusResult> {
    if (!this.client) {
      return {
        status: "INITIATED",
        providerReferenceId: input.providerReferenceId,
        amountInPaise: 0,
        currency: "INR",
        errorMessage: "AkshPay client is not configured for remote status checks",
      };
    }

    try {
      const response = await this.client.checkStatus(input.providerReferenceId);
      const status = this.mapStatus(response.status);
      const amountInPaise = response.amount ?? 0;

      return {
        status,
        providerReferenceId: input.providerReferenceId,
        providerTransactionId: response.transactionId,
        amountInPaise,
        currency: "INR",
        rawResponse: response.rawResponse as Record<string, unknown>,
        verifiedAt: status === "CAPTURED" ? new Date() : undefined,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Status verification failed";
      return {
        status: "FAILED",
        providerReferenceId: input.providerReferenceId,
        amountInPaise: 0,
        currency: "INR",
        errorCode: err instanceof UPIPayError ? err.code : "STATUS_CHECK_ERROR",
        errorMessage: message,
      };
    }
  }

  /**
   * Verifies incoming webhook notification with cryptographic checksum & replay check.
   */
  async verifyWebhook(input: VerifyWebhookInput): Promise<WebhookVerificationResult> {
    if (!this.client) {
      return {
        isValid: false,
        eventId: `evt_uninit_${Date.now()}`,
        eventType: "PAYMENT_NOTIFICATION",
        status: "FAILED",
        safeError: "AkshPay client is not configured for webhook verification",
      };
    }

    // Extract signature from headers (PhonePe uses 'x-verify', Paytm uses 'x-paytm-signature' or 'checksum')
    const headers = input.headers;
    const signature =
      (headers["x-verify"] as string) ||
      (headers["x-paytm-signature"] as string) ||
      (headers["checksum"] as string) ||
      (typeof input.payload === "object" && input.payload !== null && "checksum" in input.payload
        ? String((input.payload as Record<string, unknown>).checksum)
        : "");

    const timestampHeader = (headers["x-webhook-timestamp"] as string) || (headers["x-timestamp"] as string);
    const timestamp = timestampHeader ? parseInt(timestampHeader, 10) : undefined;

    try {
      const payloadStr =
        typeof input.payload === "string"
          ? input.payload
          : input.rawBody
          ? typeof input.rawBody === "string"
            ? input.rawBody
            : input.rawBody.toString("utf8")
          : JSON.stringify(input.payload);

      const event = this.client.verifyWebhook(payloadStr, signature, {
        timestamp,
        expectedAmount: input.expectedAmountInPaise,
      });

      if (!event.verified) {
        return {
          isValid: false,
          eventId: event.transactionId || `evt_invalid_${Date.now()}`,
          eventType: "PAYMENT_NOTIFICATION",
          status: "FAILED",
          safeError: "Cryptographic signature mismatch or amount mismatch",
        };
      }

      const status = this.mapStatus(event.status);
      const eventId = event.transactionId || `${event.orderId}_${Date.now()}`;

      return {
        isValid: true,
        eventId,
        eventType: "PAYMENT_NOTIFICATION",
        orderId: event.orderId,
        providerTransactionId: event.transactionId,
        status,
        amountInPaise: event.amount,
        rawResponse: event.rawPayload as Record<string, unknown>,
      };
    } catch (err) {
      const safeError =
        err instanceof WebhookVerificationError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Webhook verification failed";

      logger.warn("AkshPay webhook verification failed", { safeError });

      return {
        isValid: false,
        eventId: `evt_invalid_${Date.now()}`,
        eventType: "PAYMENT_NOTIFICATION",
        status: "FAILED",
        safeError,
      };
    }
  }

  /**
   * Refunds payment via AkshPay PSP API (where supported).
   */
  async refund(input: RefundPaymentInput): Promise<PaymentRefundResult> {
    if (!this.client) {
      return {
        success: false,
        status: "FAILED",
        amountInPaise: input.amountInPaise,
        errorMessage: "AkshPay client is not configured for refund operations",
      };
    }

    try {
      const refundId = input.idempotencyKey || `ref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const response = await this.client.createRefund({
        originalOrderId: input.orderId,
        refundId,
        amount: input.amountInPaise,
        providerTransactionId: input.providerTransactionId,
        reason: input.reason || "Customer refund request",
      });

      return {
        success: response.success,
        refundId: response.refundId,
        status: response.status === "SUCCESS" ? "COMPLETED" : response.status === "FAILED" ? "FAILED" : "PENDING",
        amountInPaise: response.amount,
        rawResponse: response.rawResponse as Record<string, unknown>,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Refund failed";
      return {
        success: false,
        status: "FAILED",
        amountInPaise: input.amountInPaise,
        errorCode: err instanceof UPIPayError ? err.code : "REFUND_ERROR",
        errorMessage: message,
      };
    }
  }

  private mapStatus(status: string): DomainPaymentStatus {
    const upper = status.toUpperCase();
    if (upper === "SUCCESS" || upper === "PAYMENT_SUCCESS" || upper === "TXN_SUCCESS") {
      return "CAPTURED";
    }
    if (upper === "PENDING" || upper === "PAYMENT_PENDING" || upper === "INITIATED") {
      return "INITIATED";
    }
    if (upper === "AUTHORIZED") {
      return "AUTHORIZED";
    }
    if (upper === "REFUNDED") {
      return "REFUNDED";
    }
    return "FAILED";
  }
}
