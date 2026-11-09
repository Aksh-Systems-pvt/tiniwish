import { NextRequest } from "next/server";
import { wishlistService } from "@/services/wishlist.service";
import { getAuthUser } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { UnauthorizedError, BadRequestError } from "@/lib/errors";

/**
 * POST /api/v1/wishlist/merge
 * Merges a guest wishlist into an authenticated user's wishlist upon login.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      throw new UnauthorizedError("You must be logged in to merge a wishlist");
    }

    const body = await request.json().catch(() => ({}));
    const { guestSessionToken } = body;

    if (!guestSessionToken || typeof guestSessionToken !== "string") {
      throw new BadRequestError("guestSessionToken is required to merge wishlist");
    }

    const mergedWishlist = await wishlistService.mergeGuestWishlist(
      user.id,
      guestSessionToken
    );

    return apiSuccess(mergedWishlist, {
      message: "Guest wishlist successfully merged into account",
    });
  } catch (err) {
    return handleApiError(err);
  }
}

