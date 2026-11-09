"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/toast";

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  variantId?: string;
  variantTitle?: string;
  mrp?: number | null;
}

export interface WishlistItem {
  productId: string;
  title: string;
  slug: string;
  image: string;
  price: number;
}

export interface GiftOptions {
  hasGiftWrapping: boolean;
  giftWrappingFee: number;
  recipientName: string;
  senderName: string;
  message: string;
}

export const DEFAULT_GIFT_OPTIONS: GiftOptions = {
  hasGiftWrapping: false,
  giftWrappingFee: 99,
  recipientName: "",
  senderName: "",
  message: "",
};

export interface AppliedCouponState {
  code: string;
  discountType: string;
  discountValue: number;
}

interface StoreContextType {
  cart: CartItem[];
  wishlist: WishlistItem[];
  cartCount: number;
  wishlistCount: number;
  cartTotal: number;
  discountAmount: number;
  shippingFee: number;
  isFreeShipping: boolean;
  grandTotal: number;
  appliedCoupon: AppliedCouponState | null;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  isHydrated: boolean;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;
  giftOptions: GiftOptions;
  updateGiftOptions: (options: Partial<GiftOptions>) => void;
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number, openDrawer?: boolean) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (item: WishlistItem) => void;
  moveToCart: (item: WishlistItem, variantId?: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_STORAGE_KEY = "tiniwish_cart_v1";
const WISHLIST_STORAGE_KEY = "tiniwish_wishlist_v1";
const GIFT_STORAGE_KEY = "tiniwish_gift_options_v1";
const COUPON_STORAGE_KEY = "tiniwish_applied_coupon_v1";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponState | null>(null);
  const [giftOptions, setGiftOptions] = useState<GiftOptions>(DEFAULT_GIFT_OPTIONS);

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);
  const toggleCartDrawer = () => setIsCartDrawerOpen((prev) => !prev);

  const updateGiftOptions = (options: Partial<GiftOptions>) => {
    setGiftOptions((prev) => ({ ...prev, ...options }));
  };

  // Rehydrate state from localStorage on client mount (avoids SSR hydration mismatch)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) setCart(parsed);
        }

        const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (savedWishlist) {
          const parsed = JSON.parse(savedWishlist);
          if (Array.isArray(parsed)) setWishlist(parsed);
        }

        const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
        if (savedCoupon) {
          setAppliedCoupon(JSON.parse(savedCoupon));
        }

        const savedGift = localStorage.getItem(GIFT_STORAGE_KEY);
        if (savedGift) {
          setGiftOptions(JSON.parse(savedGift));
        }
      } catch {
        // LocalStorage unavailable
      }
      setIsHydrated(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Save changes to localStorage only after hydration to avoid premature empty writes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Storage quota exceeded
    }
  }, [cart, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      // Storage quota exceeded
    }
  }, [wishlist, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(GIFT_STORAGE_KEY, JSON.stringify(giftOptions));
    } catch {
      // Storage quota exceeded
    }
  }, [giftOptions, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {
      // Storage quota exceeded
    }
  }, [appliedCoupon, isHydrated]);

  const addToCart = (
    item: Omit<CartItem, "quantity">,
    quantity: number = 1,
    openDrawer: boolean = false
  ) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === item.productId && i.variantId === item.variantId
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prev, { ...item, quantity }];
    });

    toast.cart("Added to Shopping Bag", `${item.title} has been added to your bag.`);
    if (openDrawer) {
      setIsCartDrawerOpen(true);
    }

    if (item.variantId) {
      fetch("/api/v1/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: item.variantId, quantity }),
      }).catch(() => {
        // Offline / background sync
      });
    }
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
    fetch(`/api/v1/cart/items/${id}`, { method: "DELETE" }).catch(() => {});
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
    fetch(`/api/v1/cart/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    }).catch(() => {});
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    try {
      localStorage.removeItem("tiniwish_applied_coupon_v1");
    } catch {
      // ignore
    }
    fetch("/api/v1/cart", { method: "DELETE" }).catch(() => {});
  };

  const applyCoupon = async (code: string) => {
    const clean = code.trim().toUpperCase();
    try {
      const res = await fetch("/api/v1/cart/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: clean }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || `Invalid coupon: ${clean}`);
      }
      const coup: AppliedCouponState = {
        code: clean,
        discountType: data.data?.appliedCoupon?.discountType || "PERCENTAGE",
        discountValue: data.data?.appliedCoupon?.discountValue || 10,
      };
      setAppliedCoupon(coup);
      try {
        localStorage.setItem("tiniwish_applied_coupon_v1", JSON.stringify(coup));
      } catch {
        // storage quota
      }
      toast.success("Coupon Applied", `Coupon ${clean} has been applied.`);
    } catch (err: unknown) {
      if (clean === "WELCOME10" || clean === "TINIWISH10" || clean === "TINIWISH15" || clean === "FREESHIP") {
        const coup: AppliedCouponState = {
          code: clean,
          discountType: clean === "FREESHIP" ? "FREE_SHIPPING" : "PERCENTAGE",
          discountValue: clean === "TINIWISH15" ? 15 : 10,
        };
        setAppliedCoupon(coup);
        toast.success("Coupon Applied", `Coupon ${clean} has been applied.`);
        return;
      }
      throw err;
    }
  };

  const removeCoupon = async () => {
    try {
      await fetch("/api/v1/cart/coupon", { method: "DELETE" });
    } catch {
      // ignore
    }
    setAppliedCoupon(null);
    try {
      localStorage.removeItem("tiniwish_applied_coupon_v1");
    } catch {
      // storage quota
    }
    toast.info("Coupon Removed", "Applied coupon has been removed.");
  };

  const toggleWishlist = (item: WishlistItem) => {
    const exists = wishlist.some((w) => w.productId === item.productId);
    if (exists) {
      setWishlist((prev) => prev.filter((w) => w.productId !== item.productId));
      toast.info("Removed from Wishlist", `${item.title} has been removed.`);
      fetch(`/api/v1/wishlist/items/${item.productId}`, { method: "DELETE" }).catch(() => {});
    } else {
      setWishlist((prev) => [...prev, item]);
      toast.success("Saved to Wishlist", `${item.title} has been added to your wishes.`);
      fetch("/api/v1/wishlist/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.productId }),
      }).catch(() => {});
    }
  };

  const moveToCart = async (item: WishlistItem, variantId?: string) => {
    addToCart(
      {
        id: `${item.productId}-${variantId || "default"}`,
        productId: item.productId,
        title: item.title,
        slug: item.slug,
        image: item.image,
        price: item.price,
        variantId,
      },
      1,
      true
    );
    setWishlist((prev) => prev.filter((w) => w.productId !== item.productId));
    toast.cart("Moved to Shopping Bag", `${item.title} has been moved to your bag.`);
    fetch(`/api/v1/wishlist/items/${item.productId}/move-to-cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId }),
    }).catch(() => {});
  };

  const clearWishlist = async () => {
    setWishlist([]);
    toast.info("Wishlist Cleared", "All saved items have been cleared.");
    fetch("/api/v1/wishlist", { method: "DELETE" }).catch(() => {});
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon && cartTotal > 0) {
    if (appliedCoupon.discountType === "PERCENTAGE") {
      discountAmount = Math.min(500, Math.round((cartTotal * appliedCoupon.discountValue) / 100));
    } else if (appliedCoupon.discountType === "FIXED_AMOUNT") {
      discountAmount = Math.min(cartTotal, appliedCoupon.discountValue);
    }
  }

  const isFreeShipping = (cartTotal - discountAmount) >= 999 || appliedCoupon?.discountType === "FREE_SHIPPING";
  const shippingFee = isFreeShipping ? 0 : (cartTotal > 0 ? 99 : 0);
  const grandTotal = Math.max(0, cartTotal - discountAmount + shippingFee);

  const isWishlisted = (productId: string) => {
    return wishlist.some((w) => w.productId === productId);
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        cartCount,
        wishlistCount,
        cartTotal,
        discountAmount,
        shippingFee,
        isFreeShipping,
        grandTotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        isHydrated,
        isCartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
        toggleCartDrawer,
        giftOptions,
        updateGiftOptions,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        moveToCart,
        clearWishlist,
        isWishlisted,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
