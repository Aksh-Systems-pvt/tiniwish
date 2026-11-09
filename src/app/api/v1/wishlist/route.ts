import { NextRequest } from "next/server";
import { wishlistService } from "@/services/wishlist.service";
import {
  resolveWishlistContext,
  attachWishlistSessionCookie,
} from "@/lib/wishlist-session";
import { apiSuccess, handleApiError } from "@/lib/api-response";

/**
 * GET /api/v1/wishlist
 * Retrieves caller's wishlist (guest or authenticated user).
 */
export async function GET(request: NextRequest) {
  try {
    const ctx = await resolveWishlistContext(request);
    const wishlist = await wishlistService.getWishlist({
      userId: ctx.userId,
      sessionToken: ctx.sessionToken,
    });

    const response = apiSuccess(wishlist);
    if (ctx.isNewSession) {
      attachWishlistSessionCookie(response, ctx.sessionToken);
    }
    return response;
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * DELETE /api/v1/wishlist
 * Clears caller's wishlist.
 */
export async function DELETE(request: NextRequest) {
  try {
    const ctx = await resolveWishlistContext(request);
    const wishlist = await wishlistService.clearWishlist({
      userId: ctx.userId,
      sessionToken: ctx.sessionToken,
    });

    const response = apiSuccess(wishlist, { message: "Wishlist cleared" });
    if (ctx.isNewSession) {
      attachWishlistSessionCookie(response, ctx.sessionToken);
    }
    return response;
  } catch (err) {
    return handleApiError(err);
  }
}

