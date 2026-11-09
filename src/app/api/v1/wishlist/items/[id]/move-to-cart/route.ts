import { NextRequest } from "next/server";
import { wishlistService } from "@/services/wishlist.service";
import {
  resolveWishlistContext,
  attachWishlistSessionCookie,
} from "@/lib/wishlist-session";
import { apiSuccess, handleApiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/wishlist/items/[id]/move-to-cart
 * Moves a saved product from wishlist to shopping cart.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: productId } = await params;
    const ctx = await resolveWishlistContext(request);
    const body = await request.json().catch(() => ({}));
    const { variantId } = body;

    const result = await wishlistService.moveToCart(
      {
        userId: ctx.userId,
        sessionToken: ctx.sessionToken,
      },
      productId,
      variantId
    );

    const response = apiSuccess(result, {
      message: `${result.movedItem.title} moved to shopping bag`,
    });

    if (ctx.isNewSession) {
      attachWishlistSessionCookie(response, ctx.sessionToken);
    }

    return response;
  } catch (err) {
    return handleApiError(err);
  }
}

