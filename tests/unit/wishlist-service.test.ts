import { describe, it, expect, beforeEach } from "vitest";
import { wishlistService } from "@/services/wishlist.service";
import { cartService } from "@/services/cart.service";
import { BadRequestError, NotFoundError } from "@/lib/errors";

describe("Wishlist Service Unit Tests", () => {
  const guestCtxA = { sessionToken: "guest_session_user_A" };
  const guestCtxB = { sessionToken: "guest_session_user_B" };
  const authUserCtxA = { userId: "user_uuid_auth_A" };
  const authUserCtxB = { userId: "user_uuid_auth_B" };

  beforeEach(async () => {
    await wishlistService.clearWishlist(guestCtxA);
    await wishlistService.clearWishlist(guestCtxB);
    await wishlistService.clearWishlist(authUserCtxA);
    await wishlistService.clearWishlist(authUserCtxB);
  });

  describe("Guest Wishlist Operations", () => {
    it("adds a product to guest wishlist", async () => {
      const wishlist = await wishlistService.addItem(guestCtxA, "prod_kundan_choker");
      expect(wishlist.items.length).toBe(1);
      expect(wishlist.items[0].productId).toBe("prod_kundan_choker");
      expect(wishlist.itemCount).toBe(1);
      expect(wishlist.items[0].title).toBe("Noor Meenakari & Kundan Choker Necklace Set");
    });

    it("prevents duplicate products in guest wishlist", async () => {
      await wishlistService.addItem(guestCtxA, "prod_kundan_choker");
      const wishlist = await wishlistService.addItem(guestCtxA, "prod_kundan_choker");

      expect(wishlist.items.length).toBe(1);
      expect(wishlist.itemCount).toBe(1);
    });

    it("removes product from guest wishlist", async () => {
      await wishlistService.addItem(guestCtxA, "prod_kundan_choker");
      await wishlistService.addItem(guestCtxA, "prod_polki_jhumka");

      const updated = await wishlistService.removeItem(guestCtxA, "prod_kundan_choker");
      expect(updated.items.length).toBe(1);
      expect(updated.items[0].productId).toBe("prod_polki_jhumka");
    });
  });

  describe("Customer Data Protection & Tenant Isolation", () => {
    it("never exposes Guest A's wishlist to Guest B", async () => {
      await wishlistService.addItem(guestCtxA, "prod_kundan_choker");

      const wishlistB = await wishlistService.getWishlist(guestCtxB);
      expect(wishlistB.items.length).toBe(0);
      expect(wishlistB.items.some((i) => i.productId === "prod_kundan_choker")).toBe(false);
    });

    it("never exposes User A's wishlist to User B", async () => {
      await wishlistService.addItem(authUserCtxA, "prod_brass_peacock_diya");

      const wishlistB = await wishlistService.getWishlist(authUserCtxB);
      expect(wishlistB.items.length).toBe(0);
      expect(wishlistB.items.some((i) => i.productId === "prod_brass_peacock_diya")).toBe(false);
    });

    it("rejects operations without valid customer identity or sessionToken", async () => {
      await expect(
        wishlistService.addItem({ userId: null, sessionToken: null }, "prod_kundan_choker")
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("Move Wishlist Item to Cart", () => {
    it("moves item from wishlist to cart and removes it from wishlist", async () => {
      await wishlistService.addItem(authUserCtxA, "prod_kundan_choker");

      const result = await wishlistService.moveToCart(
        authUserCtxA,
        "prod_kundan_choker"
      );

      // Wishlist should now be empty
      expect(result.wishlist.items.length).toBe(0);
      expect(result.movedItem.productId).toBe("prod_kundan_choker");

      // Item should now exist in the user's cart
      const cart = await cartService.getCart(authUserCtxA);
      expect(cart.items.some((i) => i.title.includes("Noor"))).toBe(true);
    });
  });

  describe("Merge Wishlist After Login", () => {
    it("merges guest wishlist into authenticated user account upon login", async () => {
      const guestToken = "guest_login_flow_123";
      const userId = "user_account_456";

      // 1. Guest saves items
      await wishlistService.addItem({ sessionToken: guestToken }, "prod_kundan_choker");
      await wishlistService.addItem({ sessionToken: guestToken }, "prod_polki_jhumka");

      // 2. User account already had a different saved item
      await wishlistService.addItem({ userId }, "prod_brass_peacock_diya");

      // 3. User logs in -> trigger merge
      const merged = await wishlistService.mergeGuestWishlist(userId, guestToken);

      expect(merged.items.length).toBe(3);
      expect(merged.items.some((i) => i.productId === "prod_kundan_choker")).toBe(true);
      expect(merged.items.some((i) => i.productId === "prod_polki_jhumka")).toBe(true);
      expect(merged.items.some((i) => i.productId === "prod_brass_peacock_diya")).toBe(true);
    });

    it("deduplicates identical products when merging guest wishlist into user account", async () => {
      const guestToken = "guest_overlap_token";
      const userId = "user_overlap_id";

      // Both guest and user saved the same choker
      await wishlistService.addItem({ sessionToken: guestToken }, "prod_kundan_choker");
      await wishlistService.addItem({ userId }, "prod_kundan_choker");

      const merged = await wishlistService.mergeGuestWishlist(userId, guestToken);
      expect(merged.items.length).toBe(1);
    });
  });

  describe("Validation & Error Contracts", () => {
    it("rejects non-existent product ID", async () => {
      await expect(
        wishlistService.addItem(guestCtxA, "prod_does_not_exist_xyz")
      ).rejects.toThrow(NotFoundError);
    });

    it("rejects empty product ID", async () => {
      await expect(
        wishlistService.addItem(guestCtxA, "")
      ).rejects.toThrow(BadRequestError);
    });
  });
});
