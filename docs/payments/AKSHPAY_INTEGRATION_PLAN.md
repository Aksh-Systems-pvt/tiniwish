# AkshPay (UPIPay) — TiniWish Production Integration Plan

> **Project**: TiniWish Luxury E-Commerce  
> **Source SDK**: [https://github.com/Aksh-Systems-pvt/akshPay](https://github.com/Aksh-Systems-pvt/akshPay) (v1.0.0)  
> **Target Framework**: Next.js 16.4.5 (App Router, Turbopack, React 19)  
> **Database & ORM**: PostgreSQL via Prisma 6.19.3 & Supabase  
> **Author**: TiniWish Engineering Team  
> **Adherence**: Karpathy Guidelines (Surgical changes, minimal abstractions, test-driven milestones)

---

## 1. Integration Strategy & Architecture

### 1.1 The Dual-Gateway Architecture
TiniWish serves luxury artificial jewellery, bespoke gifts, and home décor across India. To maximize conversion while eliminating payment gateway commissions, TiniWish will adopt a **Dual-Gateway Strategy**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TINIWISH PAYMENT ROUTING MATRIX                       │
├─────────────────────────┬──────────────────────────────┬────────────────────┤
│ Payment Method Chosen   │ Processing Gateway           │ Commission Rate    │
├─────────────────────────┼──────────────────────────────┼────────────────────┤
│ 1. Instant UPI          │ AkshPay (PhonePe / Direct)   │ 0% MDR (Zero fees) │
│ 2. Cards / NetBanking   │ Razorpay Payment Gateway     │ ~2% + GST          │
│ 3. Cash on Delivery     │ Internal COD Logistics       │ Zero fee (Optional)│
└─────────────────────────┴──────────────────────────────┴────────────────────┘
```

By routing standard UPI transactions through AkshPay, TiniWish retains **100% of sales funds** on UPI (typically 75–85% of Indian e-commerce checkout volume) with instant bank settlement.

---

## 2. Package Integration Options & Recommendation

### Option A: npm Workspace Local Package (`packages/akshpay/`)
- Place the SDK in `packages/akshpay/` and reference it via npm package workspace (`"dependencies": { "akshpay": "file:packages/akshpay" }`).
- *Trade-off*: Introduces workspace overhead, extra build steps (`tsup` watch/build), and symlinking complexity in Turbopack.

### Option B (Recommended): Internal Domain Library (`src/lib/payments/akshpay/`)
- Place the audited TypeScript source code directly into `src/lib/payments/akshpay/`.
- *Advantages*:
  1. Compiles natively with Next.js Turbopack and Vitest with zero extra build steps or dual-package hazards.
  2. Inherits TiniWish's TypeScript 5 strict configuration.
  3. Easy to maintain, debug, and patch without multi-package tooling.
  4. 100% tree-shakeable.

### Upstream Attribution & Licence Preservation
To strictly comply with open-source licensing:
1. Retain the original **MIT License** file at `src/lib/payments/akshpay/LICENSE` with full copyright notice:  
   `Copyright (c) 2026 UPIPay Contributors`.
2. Keep the original author header in all ported source files.
3. Reference the original GitHub repository in `src/lib/payments/akshpay/README.md`.

---

## 3. Dependency Installation Strategy

`akshPay` has only **one** runtime dependency:
```bash
npm install qrcode
npm install -D @types/qrcode
```
All cryptographic operations use native Node.js `node:crypto`. No other external dependencies are required.

---

## 4. Database Schema Migrations (`prisma/schema.prisma`)

### 4.1 Update `PaymentMethod` Enum
```prisma
enum PaymentMethod {
  RAZORPAY
  PHONEPE_UPI
  PAYTM_UPI
  COD
}
```

### 4.2 Extend `Payment` Model for Multi-Gateway Support
Currently, `model Payment` has Razorpay-specific columns (`razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`). We extend it cleanly:

```prisma
model Payment {
  id                String        @id @default(uuid())
  orderId           String
  order             Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
  attemptNumber     Int           @default(1)
  amount            Decimal       @db.Decimal(12, 2)
  currency          String        @default("INR")
  method            PaymentMethod
  status            PaymentStatus @default(PENDING)

  // Gateway IDs & References
  gatewayOrderId    String?       // Universal provider order ID (e.g. PhonePe merchantTransactionId)
  gatewayPaymentId  String?       @unique // Unique PSP transaction ID
  gatewaySignature  String?

  // Legacy Razorpay Columns (Preserved for backwards compatibility)
  razorpayOrderId   String?
  razorpayPaymentId String?       @unique
  razorpaySignature String?

  errorCode         String?
  errorDescription  String?
  gatewayResponse   Json?         // Full raw webhook/callback snapshot

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@index([orderId])
  @@index([gatewayOrderId])
  @@index([gatewayPaymentId])
  @@index([status])
}
```

---

## 5. Environment Variables Setup

Add to `.env` and `.env.example`:
```env
# ==============================================================================
# PhonePe Business (akshPay) — Zero Commission UPI
# ==============================================================================
PHONEPE_MERCHANT_ID="PGTESTPAYUAT"
PHONEPE_SALT_KEY="099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"
PHONEPE_SALT_INDEX="1"
PHONEPE_ENV="sandbox" # Set to 'production' for live deployments
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 6. Detailed Implementation Flow

### 6.1 Payment Client Factory
Create `src/lib/payments/phonepe.ts`:
```typescript
import { UPIPay } from "./akshpay";

export const phonePeClient = new UPIPay({
  provider: "phonepe",
  environment: (process.env.PHONEPE_ENV as "sandbox" | "production") || "sandbox",
  credentials: {
    merchantId: process.env.PHONEPE_MERCHANT_ID!,
    saltKey: process.env.PHONEPE_SALT_KEY!,
    saltIndex: process.env.PHONEPE_SALT_INDEX || "1",
  },
  options: {
    timeout: 30000,
    debug: process.env.NODE_ENV !== "production",
  },
});
```

---

### 6.2 Service Layer Integration (`src/services/checkout.service.ts`)

#### A. In `createOrder()`:
When `paymentMethod === "PHONEPE_UPI"`:
1. Complete database order creation and inventory reservation inside `prisma.$transaction`.
2. Convert order total to integer paise: `const amountInPaise = Math.round(Number(order.totalAmount) * 100);`.
3. Call `phonePeClient.createPayment()`:
   ```typescript
   const paymentSession = await phonePeClient.createPayment({
     amount: amountInPaise,
     orderId: order.orderNumber,
     customerPhone: order.customerPhone,
     callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/checkout/webhooks/phonepe`,
     redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderNumber=${order.orderNumber}&paymentProvider=phonepe`,
     idempotencyKey: order.idempotencyKey || undefined,
   });
   ```
4. Return `{ order, paymentUrl: paymentSession.paymentUrl }`.

---

### 6.3 Next.js Webhook Route Handler

Create `src/app/api/v1/checkout/webhooks/phonepe/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { phonePeClient } from "@/lib/payments/phonepe";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const rawBuffer = Buffer.from(await req.arrayBuffer());
    const signature = req.headers.get("x-verify") || "";

    // 1. Cryptographic HMAC verification
    const event = phonePeClient.verifyWebhook(rawBuffer, signature);
    if (!event.verified) {
      logger.warn("PhonePe webhook signature verification failed");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { orderId, transactionId, status, amount } = event;

    // 2. Fetch order from database
    const order = await prisma.order.findUnique({
      where: { orderNumber: orderId },
      include: { payments: true },
    });

    if (!order) {
      logger.error(`Order not found for PhonePe webhook: ${orderId}`);
      return new NextResponse("Order not found", { status: 404 });
    }

    // 3. Idempotency Guard — if already processed, return 200 immediately
    if (order.status === "PAID" || order.status === "PROCESSING") {
      logger.info(`PhonePe webhook: Order ${orderId} already processed (idempotent replay)`);
      return new NextResponse("OK", { status: 200 });
    }

    // 4. Server-to-server confirmation via Status API with amount verification
    const expectedPaise = Math.round(Number(order.totalAmount) * 100);
    const verifiedStatus = await phonePeClient.checkStatus(orderId, {
      expectedAmount: expectedPaise,
    });

    // 5. Update order and record payment in atomic transaction
    if (verifiedStatus.status === "SUCCESS") {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { status: "PROCESSING" },
        }),
        prisma.payment.create({
          data: {
            orderId: order.id,
            amount: order.totalAmount,
            currency: "INR",
            method: "PHONEPE_UPI",
            status: "CAPTURED",
            gatewayOrderId: order.orderNumber,
            gatewayPaymentId: verifiedStatus.transactionId || transactionId,
            gatewayResponse: event.rawPayload as any,
          },
        }),
      ]);

      logger.info(`✅ Order ${orderId} successfully marked PAID via PhonePe UPI`);
    } else if (verifiedStatus.status === "FAILED") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAYMENT_FAILED" },
      });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    logger.error("PhonePe webhook execution error", { error: String(err) });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
```

---

### 6.4 Prevention of Duplicate Callbacks & Race Conditions

1. **Database Constraint**: `gatewayPaymentId` has a `@unique` constraint in PostgreSQL, preventing duplicate payment rows for the same transaction.
2. **State Machine Guard**: Order state transition check (`if (order.status !== 'PENDING_PAYMENT') return 200 OK`).
3. **Double Verification**: Even after webhook signature passes, the handler queries `phonePeClient.checkStatus()` to ensure the payment actually succeeded on PhonePe's servers and wasn't spoofed.

---

### 6.5 Frontend Checkout UI Changes

#### 1. In `src/components/checkout/payment-method-selector.tsx`:
Add PhonePe UPI option:
- **Radio 1**: Direct UPI (PhonePe / Google Pay / Paytm / BHIM) — *Zero fees, Fast dispatch*.
- **Radio 2**: Credit / Debit Cards & NetBanking (Razorpay Secure).
- **Radio 3**: Cash on Delivery (COD).

#### 2. In `src/app/checkout/page.tsx`:
- When customer selects `PHONEPE_UPI` and clicks "Place Order":
- Backend returns `{ order, paymentUrl }`.
- Frontend redirects: `window.location.href = paymentUrl`.
- On mobile devices, this launches the PhonePe / UPI app directly.
- On desktop, PhonePe's hosted pay page presents an instant, dynamically generated QR code.

---

## 7. Phased Implementation Plan (Karpathy Guidelines)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        IMPLEMENTATION MILESTONES                       │
├─────────┬──────────────────────────────────────────────────────────────┤
│ Phase 1 │ Install `qrcode`, copy audited source to `src/lib/payments/` │
│ Phase 2 │ Unit tests for SDK adapters in Vitest (mocked PSP responses) │
│ Phase 3 │ Update Prisma Schema (`PaymentMethod`, `Payment` columns)    │
│ Phase 4 │ Integrate with `checkout.service.ts` & create Webhook route  │
│ Phase 5 │ Update Checkout UI (`PaymentMethodSelector`, `checkout/page`)│
│ Phase 6 │ Full verification: Unit tests, Lint, Build & Sandbox E2E     │
└─────────┴──────────────────────────────────────────────────────────────┘
```

### Success Verification Criteria for Each Phase:
- **Phase 1 & 2**: `npm test` runs all AkshPay tests cleanly inside TiniWish's Vitest runner.
- **Phase 3**: `npx prisma validate` and `npx prisma db push` succeed without data loss.
- **Phase 4**: Integration test simulates PhonePe webhook with valid and invalid signatures, verifying database state transitions and amount validation.
- **Phase 5**: UI cleanly toggles between Razorpay, PhonePe UPI, and COD.
- **Phase 6**: `npm run lint`, `npm test`, and `npm run build` pass with 0 errors.

