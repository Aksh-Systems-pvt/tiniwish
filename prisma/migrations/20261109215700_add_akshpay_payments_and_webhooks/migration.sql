-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'UPI';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "amountInPaise" INTEGER,
ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT,
ADD COLUMN IF NOT EXISTS "provider" TEXT DEFAULT 'RAZORPAY',
ADD COLUMN IF NOT EXISTS "providerReferenceId" TEXT,
ADD COLUMN IF NOT EXISTS "providerTransactionId" TEXT,
ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "WebhookProcessStatus" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED', 'IGNORED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "WebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" "WebhookProcessStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB,
    "errorMessage" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_providerTransactionId_key" ON "Payment"("providerTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Payment_provider_idx" ON "Payment"("provider");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Payment_providerTransactionId_idx" ON "Payment"("providerTransactionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Payment_idempotencyKey_idx" ON "Payment"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WebhookEvent_eventId_key" ON "WebhookEvent"("eventId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WebhookEvent_provider_eventId_idx" ON "WebhookEvent"("provider", "eventId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WebhookEvent_status_idx" ON "WebhookEvent"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WebhookEvent_receivedAt_idx" ON "WebhookEvent"("receivedAt");

