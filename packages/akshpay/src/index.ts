// ============================================================================
// UPIPay — Public API
// ============================================================================
// Single entry point for the upipay package. Import from here in your app.

// ─── Main Client ─────────────────────────────────────────────────────
export { UPIPay } from './client';

// ─── UPI QR Code Generation ─────────────────────────────────────────
export {
  generateUPIQR,
  generateUPIQRSvg,
  generateUPIQRBuffer,
  buildUPIUri,
  buildIntentLinks,
} from './upi/qr';

// ─── Currency Utilities ─────────────────────────────────────────────
// rupeesToPaise is re-exported from the main barrel for convenience.
// Using this helper avoids JavaScript floating-point precision bugs
// that arise from naive multiplication (e.g. 5.99 * 100 = 599.0000000000001).
export { rupeesToPaise } from './utils/currency';

// ─── Types ───────────────────────────────────────────────────────────
export type {
  Provider,
  Environment,
  PaymentStatus,
  PaymentMethod,
  LogLevel,
  UPIPayConfig,
  UPIPayOptions,
  UPIQRRequest,
  UPIQRResponse,
  UPIIntentLink,
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentStatusResponse,
  WebhookEvent,
  WebhookVerifyOptions,
  CheckStatusOptions,
  PhonePeCredentials,
  PaytmCredentials,
  // Refund
  RefundStatus,
  CreateRefundRequest,
  RefundResponse,
} from './types';

// ─── Errors ──────────────────────────────────────────────────────────
export {
  UPIPayError,
  InvalidConfigError,
  PaymentError,
  WebhookVerificationError,
  NetworkError,
  RefundError,
} from './errors';

// ─── Interface ───────────────────────────────────────────────────────
export type { IPSPAdapter } from './interfaces/psp-adapter';

// ─── Adapters (for direct use) ───────────────────────────────────────
export { PhonePeAdapter } from './adapters/phonepe';
export { PaytmAdapter } from './adapters/paytm';

// ─── Webhook Origin Guards ───────────────────────────────────────────
// Express-compatible middleware that restricts webhook endpoints to requests
// originating from the PSP's published network ranges. Drop in before
// express.raw() and verifyWebhook() in your middleware chain.
export {
  createPhonePeWebhookGuard,
  createPaytmWebhookGuard,
} from './utils/ip-guard';
export type {
  WebhookGuardOptions,
  WebhookRequest,
  WebhookResponse,
} from './utils/ip-guard';
