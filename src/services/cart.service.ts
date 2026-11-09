import { cartRepository } from "@/repositories/cart.repository";
import { CartDTO } from "@/types/cart";
import { BadRequestError } from "@/lib/errors";

export interface CartContextParams {
  userId?: string | null;
  sessionToken?: string | null;
}

export class CartService {
  /**
   * Retrieves active cart for logged-in user or guest session.
   */
  async getCart(ctx: CartContextParams): Promise<CartDTO> {
    const cartId = await cartRepository.getOrCreateCart(ctx);
    return cartRepository.getCartById(cartId);
  }

  /**
   * Adds an item variant to cart with server-side inventory verification.
   */
  async addItem(
    ctx: CartContextParams,
    params: { variantId: string; quantity: number }
  ): Promise<CartDTO> {
    if (!params.variantId) {
      throw new BadRequestError("Variant ID is required");
    }
    const quantity = Number(params.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      throw new BadRequestError("Quantity must be a positive integer");
    }

    const cartId = await cartRepository.getOrCreateCart(ctx);
    return cartRepository.addItem(cartId, {
      variantId: params.variantId,
      quantity,
    });
  }

  /**
   * Updates an item's quantity in the cart.
   */
  async updateQuantity(
    ctx: CartContextParams,
    itemId: string,
    quantity: number
  ): Promise<CartDTO> {
    const numQty = Number(quantity);
    if (isNaN(numQty) || numQty < 0) {
      throw new BadRequestError("Quantity cannot be negative");
    }

    const cartId = await cartRepository.getOrCreateCart(ctx);
    return cartRepository.updateQuantity(cartId, itemId, numQty);
  }

  /**
   * Removes an item from the cart.
   */
  async removeItem(ctx: CartContextParams, itemId: string): Promise<CartDTO> {
    const cartId = await cartRepository.getOrCreateCart(ctx);
    return cartRepository.removeItem(cartId, itemId);
  }

  /**
   * Applies promotional coupon code to the cart.
   */
  async applyCoupon(ctx: CartContextParams, code: string): Promise<CartDTO> {
    if (!code || !code.trim()) {
      throw new BadRequestError("Please provide a valid coupon code");
    }

    const cartId = await cartRepository.getOrCreateCart(ctx);
    return cartRepository.applyCoupon(cartId, code.trim());
  }

  /**
   * Removes applied coupon from the cart.
   */
  async removeCoupon(ctx: CartContextParams): Promise<CartDTO> {
    const cartId = await cartRepository.getOrCreateCart(ctx);
    return cartRepository.removeCoupon(cartId);
  }

  /**
   * Empties the cart.
   */
  async clearCart(ctx: CartContextParams): Promise<CartDTO> {
    const cartId = await cartRepository.getOrCreateCart(ctx);
    return cartRepository.clearCart(cartId);
  }

  /**
   * Merges a guest cart into the authenticated user's cart upon login.
   */
  async mergeGuestCart(userId: string, guestSessionToken: string): Promise<CartDTO> {
    if (!userId) {
      throw new BadRequestError("User ID required for cart merge");
    }
    if (!guestSessionToken) {
      return this.getCart({ userId });
    }

    return cartRepository.mergeGuestCartIntoUserCart({
      userId,
      guestSessionToken,
    });
  }
}

export const cartService = new CartService();

