import { z } from "zod";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { validateRequestBody } from "@/lib/validation";
import { requireAuth } from "@/lib/auth";
import { cartService } from "@/services/cart.service";

const mergeCartSchema = z.object({
  sessionToken: z.string().min(1, "Guest session token is required"),
});

/**
 * POST /api/v1/cart/merge
 * Merges items from a guest session cart into the authenticated customer's cart.
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    const body = await validateRequestBody(request, mergeCartSchema);

    const cart = await cartService.mergeGuestCart(user.id, body.sessionToken);

    return apiSuccess(cart, "Cart merged successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

