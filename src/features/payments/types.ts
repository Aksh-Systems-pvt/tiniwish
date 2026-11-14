/**
 * Provider-Independent Payment Domain Types
 * Defines the vendor-neutral payment contract, status model, and adapter interfaces.
 */

export type DomainPaymentMethod = "UPI" | "COD" | "RAZORPAY";

export type DomainPaymentStatus =
  | "PENDING"
  | "INITIATED"
  | "AUTHORIZED"
  | "CAPTURED"
  | "FAILED"
  | "REFUNDED";

export type PaymentProviderName =
  | "AKSHPAY_PHONEPE"
  | "AKSHPAY_PAYTM"
  | "COD"
  | "RAZORPAY";

export interface CreatePaymentInput {
  orderId: string;
  orderNumber: string;
  amountInRupees: number;
  amountInPaise: number;
  currency: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  returnUrl?: string;
  callbackUrl?: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
  upiOptions?: {
    generateQR?: boolean;
    vpa?: string;
    merchantName?: string;
  };
}

export interface PaymentCreationResult {
  success: boolean;
  provider: PaymentProviderName;
  providerTransactionId?: string;
  providerReferenceId: string;
  amountInPaise: number;
  currency: string;
  status: DomainPaymentStatus;
  redirectUrl?: string;
  qrDataUrl?: string;
  upiUri?: string;
  intentLinks?: {
    generic?: string;
    phonepe?: string;
    gpay?: string;
    paytm?: string;
    bhim?: string;
  };
  rawResponse?: Record<string, unknown>;
  errorCode?: string;
  errorMessage?: string;
}

export interface CheckPaymentStatusInput {
  orderId: string;
  providerReferenceId: string;
  providerTransactionId?: string;
}

export interface PaymentStatusResult {
  status: DomainPaymentStatus;
  providerTransactionId?: string;
  providerReferenceId: string;
  amountInPaise: number;
  currency: string;
  rawResponse?: Record<string, unknown>;
  errorCode?: string;
  errorMessage?: string;
  verifiedAt?: Date;
}

export interface VerifyWebhookInput {
  payload: unknown;
  headers: Record<string, string | string[] | undefined>;
  rawBody?: string | Buffer;
  expectedAmountInPaise?: number;
  expectedOrderId?: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  eventId: string;
  eventType: string;
  orderId?: string;
  providerTransactionId?: string;
  status: DomainPaymentStatus;
  amountInPaise?: number;
  rawResponse?: Record<string, unknown>;
  safeError?: string;
}

export interface RefundPaymentInput {
  orderId: string;
  providerTransactionId?: string;
  amountInPaise: number;
  reason?: string;
  idempotencyKey?: string;
}

export interface PaymentRefundResult {
  success: boolean;
  refundId?: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  amountInPaise: number;
  rawResponse?: Record<string, unknown>;
  errorCode?: string;
  errorMessage?: string;
}

export interface IPaymentProvider {
  readonly name: PaymentProviderName;
  readonly supportedMethods: readonly DomainPaymentMethod[];
  readonly isEnabled: boolean;

  createPayment(input: CreatePaymentInput): Promise<PaymentCreationResult>;
  checkStatus(input: CheckPaymentStatusInput): Promise<PaymentStatusResult>;
  verifyWebhook(input: VerifyWebhookInput): Promise<WebhookVerificationResult>;
  refund(input: RefundPaymentInput): Promise<PaymentRefundResult>;
}

