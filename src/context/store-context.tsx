"use client";

import React, { createContext, useContext, useState, useEffect, useSyncExternalStore } from "react";
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

interface StoreContextType {
  cart: CartItem[];
  wishlist: WishlistItem[];
  cartCount: number;
  wishlistCount: number;
  cartTotal: number;
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
  isWishlisted: (productId: string) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_STORAGE_KEY = "tiniwish_cart_v1";
const WISHLIST_STORAGE_KEY = "tiniwish_wishlist_v1";
const GIFT_STORAGE_KEY = "tiniwish_gift_options_v1";

// External mount store ensures SSR and client initial hydration snapshots match (both false)
let isClientMounted = false;
const hydrationListeners = new Set<() => void>();

function subscribeHydration(onStoreChange: () => void) {
  hydrationListeners.add(onStoreChange);
  return () => {
    hydrationListeners.delete(onStoreChange);
  };
}

function getHydrationSnapshot() {
  return isClientMounted;
}

function getServerHydrationSnapshot() {
  return false;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Guaranteed identical on SSR and initial client hydration (both return false)
  const isHydrated = useSyncExternalStore(
    subscribeHydration,
    getHydrationSnapshot,
    getServerHydrationSnapshot
  );

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [giftOptions, setGiftOptions] = useState<GiftOptions>(() => {
    if (typeof window === "undefined") return DEFAULT_GIFT_OPTIONS;
    try {
      const saved = localStorage.getItem(GIFT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_GIFT_OPTIONS;
    } catch {
      return DEFAULT_GIFT_OPTIONS;
    }
  });

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);
  const toggleCartDrawer = () => setIsCartDrawerOpen((prev) => !prev);

  const updateGiftOptions = (options: Partial<GiftOptions>) => {
    setGiftOptions((prev) => ({ ...prev, ...options }));
  };

  // Notify store subscribers post-mount without calling setState inside effect body
  useEffect(() => {
    if (!isClientMounted) {
      isClientMounted = true;
      hydrationListeners.forEach((listener) => listener());
    }
  }, []);

  // Save changes to localStorage only after hydration to avoid premature writes
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
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (item: WishlistItem) => {
    const exists = wishlist.some((w) => w.productId === item.productId);
    if (exists) {
      setWishlist((prev) => prev.filter((w) => w.productId !== item.productId));
      toast.info("Removed from Wishlist", `${item.title} has been removed.`);
    } else {
      setWishlist((prev) => [...prev, item]);
      toast.success("Saved to Wishlist", `${item.title} has been added to your wishes.`);
    }
  };

  const cartCount = isHydrated ? cart.reduce((total, item) => total + item.quantity, 0) : 0;
  const wishlistCount = isHydrated ? wishlist.length : 0;
  const cartTotal = isHydrated ? cart.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0;

  const isWishlisted = (productId: string) => {
    return isHydrated && wishlist.some((w) => w.productId === productId);
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        cartCount,
        wishlistCount,
        cartTotal,
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
