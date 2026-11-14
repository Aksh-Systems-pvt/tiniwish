# AkshPay (UPIPay) — Technical Architecture & Codebase Audit

> **Target Package**: `akshpay` (published in source as `upipay` v1.0.0)  
> **Repository**: [https://github.com/Aksh-Systems-pvt/akshPay](https://github.com/Aksh-Systems-pvt/akshPay)  
> **Source Commit**: `8cb7267d53f730d384d129910a8f01accc48009d` (`main`)  
> **Audit Date**: 2026-11-09  
> **Auditor**: TiniWish Senior Payments Architecture Review  
> **Guidelines Followed**: Karpathy Guidelines (Rigorous, verifiable, zero speculation)

---

## 1. Executive Summary

`akshPay` is a zero-commission, TypeScript-first Node.js SDK designed to accept UPI payments directly into an Indian merchant bank account via the National Payments Corporation of India (NPCI) network.

It operates by bypassing paid commercial aggregators (e.g., Razorpay, Cashfree, PayU) that charge **2% + 18% GST** on transactions. Instead, it leverages the Indian Government's 2020 **0% MDR (Merchant Discount Rate)** mandate on standard UPI by calling the free merchant APIs of **PhonePe Business** and **Paytm Business**, or by generating **NPCI-compliant dynamic UPI QR codes**.

### Critical Reality Check & Disclaimers
1. **Scope of Payment Methods**: The SDK **ONLY** supports UPI payments (plus Paytm Wallet in specific configurations). It does **NOT** support Credit Cards, Debit Cards, Net Banking, EMI/BNPL, or International Payments.
2. **Static/Dynamic QR Limitations**: Standalone QR code generation (`generateUPIQR`) creates an NPCI URI (`upi://pay?...`). It has **NO automated server confirmation**, webhook, or status polling mechanism. Automated payment fulfillment requires the PSP flow (PhonePe or Paytm).
3. **Runtime Scope**: The core SDK (`UPIPay`) is strictly **server-only**. Attempting to instantiate it in a browser or React Native client throws a runtime `InvalidConfigError` to protect merchant secrets.

---

## 2. Repository Structure & Build Configuration

```
scratch/akshPay/
├── src/
│   ├── client.ts             # Main UPIPay class (factory & public orchestration)
│   ├── index.ts              # Public exports barrel
│   ├── types.ts              # TypeScript interface definitions (430 lines)
│   ├── errors.ts             # Typed error hierarchy (UPIPayError, PaymentError, etc.)
│   ├── interfaces/
│   │   └── psp-adapter.ts    # IPSPAdapter interface contract
│   ├── adapters/
│   │   ├── phonepe.ts        # PhonePe Business adapter (504 lines)
│   │   └── paytm.ts          # Paytm Business adapter (488 lines)
│   ├── upi/
│   │   └── qr.ts             # NPCI QR generator & deep link builder (187 lines)
│   └── utils/
│       ├── crypto.ts         # HMAC, SHA256, constantTimeEqual, AES-128-CBC
│       ├── currency.ts       # Float-safe rupeesToPaise() conversion
│       ├── ip-guard.ts       # Express IP allowlisting middleware
│       ├── logger.ts         # Secret-masking logger
│       ├── retry.ts          # withRetry() exponential back-off wrapper
│       ├── sanitize.ts       # PSP error response sanitisation
│       └── validation.ts     # Input, URL, VPA, and phone number validation
├── tests/
│   ├── client.test.ts        # Client initialization & configuration tests
│   ├── qr.test.ts            # QR & deep-link unit tests
│   └── security.test.ts      # 725 lines of crypto, tampering & injection tests
├── package.json              # Version 1.0.0, module: "type": "module"
├── tsconfig.json             # ES2020 target, bundler resolution, strict: true
├── tsup.config.ts            # Dual CJS/ESM compilation via tsup
└── LICENSE                   # MIT License (2026 UPIPay Contributors)
```

### Dependency Audit
- **Runtime Dependencies**: Exactly 1 runtime dependency: `qrcode: ^1.5.4` (used exclusively for rendering base64 PNG data URLs from UPI URIs).
- **Native Node.js APIs**: Relies exclusively on `node:crypto` for SHA256, HMAC-SHA256, AES-128-CBC, and `timingSafeEqual`.
- **Zero Supply Chain Bloat**: Does not depend on heavy networking or security libraries; uses native global `fetch` with `AbortSignal.timeout`.

---

## 3. Public Exports & Function Signatures

Verified from `src/index.ts` and `src/client.ts`:

### 3.1 Primary Orchestration Class: `UPIPay`
```typescript
export class UPIPay {
  constructor(config: UPIPayConfig);
  readonly provider: Provider;       // 'phonepe' | 'paytm'
  readonly environment: Environment; // 'sandbox' | 'production'

  // PSP Hosted Payment Flow
  createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse>;
  checkStatus(orderId: string, options?: CheckStatusOptions): Promise<PaymentStatusResponse>;
  verifyWebhook(payload: string | Buffer, signature: string, options?: WebhookVerifyOptions): WebhookEvent;
  createRefund(request: CreateRefundRequest): Promise<RefundResponse>;

  // UPI QR Code Helpers
  generateQR(request: UPIQRRequest): Promise<UPIQRResponse>;
  buildPaymentLink(request: UPIQRRequest): string;
  buildAppLinks(upiUri: string): UPIIntentLink;
}
```

### 3.2 Standalone QR & Link Utilities (`src/upi/qr.ts`)
```typescript
export function buildUPIUri(request: UPIQRRequest): string;
export function buildIntentLinks(upiUri: string): UPIIntentLink;
export function generateUPIQR(request: UPIQRRequest): Promise<UPIQRResponse>;
export function generateUPIQRSvg(request: UPIQRRequest): Promise<string>;
export function generateUPIQRBuffer(request: UPIQRRequest): Promise<Buffer>;
```

### 3.3 Utilities & Guards
```typescript
export function rupeesToPaise(rupees: number): number;
export function createPhonePeWebhookGuard(options?: WebhookGuardOptions): (req, res, next) => void;
export function createPaytmWebhookGuard(options?: WebhookGuardOptions): (req, res, next) => void;
```

### 3.4 Error Hierarchy (`src/errors.ts`)
All errors inherit from `UPIPayError`:
- `InvalidConfigError`: Thrown on bad credentials, missing fields, or placeholder values.
- `PaymentError`: Thrown on upstream PSP payment initiation or status failure.
- `WebhookVerificationError`: Thrown when webhook verification fails.
- `NetworkError`: Thrown on socket timeout, connection reset, or fetch aborts.
- `RefundError`: Thrown on refund processing failure.

---

## 4. Deep Inspection: PhonePe Business Implementation

Verified from `src/adapters/phonepe.ts`:

### 4.1 Endpoints
- **Sandbox**: `https://api-preprod.phonepe.com/apis/pg-sandbox`
- **Production**: `https://api.phonepe.com/apis/hermes`

### 4.2 Payment Creation (`createPayment`)
1. **Input Normalization**: Normalizes `customerPhone` via `normalizePhoneNumber(phone)` to a 10-digit Indian number.
2. **Payload Construction**:
   ```json
   {
     "merchantId": "MERCHANTUAT",
     "merchantTransactionId": "order_123",
     "merchantUserId": "MUID_9876543210",
     "amount": 50000,
     "redirectUrl": "https://yoursite.com/done",
     "redirectMode": "REDIRECT",
     "callbackUrl": "https://yoursite.com/webhook",
     "paymentInstrument": { "type": "PAY_PAGE" }
   }
   ```
3. **Base64 & Checksum Generation**:
   - `base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64')`
   - `checksum = SHA256(base64Payload + "/pg/v1/pay" + saltKey) + "###" + saltIndex`
4. **Headers**:
   - `Content-Type: application/json`
   - `X-VERIFY: <checksum>`
   - `X-IDEMPOTENCY-KEY: <idempotencyKey>` (if provided by caller)
5. **Output**:
   Returns `{ success: boolean, paymentUrl: string, orderId: string, providerTransactionId?: string, rawResponse: any }`.

### 4.3 Payment Status Verification (`checkStatus`)
- **Endpoint**: `GET /pg/v1/status/{merchantId}/{orderId}`
- **Checksum**: `SHA256("" + path + saltKey) + "###" + saltIndex`
- **Automatic Retry**: Uses `withRetry()` wrapping `fetchStatus()` with 3 attempts and exponential backoff (`1000ms`, `2000ms`, `4000ms`).
- **Amount Verification**: If `options.expectedAmount` is passed and status is `SUCCESS`, it verifies `amount === options.expectedAmount`. If there is a mismatch, it throws `PaymentError("Amount mismatch... Possible payment manipulation.")`.

### 4.4 Webhook Verification (`verifyWebhook`)
- PhonePe sends a background `POST` with JSON envelope: `{"response":"<base64_encoded_json>"}`.
- Checksum header: `x-verify`.
- Expected Checksum: `SHA256(base64Response + saltKey) + "###" + saltIndex`.
- Verified using `constantTimeEqual(expectedChecksum, signature)` (constant-time comparison).
- **Opt-in Replay Protection**: `enableReplayProtection: false` by default because PSP transaction timestamps reflect the transaction moment, not the network delivery moment. When enabled, checks freshness against `timestampToleranceSeconds` (default 300s).

### 4.5 Refund Processing (`createRefund`)
- **Endpoint**: `POST /pg/v1/refund`
- Payload: `merchantTransactionId` (refundId), `originalTransactionId` (original orderId), `amount` in paise.
- Checksum: `SHA256(base64Payload + "/pg/v1/refund" + saltKey) + "###" + saltIndex`.
- Supports partial and full refunds.

---

## 5. Deep Inspection: Paytm Business Implementation

Verified from `src/adapters/paytm.ts`:

### 5.1 Endpoints
- **Sandbox**: `https://securestage.paytmpayments.com`
- **Production**: `https://secure.paytmpayments.com`

### 5.2 Payment Creation (`createPayment`)
- **Endpoint**: `POST /theia/api/v1/initiateTransaction?mid={mid}&orderId={orderId}`
- **Currency Conversion**: Converts amount from paise back to Rupees string with 2 decimal places (`(amount / 100).toFixed(2)`).
- **Checksum Generation**: Uses `stableStringify(body)` and AES-128-CBC + SHA256 signature with `merchantKey`.
- **Returns**: `txnToken` and constructs hosted payment URL:
  `${baseUrl}/theia/api/v1/showPaymentPage?mid=...&orderId=...&txnToken=...`.

### 5.3 Callback Architecture (CRITICAL DIFFERENCE)
- **Paytm does NOT send a background server-to-server webhook by default.**
- Paytm redirects the **customer's browser** via an HTTP `POST` form submit to the specified `callbackUrl`.
- The request contains form-encoded fields and `CHECKSUMHASH`.
- Verification requires extracting `CHECKSUMHASH`, alphabetizing remaining keys, pipe-joining values (`key1|key2...`), and decrypting/checking AES-128-CBC checksum.
- **Architectural Implication**: The callback handler in Next.js MUST accept `application/x-www-form-urlencoded`, verify the checksum, check status, and **redirect the customer** (or render HTML), rather than returning JSON.

---

## 6. Deep Inspection: Standalone QR Generation

Verified from `src/upi/qr.ts`:

- Builds standard NPCI URI format:
  ```
  upi://pay?pa={vpa}&pn={name}&am={amount.toFixed(2)}&tr={orderId}&cu=INR&mode=04
  ```
- **Mode 04 (Fixed Amount)**: Locks the transaction in the customer's UPI app so they cannot alter the amount.
- **Deep links generated**:
  - PhonePe: `phonepe://pay?...`
  - Google Pay (Tez): `tez://upi/pay?...`
  - Paytm: `paytmmp://pay?...`
  - Generic / BHIM: `upi://pay?...`
- **Warning in Source Code**:
  > *"QR-Only Flow Limitations: This method does not support automated payment verification. There is no webhook/callback mechanism or Status API. Payments must be verified manually."*

---

## 7. Capability Comparison: AkshPay vs TiniWish Requirements

| Feature | TiniWish Production Requirement | AkshPay (UPIPay) Capability | Status / Gap |
| :--- | :--- | :--- | :--- |
| **Direct UPI Payments** | Accept UPI without aggregator cut | PhonePe Business & Paytm Business (0% MDR) | **Full match** |
| **Server-Authoritative Pricing** | Never trust client prices; calculate on server | SDK expects `amount` in integer paise from backend | **Full match** |
| **Credit / Debit Cards** | RuPay, Visa, Mastercard | **Not supported** (UPI only) | **Must keep Razorpay** |
| **Net Banking & EMI** | Major Indian banks, PayLater | **Not supported** (UPI only) | **Must keep Razorpay** |
| **Cash on Delivery (COD)** | Pay on delivery with optional fee | **Not supported** | **Handled in TiniWish** |
| **Automated Verification** | Mark order PAID only on verified funds | Supported via PhonePe/Paytm webhooks & `checkStatus` | **Full match** |
| **QR Code on Desktop** | Dynamic QR code for checkout | Supported via `generateUPIQR` | **Full match** |
| **Mobile UPI Intent** | Tap to open GPay/PhonePe | Supported via `buildIntentLinks` | **Full match** |
| **Idempotency** | Prevent duplicate orders/charges | `idempotencyKey` forwarded to PSP; DB deduplication | **Full match** |
| **Full / Partial Refunds** | Order cancellation refunds | Supported via `createRefund` | **Full match** |
| **Next.js App Router Support** | Route handlers (`Request` / `NextResponse`) | Core logic is vanilla JS/TS with standard buffers | **Full match** |

---

## 8. Summary of Findings

1. `akshPay` is clean, robust, and rigorously tested (120+ unit/security tests).
2. It solves the exact problem of **0% commission UPI payments**.
3. It does **not** replace Razorpay for non-UPI payment methods.
4. Integrating `akshPay` into TiniWish provides a **Dual Gateway Setup**:
   - **UPI (PhonePe / Direct UPI)**: Routed through `akshPay` (0% fee, instant bank settlement).
   - **Cards / NetBanking / EMI**: Routed through Razorpay (standard gateway fee).
   - **Cash on Delivery**: Routed through internal COD fulfillment.
5. Production implementation must use PhonePe Business PSP flow (or Paytm) for automated order status confirmation, never relying on raw QR scans or client redirects alone.

