# AkshPay (UPIPay) — Comprehensive Security & Threat Model Review

> **Target Package**: `akshpay` (UPIPay v1.0.0)  
> **Source Repository**: `https://github.com/Aksh-Systems-pvt/akshPay`  
> **Target Environment**: TiniWish (Next.js 16.4.5, React 19, PostgreSQL, Supabase)  
> **Security Standard**: OWASP Top 10 API Security & Karpathy Guidelines

---

## 1. Security Architecture Overview

`akshPay` is designed with a defense-in-depth security model. Because payment SDKs are prime targets for financial tampering, amount substitution, replay attacks, and credential theft, the library builds security controls into every layer:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       AKSHPAY DEFENSE-IN-DEPTH LAYERS                       │
│                                                                             │
│  Layer 1: Runtime Guard      → Throws if bundled into Browser / React Native│
│  Layer 2: Input Validation   → Regex bounds, URL scheme check, HTTPS check  │
│  Layer 3: Secret Protection  → Masking in logs, error response sanitization │
│  Layer 4: Transport Security → TLS/HTTPS enforcement, 30s timeout signal    │
│  Layer 5: Cryptographic Auth → HMAC-SHA256 / SHA256 / constantTimeEqual     │
│  Layer 6: Financial Guard    → expectedAmount verification, rupeesToPaise   │
│  Layer 7: Idempotency        → Upstream PSP token forwarding                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Credential Security & Server-Only Enforcement

### 2.1 Browser Bundle Leakage Guard
In modern full-stack frameworks like Next.js, importing server code into client components can accidentally leak environment secrets (`PHONEPE_SALT_KEY`, `PAYTM_MERCHANT_KEY`) into the public JavaScript bundle.

`akshPay` enforces a strict runtime boundary in `src/client.ts`:
```typescript
const isBrowser = typeof globalThis !== 'undefined'
  && typeof (globalThis as any).window !== 'undefined'
  && typeof (globalThis as any).window.document !== 'undefined';

if (isBrowser || isReactNative) {
  throw new InvalidConfigError(
    'UPIPay cannot run in browser or React Native environments — merchant credentials ' +
    'must stay on the server. For client-side QR generation, use the standalone QR module: ' +
    'import { generateUPIQR } from "upipay/qr"'
  );
}
```
**TiniWish Architecture Alignment**:
- The main `UPIPay` client must be instantiated exclusively inside server files: `src/services/checkout.service.ts` and `src/app/api/v1/checkout/*`.
- Client components only ever receive ephemeral payment URLs or rendered QR codes from backend APIs.

### 2.2 Automated Secret Masking in Logs
In `src/utils/logger.ts`, all log messages pass through `maskSecrets()`:
- Fields matching `/^(saltKey|merchantKey|secret|password|token|apiKey|auth|key)$/i` are automatically replaced with `[REDACTED]`.
- Long strings with key-like patterns are truncated (e.g. `ab1c...7890`).
- Prevents accidental credential leaks in APM systems (Datadog, Sentry, CloudWatch, Vercel logs).

### 2.3 Placeholder Credential Detection
In `src/utils/validation.ts`, credentials matching:
```typescript
/^(your_|test_|xxx|placeholder|change_me|TODO|FIXME)/i
```
are immediately rejected at startup with an `InvalidConfigError`, preventing deployment with placeholder keys.

---

## 3. Cryptographic Verification & Side-Channel Defenses

### 3.1 Constant-Time Comparison (`constantTimeEqual`)
In `src/utils/crypto.ts`:
```typescript
export function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  const maxLen = Math.max(bufA.length, bufB.length, 1);

  // Pad both buffers to the same length (filled with 0)
  const paddedA = Buffer.alloc(maxLen);
  const paddedB = Buffer.alloc(maxLen);
  bufA.copy(paddedA);
  bufB.copy(paddedB);

  // Always perform constant-time comparison regardless of length
  const contentsEqual = timingSafeEqual(paddedA, paddedB);

  // Only return true if lengths also match (checked AFTER constant-time op)
  return bufA.length === bufB.length && contentsEqual;
}
```
#### Why this matters:
- Standard `===` string comparison terminates on the first mismatched byte, allowing attackers to measure microsecond timing variations to deduce HMAC signatures byte-by-byte.
- Standard `crypto.timingSafeEqual` throws an exception if buffer lengths differ, which itself leaks the signature length.
- `akshPay`'s implementation zero-pads both buffers to equal length, executes `timingSafeEqual`, and verifies lengths **after** the constant-time operation. This eliminates both timing and length side-channel leaks.

### 3.2 Signature Verification
- **PhonePe**: `SHA256(base64Response + saltKey) + "###" + saltIndex` verified against the `x-verify` header.
- **Paytm**: AES-128-CBC with SHA256 checksum over sorted pipe-delimited parameters (`key1|key2...`).

---

## 4. Financial Integrity: Anti-Tampering & Amount Substitution

### 4.1 Amount Substitution Attack Vector
In classic payment gateway vulnerabilities:
1. Attacker creates an order for a luxury item worth ₹50,000.
2. Attacker tampers with the payment initiation or initiates a separate session for ₹1.
3. Attacker triggers the webhook with `status: SUCCESS` for the ₹1 transaction.
4. An insecure server marks the ₹50,000 order as fulfilled.

### 4.2 AkshPay Defense: Mandatory `expectedAmount`
In `checkStatus()` and `verifyWebhook()`:
```typescript
if (options?.expectedAmount !== undefined && status === 'SUCCESS') {
  if (amount !== options.expectedAmount) {
    throw new PaymentError(
      `Amount mismatch: expected ${options.expectedAmount} paise but PSP returned ${amount} paise. Possible payment manipulation.`,
      { provider: 'phonepe', isRetriable: false }
    );
  }
}
```
**Requirement for TiniWish**:
In TiniWish, the backend MUST retrieve the genuine order total from PostgreSQL and pass `{ expectedAmount: Math.round(Number(order.totalAmount) * 100) }` into every status check and webhook verification.

### 4.3 Floating-Point Rounding Attacks
In JavaScript:
```javascript
5.99 * 100 = 599.0000000000001
```
Naive multiplication can lead to decimal mismatches where `59900` paise becomes `59900.00000000001`, causing integer validation to fail or charging incorrect amounts.  
`src/utils/currency.ts` provides `rupeesToPaise(rupees)` which:
- Checks that input is a valid positive number.
- Enforces a maximum of 2 decimal places (`/^\d+(\.\d{1,2})?$/`).
- Uses `Math.round(rupees * 100)` to return safe integer paise.

---

## 5. Input Validation & Injection Defenses

Verified in `src/utils/validation.ts`:

### 5.1 Order ID Injection Prevention
`orderId` is validated against:
```typescript
const ORDER_ID_PATTERN = /^[a-zA-Z0-9_\-\.]{1,128}$/;
```
- Rejects SQL injection payloads: `order_123'; DROP TABLE orders;--`
- Rejects path traversal payloads: `../../etc/passwd`
- Rejects HTTP header injection / CRLF payloads: `order_123\r\nX-Forwarded-For: evil.com`

### 5.2 URL Scheme Whitelisting
`callbackUrl` and `redirectUrl` are checked against:
```typescript
const DANGEROUS_SCHEMES = /^(javascript|data|vbscript|file):/i;
```
- Blocks Cross-Site Scripting (XSS) via `javascript:alert(1)` redirect URLs.
- In `production` environment, enforces `https://` exclusively.

### 5.3 Indian Mobile Number Sanitization
- Rejects international numbers and letters.
- Strips prefixes (`+91`, `91`, `091`, `0`) and guarantees a clean 10-digit numeric string for PSP payload compliance.

---

## 6. Replay Attacks & Idempotency Analysis

### 6.1 Webhook Replay Vulnerability
An attacker captures a valid webhook POST from PhonePe containing a genuine signature and resends it repeatedly to trigger multiple fulfillment events or refunds.

### 6.2 AkshPay Implementation & Limitations
- `akshPay` includes an opt-in timestamp freshness check:
  `isTimestampFresh(timestamp, toleranceSeconds = 300)`.
- However, as documented in `SECURITY.md`, **timestamp-based replay protection is opt-in and not recommended as the primary defense**. This is because PSPs embed the *transaction creation timestamp* in the payload, not the delivery timestamp. If network congestion or webhook retries delay delivery by 6 minutes, a strict 5-minute window will silently reject genuine payments.

### 6.3 TiniWish Production Defense: Database-Level Idempotency
To achieve zero replay risk:
1. TiniWish must enforce a `UNIQUE` constraint on `Payment.gatewayPaymentId` in PostgreSQL.
2. In the webhook route handler, check order state inside a Prisma transaction:
   ```typescript
   if (order.status !== 'PENDING_PAYMENT') {
     // Already processed — return 200 OK immediately without double-fulfilling
     return new NextResponse('OK', { status: 200 });
   }
   ```
3. Pass `order.idempotencyKey` to PhonePe as `X-IDEMPOTENCY-KEY` to prevent duplicate session creation on client retries.

---

## 7. Threat Vectors & Host Application Responsibilities

The SDK handles cryptographic and protocol security, but the host application (TiniWish) must provide the following defenses:

| Threat Vector | SDK Capability | TiniWish Host Application Responsibility |
| :--- | :--- | :--- |
| **Fake Webhook Flood (DoS)** | Validates HMAC (CPU-intensive) | Must apply **Rate Limiting** (e.g. max 100 req/min per IP) on `/api/v1/checkout/webhooks/*` |
| **IP Spoofing** | Express IP middleware in SDK | Must adapt IP allowlisting for Next.js App Router or Cloudflare WAF |
| **QR Scan Spoofing** | Warns that QR has no automated proof | **MUST NEVER** mark an order fulfilled based on a user claiming they scanned the QR |
| **Client Redirect Spoofing** | None (client can be altered) | Must verify payment via `checkStatus()` or Webhook before showing final success |
| **Double Fulfillment** | Provides idempotency key header | Must enforce database transaction & unique constraints on order/payment records |

---

## 8. Final Security Verdict

`akshPay` is **production-secure** when integrated according to its design principles:
1. Never run `UPIPay` on the client.
2. Always supply `expectedAmount` from the database.
3. Always verify payments via server webhook and `checkStatus()`.
4. Rely on database-level idempotency to prevent double-fulfillment.

