import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/features/payments/payment.service";
import { logger } from "@/lib/logger";

/**
 * POST /api/v1/checkout/webhook/akshpay
 * Webhook listener for PhonePe & AkshPay server-to-server transaction notifications.
 * Verifies cryptographic checksum, processes state changes idempotently,
 * and confirms orders inside atomic database transactions.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let payload: Record<string, unknown> = {};

    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = { raw: rawBody };
    }

    // Extract headers as a record
    const headers: Record<string, string | undefined> = {};
    request.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    const verification = await paymentService.processWebhook("AKSHPAY_PHONEPE", {
      payload,
      headers,
      rawBody,
    });

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
      eventId: verification.eventId,
      status: verification.status,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    logger.warn("AkshPay webhook handler rejected notification", { message });

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    );
  }
}

