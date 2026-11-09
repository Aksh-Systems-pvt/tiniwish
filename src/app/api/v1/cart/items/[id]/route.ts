import { z } from "zod";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { validateRequestBody } from "@/lib/validation";
import { cartService } from "@/services/cart.service";
import { resolveCartContext, attachCartSessionCookie } from "@/lib/cart-session";

const updateQuantitySchema = z.object({
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/cart/items/[id]
 * Updates item quantity with stock validation.
 */
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await validateRequestBody(request, updateQuantitySchema);
    const ctx = await resolveCartContext(request);

    const cart = await cartService.updateQuantity(
      {
        userId: ctx.userId,
        sessionToken: ctx.sessionToken,
      },
      id,
      body.quantity
    );

    const response = apiSuccess(cart, "Cart item updated successfully");
    if (ctx.isNewSession) {
      attachCartSessionCookie(response, ctx.sessionToken);
    }
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/v1/cart/items/[id]
 * Removes an item from the cart.
 */
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const ctx = await resolveCartContext(request);

    const cart = await cartService.removeItem(
      {
        userId: ctx.userId,
        sessionToken: ctx.sessionToken,
      },
      id
    );

    const response = apiSuccess(cart, "Item removed from cart successfully");
    if (ctx.isNewSession) {
      attachCartSessionCookie(response, ctx.sessionToken);
    }
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

