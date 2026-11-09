import { z } from "zod";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { validateRequestBody } from "@/lib/validation";
import { cartService } from "@/services/cart.service";
import { resolveCartContext, attachCartSessionCookie } from "@/lib/cart-session";

const applyCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
});

/**
 * POST /api/v1/cart/coupon
 * Applies a promotional coupon to the cart.
 */
export async function POST(request: Request) {
  try {
    const body = await validateRequestBody(request, applyCouponSchema);
    const ctx = await resolveCartContext(request);

    const cart = await cartService.applyCoupon(
      {
        userId: ctx.userId,
        sessionToken: ctx.sessionToken,
      },
      body.code
    );

    const response = apiSuccess(cart, `Coupon '${body.code.toUpperCase()}' applied successfully`);
    if (ctx.isNewSession) {
      attachCartSessionCookie(response, ctx.sessionToken);
    }
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/v1/cart/coupon
 * Removes any applied coupon from the cart.
 */
export async function DELETE(request: Request) {
  try {
    const ctx = await resolveCartContext(request);
    const cart = await cartService.removeCoupon({
      userId: ctx.userId,
      sessionToken: ctx.sessionToken,
    });

    const response = apiSuccess(cart, "Coupon removed successfully");
    if (ctx.isNewSession) {
      attachCartSessionCookie(response, ctx.sessionToken);
    }
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

