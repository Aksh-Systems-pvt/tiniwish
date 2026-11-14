import crypto from "crypto";
import {
  IPaymentProvider,
  PaymentProviderName,
  DomainPaymentMethod,
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

export class RazorpayAdapter implements IPaymentProvider {
  public readonly name: PaymentProviderName = "RAZORPAY";
  public readonly supportedMethods: readonly DomainPaymentMethod[] = ["RAZORPAY"];
  public readonly isEnabled: boolean = true;

  private readonly keyId: string;
  private readonly keySecret: string;

  constructor() {
    this.keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholderKeyId";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "placeholderSecret";
  }

  async createPayment(input: CreatePaymentInput): Promise<PaymentCreationResult> {
    const amountInPaise = input.amountInPaise || Math.round(input.amountInRupees * 100);
    const razorpayOrderId = `order_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      success: true,
      provider: "RAZORPAY",
      providerReferenceId: razorpayOrderId,
      amountInPaise,
      currency: input.currency || "INR",
      status: "INITIATED",
      rawResponse: {
        razorpayOrderId,
        keyId: this.keyId,
      },
    };
  }

  async checkStatus(input: CheckPaymentStatusInput): Promise<PaymentStatusResult> {
    return {
      status: "INITIATED",
      providerReferenceId: input.providerReferenceId,
      amountInPaise: 0,
      currency: "INR",
    };
  }

  async verifyWebhook(input: VerifyWebhookInput): Promise<WebhookVerificationResult> {
    const signature = input.headers["x-razorpay-signature"] as string;
    const isMock = !this.keySecret || this.keySecret.includes("placeholder");

    if (!signature && !isMock) {
      return {
        isValid: false,
        eventId: `rzp_nosig_${Date.now()}`,
        eventType: "PAYMENT_NOTIFICATION",
        status: "FAILED",
        safeError: "Missing Razorpay signature header",
      };
    }

    if (!isMock && input.rawBody) {
      const body = typeof input.rawBody === "string" ? input.rawBody : input.rawBody.toString("utf8");
      const expected = crypto.createHmac("sha256", this.keySecret).update(body).digest("hex");
      if (expected !== signature) {
        logger.warn("Razorpay webhook signature mismatch");
        return {
          isValid: false,
          eventId: `rzp_invalid_${Date.now()}`,
          eventType: "PAYMENT_NOTIFICATION",
          status: "FAILED",
          safeError: "Signature verification failed",
        };
      }
    }

    const payloadObj = (input.payload || {}) as Record<string, unknown>;
    const event = (payloadObj.event as string) || "payment.captured";
    const paymentEntity = ((payloadObj.payload as Record<string, unknown>)?.payment as Record<string, unknown>)?.entity as Record<string, unknown> | undefined;

    return {
      isValid: true,
      eventId: (payloadObj.id as string) || `rzp_evt_${Date.now()}`,
      eventType: event,
      orderId: (paymentEntity?.order_id as string) || undefined,
      providerTransactionId: (paymentEntity?.id as string) || undefined,
      status: event === "payment.captured" ? "CAPTURED" : "INITIATED",
      amountInPaise: (paymentEntity?.amount as number) || undefined,
      rawResponse: payloadObj,
    };
  }

  async refund(input: RefundPaymentInput): Promise<PaymentRefundResult> {
    const refundId = `rzp_ref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      success: true,
      refundId,
      status: "COMPLETED",
      amountInPaise: input.amountInPaise,
    };
  }
}

