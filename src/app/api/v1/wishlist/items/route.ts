import { NextRequest } from "next/server";
import { wishlistService } from "@/services/wishlist.service";
import {
  resolveWishlistContext,
  attachWishlistSessionCookie,
} from "@/lib/wishlist-session";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { BadRequestError } from "@/lib/errors";

/**
 * POST /api/v1/wishlist/items
 * Adds a product to caller's wishlist.
 */
export async function POST(request: NextRequest) {
  try {
    const ctx = await resolveWishlistContext(request);
    const body = await request.json().catch(() => ({}));
    const { productId } = body;

    if (!productId || typeof productId !== "string") {
      throw new BadRequestError("productId string is required in request body");
    }

    const wishlist = await wishlistService.addItem(
      {
        userId: ctx.userId,
        sessionToken: ctx.sessionToken,
      },
      productId
    );

    const response = apiSuccess(wishlist, {
      status: 201,
      message: "Product added to wishlist",
    });

    if (ctx.isNewSession) {
      attachWishlistSessionCookie(response, ctx.sessionToken);
    }

    return response;
  } catch (err) {
    return handleApiError(err);
  }
}

