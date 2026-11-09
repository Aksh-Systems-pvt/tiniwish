import { z } from "zod";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { validateRequestBody } from "@/lib/validation";
import { cartService } from "@/services/cart.service";
import { resolveCartContext, attachCartSessionCookie } from "@/lib/cart-session";

const addItemSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").default(1),
});

/**
 * POST /api/v1/cart/items
 * Adds a product variant to the current cart.
 * Prevents duplicate items by incrementing quantity up to available inventory.
 */
export async function POST(request: Request) {
  try {
    const body = await validateRequestBody(request, addItemSchema);
    const ctx = await resolveCartContext(request);

    const cart = await cartService.addItem(
      {
        userId: ctx.userId,
        sessionToken: ctx.sessionToken,
      },
      {
        variantId: body.variantId,
        quantity: body.quantity,
      }
    );

    const response = apiSuccess(cart, "Item added to cart successfully", 201);
    if (ctx.isNewSession) {
      attachCartSessionCookie(response, ctx.sessionToken);
    }
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

