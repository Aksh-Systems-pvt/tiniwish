import { NextRequest } from "next/server";
import { checkoutService } from "@/services/checkout.service";
import { resolveCartContext } from "@/lib/cart-session";
import { checkoutCalculationSchema } from "@/lib/checkout-schemas";
import { CheckoutItemDTO } from "@/types/checkout";
import { apiSuccess, handleApiError } from "@/lib/api-response";

/**
 * POST /api/v1/checkout/calculate
 * Calculates live checkout financials, GST breakdown, shipping charges, and delivery estimates.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const validated = checkoutCalculationSchema.parse(body);
    const cartContext = await resolveCartContext(request);

    const calculation = await checkoutService.calculateCheckoutFinancials({
      pincode: validated.pincode,
      couponCode: validated.couponCode,
      paymentMethod: validated.paymentMethod,
      isGiftWrapped: validated.isGiftWrapped,
      items: validated.items as CheckoutItemDTO[] | undefined,
      cartContext,
    });

    return apiSuccess(calculation, "Checkout financials calculated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

