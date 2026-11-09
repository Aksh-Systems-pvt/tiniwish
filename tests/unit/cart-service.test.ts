import { describe, it, expect } from "vitest";
import { cartService } from "@/services/cart.service";
import { BadRequestError, NotFoundError } from "@/lib/errors";

describe("Shopping Cart Service Unit Tests", () => {
  const guestCtx = { sessionToken: "guest_test_token_001" };

  it("adds product variant to cart and calculates server totals", async () => {
    // var_noor_gold_emerald: price 3299
    const cart = await cartService.addItem(guestCtx, {
      variantId: "var_noor_gold_emerald",
      quantity: 1,
    });

    expect(cart.items.length).toBe(1);
    expect(cart.items[0].variantId).toBe("var_noor_gold_emerald");
    expect(cart.items[0].price).toBe(3299);
    expect(cart.items[0].quantity).toBe(1);
    expect(cart.items[0].isAvailable).toBe(true);
    expect(cart.calculation.subtotal).toBe(3299);
    expect(cart.calculation.isFreeShipping).toBe(true);
    expect(cart.calculation.grandTotal).toBe(3299);
  });

  it("prevents duplicate items by incrementing quantity for existing variant", async () => {
    const cart = await cartService.addItem(guestCtx, {
      variantId: "var_noor_gold_emerald",
      quantity: 2,
    });

    // Should still have 1 line item, with quantity = 1 + 2 = 3
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].quantity).toBe(3);
    expect(cart.calculation.subtotal).toBe(3299 * 3);
  });

  it("updates item quantity with bounds checking", async () => {
    const currentCart = await cartService.getCart(guestCtx);
    const itemId = currentCart.items[0].id;

    const updated = await cartService.updateQuantity(guestCtx, itemId, 5);
    expect(updated.items[0].quantity).toBe(5);
    expect(updated.calculation.subtotal).toBe(3299 * 5);
  });

  it("removes item when quantity is updated to 0", async () => {
    const currentCart = await cartService.getCart(guestCtx);
    const itemId = currentCart.items[0].id;

    const updated = await cartService.updateQuantity(guestCtx, itemId, 0);
    expect(updated.items.length).toBe(0);
    expect(updated.itemCount).toBe(0);
  });

  it("prevents negative quantities", async () => {
    // Add an item first
    const cart = await cartService.addItem(guestCtx, {
      variantId: "var_noor_gold_ruby",
      quantity: 1,
    });
    const itemId = cart.items[0].id;

    await expect(
      cartService.updateQuantity(guestCtx, itemId, -1)
    ).rejects.toThrow(BadRequestError);
  });

  it("prevents purchasing more than available stock", async () => {
    // var_noor_gold_ruby has stock of 12
    await expect(
      cartService.addItem(guestCtx, {
        variantId: "var_noor_gold_ruby",
        quantity: 999,
      })
    ).rejects.toThrow(/available in stock/i);
  });

  it("rejects non-existent variant ID", async () => {
    await expect(
      cartService.addItem(guestCtx, {
        variantId: "non_existent_variant_xyz",
        quantity: 1,
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("applies valid coupon and updates financial discount", async () => {
    const cart = await cartService.applyCoupon(guestCtx, "TINIWISH10");
    expect(cart.appliedCoupon).not.toBeNull();
    expect(cart.appliedCoupon?.code).toBe("TINIWISH10");
    expect(cart.calculation.discountAmount).toBeGreaterThan(0);
    expect(cart.calculation.grandTotal).toBe(
      cart.calculation.subtotal - cart.calculation.discountAmount + cart.calculation.shippingFee
    );
  });

  it("removes applied coupon from cart", async () => {
    const cart = await cartService.removeCoupon(guestCtx);
    expect(cart.appliedCoupon).toBeNull();
    expect(cart.calculation.discountAmount).toBe(0);
  });

  it("merges guest cart into authenticated user cart after login", async () => {
    const uniqueGuestToken = `guest_merge_test_${Date.now()}`;
    const uniqueUserId = `user_merge_test_${Date.now()}`;

    // 1. Add item to guest cart
    await cartService.addItem(
      { sessionToken: uniqueGuestToken },
      { variantId: "var_noor_gold_emerald", quantity: 2 }
    );

    // 2. User has an existing cart with a different variant
    await cartService.addItem(
      { userId: uniqueUserId },
      { variantId: "var_chandrika_antique_gold", quantity: 1 }
    );

    // 3. Merge guest cart into user cart
    const mergedCart = await cartService.mergeGuestCart(uniqueUserId, uniqueGuestToken);

    // User cart should now have both variants
    expect(mergedCart.items.length).toBe(2);
    expect(mergedCart.items.some((i) => i.variantId === "var_noor_gold_emerald")).toBe(true);
    expect(mergedCart.items.some((i) => i.variantId === "var_chandrika_antique_gold")).toBe(true);
  });

  it("empties the cart completely", async () => {
    const cart = await cartService.clearCart(guestCtx);
    expect(cart.items.length).toBe(0);
    expect(cart.itemCount).toBe(0);
    expect(cart.calculation.subtotal).toBe(0);
  });
});
