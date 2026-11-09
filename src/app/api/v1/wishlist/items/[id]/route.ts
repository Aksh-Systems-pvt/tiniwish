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
 * DELETE /api/v1/wishlist/items/[id]
 * Removes product from caller's wishlist.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: productId } = await params;
    const ctx = await resolveWishlistContext(request);

    const wishlist = await wishlistService.removeItem(
      {
        userId: ctx.userId,
        sessionToken: ctx.sessionToken,
      },
      productId
    );

    const response = apiSuccess(wishlist, {
      message: "Product removed from wishlist",
    });

    if (ctx.isNewSession) {
      attachWishlistSessionCookie(response, ctx.sessionToken);
    }

    return response;
  } catch (err) {
    return handleApiError(err);
  }
}

