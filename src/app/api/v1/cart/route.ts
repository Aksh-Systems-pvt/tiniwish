import { apiSuccess, handleApiError } from "@/lib/api-response";
import { cartService } from "@/services/cart.service";
import { resolveCartContext, attachCartSessionCookie } from "@/lib/cart-session";

/**
 * GET /api/v1/cart
 * Retrieves the current user's or guest's cart with live server calculations.
 */
export async function GET(request: Request) {
  try {
    const ctx = await resolveCartContext(request);
    const cart = await cartService.getCart({
      userId: ctx.userId,
      sessionToken: ctx.sessionToken,
    });

    const response = apiSuccess(cart, "Cart retrieved successfully");
    if (ctx.isNewSession) {
      attachCartSessionCookie(response, ctx.sessionToken);
    }
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/v1/cart
 * Clears all items and applied coupon from the current cart.
 */
export async function DELETE(request: Request) {
  try {
    const ctx = await resolveCartContext(request);
    const cart = await cartService.clearCart({
      userId: ctx.userId,
      sessionToken: ctx.sessionToken,
    });

    return apiSuccess(cart, "Cart cleared successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

