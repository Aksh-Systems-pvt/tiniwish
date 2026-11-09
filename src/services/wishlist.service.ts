import { wishlistRepository, WishlistRepository } from "@/repositories/wishlist.repository";
import { productRepository } from "@/repositories/product.repository";
import { cartService } from "@/services/cart.service";
import { WishlistDTO, MoveToCartResultDTO } from "@/types/wishlist";
import { NotFoundError, BadRequestError } from "@/lib/errors";

export interface WishlistContext {
  userId?: string | null;
  sessionToken?: string | null;
}

export class WishlistService {
  constructor(private repo: WishlistRepository = wishlistRepository) {}

  /**
   * Retrieves the current customer's or guest's wishlist.
   */
  async getWishlist(ctx: WishlistContext): Promise<WishlistDTO> {
    this.assertValidContext(ctx);
    return this.repo.getWishlist(ctx);
  }

  /**
   * Adds a product to the wishlist.
   */
  async addItem(ctx: WishlistContext, productId: string): Promise<WishlistDTO> {
    this.assertValidContext(ctx);

    if (!productId || typeof productId !== "string") {
      throw new BadRequestError("productId is required to add to wishlist");
    }

    // Verify product exists and is not archived
    const product = await productRepository.findById(productId);
    if (!product || product.isArchived) {
      throw new NotFoundError(`Product with id '${productId}' not found`);
    }

    const wishlistId = await this.repo.getOrCreateWishlist(ctx);
    return this.repo.addItem(wishlistId, productId);
  }

  /**
   * Removes a product from the wishlist.
   */
  async removeItem(ctx: WishlistContext, productId: string): Promise<WishlistDTO> {
    this.assertValidContext(ctx);

    if (!productId || typeof productId !== "string") {
      throw new BadRequestError("productId is required to remove from wishlist");
    }

    const wishlistId = await this.repo.getOrCreateWishlist(ctx);
    return this.repo.removeItem(wishlistId, productId);
  }

  /**
   * Clears the wishlist completely.
   */
  async clearWishlist(ctx: WishlistContext): Promise<WishlistDTO> {
    this.assertValidContext(ctx);
    const wishlistId = await this.repo.getOrCreateWishlist(ctx);
    return this.repo.clearWishlist(wishlistId);
  }

  /**
   * Moves a saved wishlist product directly into the customer's cart.
   * 1. Resolves default or requested variant.
   * 2. Adds the variant to the cart.
   * 3. Removes the product from the wishlist.
   */
  async moveToCart(
    ctx: WishlistContext,
    productId: string,
    variantId?: string
  ): Promise<MoveToCartResultDTO> {
    this.assertValidContext(ctx);

    const product = await productRepository.findById(productId);
    if (!product || product.isArchived) {
      throw new NotFoundError(`Product with id '${productId}' not found`);
    }

    // Determine target variant
    let targetVariant = product.variants.find((v) => v.id === variantId);
    if (!targetVariant) {
      targetVariant = product.variants.find((v) => v.isDefault) || product.variants[0];
    }

    if (!targetVariant) {
      throw new BadRequestError(`No active variants available for product '${product.title}'`);
    }

    // Add to cart with requested quantity (1)
    await cartService.addItem(
      {
        userId: ctx.userId,
        sessionToken: ctx.sessionToken,
      },
      {
        variantId: targetVariant.id,
        quantity: 1,
      }
    );

    // Remove from wishlist
    const updatedWishlist = await this.removeItem(ctx, productId);

    return {
      wishlist: updatedWishlist,
      movedItem: {
        productId: product.id,
        variantId: targetVariant.id,
        title: product.title,
      },
    };
  }

  /**
   * Merges guest wishlist into user's authenticated account upon login.
   */
  async mergeGuestWishlist(userId: string, guestSessionToken: string): Promise<WishlistDTO> {
    if (!userId) {
      throw new BadRequestError("userId is required for merging wishlist");
    }
    if (!guestSessionToken) {
      return this.getWishlist({ userId });
    }

    return this.repo.mergeGuestWishlist(userId, guestSessionToken);
  }

  private assertValidContext(ctx: WishlistContext): void {
    if (!ctx.userId && !ctx.sessionToken) {
      throw new BadRequestError(
        "A valid customer identity (userId) or guest sessionToken must be provided"
      );
    }
  }
}

export const wishlistService = new WishlistService();

