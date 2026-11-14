import { NextRequest } from "next/server";
import { checkoutService } from "@/services/checkout.service";
import { getAuthUser } from "@/lib/auth";
import { verifyPaymentSchema } from "@/lib/checkout-schemas";
import { apiSuccess, handleApiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/checkout/orders/[id]/verify-payment
 * Verifies Razorpay HMAC signature and confirms order payment.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const validated = verifyPaymentSchema.parse(body);
    const authUser = await getAuthUser(request);

    let updatedOrder;
    if (
      validated.paymentMethod === "UPI" ||
      validated.transactionId ||
      validated.upiReferenceId
    ) {
      updatedOrder = await checkoutService.verifyUpiPayment(
        id,
        validated.transactionId || validated.upiReferenceId,
        authUser
      );
    } else {
      updatedOrder = await checkoutService.verifyPayment(
        id,
        {
          razorpayPaymentId: validated.razorpayPaymentId || `pay_sim_${Date.now()}`,
          razorpayOrderId: validated.razorpayOrderId || "order_sim_123",
          razorpaySignature: validated.razorpaySignature || "mock_signature_valid",
        },
        authUser
      );
    }

    return apiSuccess(updatedOrder, "Payment verified successfully. Order confirmed.");
  } catch (error) {
    return handleApiError(error);
  }
}

