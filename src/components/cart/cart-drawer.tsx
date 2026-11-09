"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Truck,
  ArrowRight,
  Tag,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/context/store-context";

export function CartDrawer() {
  const router = useRouter();
  const {
    cart,
    cartCount,
    cartTotal,
    isCartDrawerOpen,
    closeCartDrawer,
    updateQuantity,
    removeFromCart,
    appliedCoupon,
    discountAmount,
    shippingFee,
    isFreeShipping,
    grandTotal,
    applyCoupon,
    removeCoupon,
  } = useStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const remainingForFreeShipping = Math.max(0, 999 - (cartTotal - discountAmount));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponError("");
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput("");
    } catch (err: unknown) {
      setCouponError((err as Error)?.message || "Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
    } catch {
      // Ignored
    }
  };

  const handleCheckoutClick = () => {
    closeCartDrawer();
    router.push("/checkout");
  };

  const handleViewCartClick = () => {
    closeCartDrawer();
    router.push("/cart");
  };

  return (
    <Sheet open={isCartDrawerOpen} onOpenChange={(open) => !open && closeCartDrawer()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-white p-0 flex flex-col justify-between overflow-hidden shadow-2xl border-l border-champagne/60"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-champagne/40 bg-primary-bg/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-muted-gold" />
            <SheetTitle className="font-serif text-lg text-charcoal font-medium">
              Shopping Bag ({cartCount})
            </SheetTitle>
          </div>
          <button
            type="button"
            onClick={closeCartDrawer}
            className="p-1 rounded-full text-dark-brown/60 hover:text-charcoal hover:bg-champagne/30 transition-colors cursor-pointer"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Strip */}
        {cart.length > 0 && (
          <div className="px-5 py-3 bg-secondary-bg/50 border-b border-champagne/40 text-xs">
            <div className="flex items-center justify-between text-charcoal font-medium mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-muted-gold" />
                {isFreeShipping ? (
                  <span className="text-emerald-800 font-semibold">
                    You unlocked Complimentary Express Delivery!
                  </span>
                ) : (
                  <span>
                    Add ₹{remainingForFreeShipping.toLocaleString("en-IN")} more for Free Delivery
                  </span>
                )}
              </span>
              <span className="text-[10px] text-dark-brown/60">₹999 Tier</span>
            </div>
            <div className="w-full h-1.5 bg-champagne/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-muted-gold transition-all duration-300 rounded-full"
                style={{
                  width: `${Math.min(100, Math.round(((cartTotal - discountAmount) / 999) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-secondary-bg/60">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary-bg flex items-center justify-center text-muted-gold">
                <ShoppingBag className="w-8 h-8 opacity-75" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-lg text-charcoal font-medium">
                  Your bag is currently empty
                </h4>
                <p className="text-xs text-dark-brown/65 max-w-xs leading-relaxed">
                  Discover handcrafted Kundan jewellery, charming celebration gifts, and timeless accents.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => {
                  closeCartDrawer();
                  router.push("/products");
                }}
                className="rounded-lg bg-charcoal text-white hover:bg-muted-gold text-xs uppercase tracking-wider px-6 py-2.5 font-medium transition-colors"
              >
                <span>Explore Treasures</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="py-4 flex gap-3.5 first:pt-0 last:pb-0">
                {/* 3:4 Thumbnail */}
                <div className="relative w-16 h-20 rounded-md overflow-hidden bg-secondary-bg/50 shrink-0 border border-champagne/40">
                  <Image
                    src={item.image || "/images/placeholder.jpg"}
                    alt={item.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCartDrawer}
                        className="font-serif text-sm text-charcoal hover:text-muted-gold transition-colors line-clamp-1 font-medium"
                      >
                        {item.title}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-dark-brown/40 hover:text-red-700 p-0.5 transition-colors cursor-pointer shrink-0"
                        aria-label={`Remove ${item.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.variantTitle && (
                      <span className="text-[11px] text-dark-brown/60 block mt-0.5 truncate">
                        {item.variantTitle}
                      </span>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-charcoal">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                      {item.mrp && item.mrp > item.price && (
                        <span className="text-[10px] text-dark-brown/50 line-through">
                          ₹{item.mrp.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls & Stock Availability */}
                  <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-secondary-bg/40">
                    <div className="flex items-center border border-champagne/80 rounded-md bg-white">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-dark-brown/60 hover:text-charcoal hover:bg-secondary-bg transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-medium text-charcoal select-none">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-dark-brown/60 hover:text-charcoal hover:bg-secondary-bg transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-[10px] text-emerald-800 font-medium">In Stock</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer with Financial Summary & Checkout */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-champagne/40 bg-primary-bg/30 space-y-4 shrink-0">
            {/* Promo Code Strip */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Coupon &lsquo;{appliedCoupon.code}&rsquo; Applied (-₹{discountAmount})</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-emerald-700 hover:text-red-700 p-0.5 cursor-pointer"
                    aria-label="Remove applied coupon"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-1.5">
                  <Input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon (e.g. TINIWISH10)"
                    className="h-9 text-xs uppercase placeholder:normal-case bg-white border-champagne"
                  />
                  <Button
                    type="submit"
                    disabled={couponLoading || !couponInput.trim()}
                    variant="outline"
                    className="h-9 px-4 text-xs font-medium border-champagne text-charcoal hover:bg-muted-gold hover:text-white"
                  >
                    {couponLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
                  </Button>
                </form>
              )}
              {couponError && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{couponError}</span>
                </p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-dark-brown/80 pt-2 border-t border-champagne/30">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-charcoal">₹{cartTotal.toLocaleString("en-IN")}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span>
                  {isFreeShipping ? (
                    <span className="text-emerald-700 font-semibold uppercase text-[10px]">FREE</span>
                  ) : (
                    <span>₹{shippingFee}</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-dark-brown/60">
                <span>Statutory GST (Taxes)</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between text-sm font-serif font-medium text-charcoal pt-2 border-t border-champagne/40">
                <span>Grand Total</span>
                <span className="text-base text-charcoal font-sans font-bold">
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <Button
                type="button"
                onClick={handleCheckoutClick}
                className="w-full h-11 rounded-lg bg-charcoal text-white hover:bg-muted-gold text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <button
                type="button"
                onClick={handleViewCartClick}
                className="w-full text-center text-xs text-dark-brown/75 hover:text-charcoal py-1 transition-colors underline font-medium"
              >
                View Full Bag Details
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
