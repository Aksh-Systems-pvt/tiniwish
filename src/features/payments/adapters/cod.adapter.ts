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

export class CODAdapter implements IPaymentProvider {
  public readonly name: PaymentProviderName = "COD";
  public readonly supportedMethods: readonly DomainPaymentMethod[] = ["COD"];
  public readonly isEnabled: boolean = true;

  async createPayment(input: CreatePaymentInput): Promise<PaymentCreationResult> {
    const amountInPaise = input.amountInPaise || Math.round(input.amountInRupees * 100);

    return {
      success: true,
      provider: "COD",
      providerReferenceId: input.orderNumber,
      amountInPaise,
      currency: input.currency || "INR",
      status: "PENDING",
      rawResponse: {
        method: "COD",
        note: "Payment to be collected in cash or UPI by delivery agent upon delivery",
      },
    };
  }

  async checkStatus(input: CheckPaymentStatusInput): Promise<PaymentStatusResult> {
    return {
      status: "PENDING",
      providerReferenceId: input.providerReferenceId,
      amountInPaise: 0,
      currency: "INR",
      rawResponse: { method: "COD", note: "Pending doorstep collection" },
    };
  }

  async verifyWebhook(input: VerifyWebhookInput): Promise<WebhookVerificationResult> {
    void input;
    return {
      isValid: false,
      eventId: `cod_nowebhook_${Date.now()}`,
      eventType: "COD_NO_WEBHOOK",
      status: "FAILED",
      safeError: "Cash on Delivery does not support automated webhook notifications",
    };
  }

  async refund(input: RefundPaymentInput): Promise<PaymentRefundResult> {
    const refundId = input.idempotencyKey || `cod_ref_${Date.now()}`;
    return {
      success: true,
      refundId,
      status: "PENDING",
      amountInPaise: input.amountInPaise,
      rawResponse: {
        method: "COD",
        note: "Cash refund recorded for manual bank payout / store credit reconciliation",
      },
    };
  }
}
