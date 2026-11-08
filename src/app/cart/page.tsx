"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/store-context";
import { EmptyCart } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  Plus,
  Minus,
  Gift,
  ShieldCheck,
  Truck,
  ArrowRight,
  Sparkles,
  Tag,
  CheckCircle2,
} from "lucide-react";

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING_FEE = 99;

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount } = useStore();

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");

  const isFreeShipping = cartTotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = isFreeShipping ? 0 : STANDARD_SHIPPING_FEE;
  const progressToFree = Math.min(100, Math.round((cartTotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");

    if (!promoCode.trim()) return;

    if (promoCode.trim().toUpperCase() === "TINIWISH10") {
      setAppliedPromo("TINIWISH10");
      setPromoDiscount(Math.round(cartTotal * 0.1));
      setPromoCode("");
    } else {
      setPromoError("Invalid coupon code. Try TINIWISH10 for 10% off.");
    }
  };

  const finalTotal = Math.max(0, cartTotal - promoDiscount + shippingFee);

  if (cart.length === 0) {
    return (
      <div className="py-16 bg-primary-bg min-h-screen">
        <div className="container mx-auto px-4 max-w-7xl">
          <EmptyCart
            onExplore={() => {
              router.push("/products");
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-8">
        {/* Page Title */}
        <div className="pb-4 border-b border-champagne/40 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl sm:text-4xl text-charcoal font-normal">
              Your Shopping Bag
            </h1>
            <p className="text-xs sm:text-sm text-dark-brown/70 mt-1">
              {cartCount} {cartCount === 1 ? "treasure" : "treasures"} in your curated bag.
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-medium text-charcoal hover:text-muted-gold inline-flex items-center gap-1 transition-colors"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="p-4 bg-white rounded-xl border border-champagne/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 font-medium text-charcoal">
              <Truck className="w-4 h-4 text-muted-gold" />
              {isFreeShipping
                ? "You've unlocked Complimentary Express Delivery!"
                : `Add ₹${remainingForFree.toLocaleString("en-IN")} more for Complimentary Express Delivery.`}
            </span>
            <span className="text-[11px] font-semibold text-muted-gold">
              {progressToFree}%
            </span>
          </div>
          <div className="w-full bg-secondary-bg h-2 rounded-full overflow-hidden">
            <div
              className="bg-muted-gold h-full rounded-full transition-all duration-500"
              style={{ width: `${progressToFree}%` }}
            />
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="divide-y divide-champagne/40 bg-white rounded-xl border border-champagne/60 p-4 sm:p-6 shadow-subtle">
              {cart.map((item) => (
                <div key={item.id} className="py-4 sm:py-6 first:pt-0 last:pb-0 flex gap-4 sm:gap-6">
                  {/* Item Image */}
                  <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden bg-secondary-bg/30 shrink-0 border border-champagne/40">
                    <Image
                      src={item.image || "/images/placeholder.jpg"}
                      alt={item.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/products/${item.slug}`}>
                          <h3 className="font-serif text-sm sm:text-base font-medium text-charcoal hover:text-muted-gold transition-colors">
                            {item.title}
                          </h3>
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.title}`}
                          className="text-dark-brown/40 hover:text-destructive p-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {item.variantTitle && (
                        <span className="text-[11px] text-dark-brown/60 block mt-0.5">
                          Variant: {item.variantTitle}
                        </span>
                      )}

                      <span className="font-sans text-xs text-muted-gold flex items-center gap-1 mt-1 font-medium">
                        <Gift className="w-3 h-3" />
                        <span>Includes complimentary luxury gift box</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-secondary-bg/60">
                      {/* Quantity Controller */}
                      <div className="inline-flex items-center rounded-lg border border-champagne bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="p-1.5 text-dark-brown/60 hover:text-charcoal cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-charcoal">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-dark-brown/60 hover:text-charcoal cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-sans text-sm sm:text-base font-semibold text-charcoal block">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-dark-brown/60 block">
                            ₹{item.price.toLocaleString("en-IN")} each
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-champagne/60 p-6 shadow-subtle space-y-6 sticky top-28">
              <h2 className="font-serif text-lg text-charcoal font-medium pb-3 border-b border-secondary-bg">
                Order Summary
              </h2>

              {/* Coupon Form */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-dark-brown/70 font-semibold block">
                  Promo / Gift Voucher
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Try TINIWISH10"
                    className="text-xs uppercase bg-white border-champagne h-9"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    className="text-xs h-9 px-3 border-champagne text-charcoal hover:bg-secondary-bg cursor-pointer shrink-0"
                  >
                    Apply
                  </Button>
                </div>
                {appliedPromo && (
                  <p className="text-xs text-emerald-800 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Coupon {appliedPromo} applied (-10%)</span>
                  </p>
                )}
                {promoError && (
                  <p className="text-xs text-rose-700">{promoError}</p>
                )}
              </form>

              {/* Cost Rows */}
              <div className="space-y-2.5 text-xs text-dark-brown/80 pt-2 border-t border-secondary-bg">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-medium text-charcoal">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-medium">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Promo Discount
                    </span>
                    <span>-₹{promoDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Express Insured Shipping</span>
                  <span className="font-medium text-charcoal">
                    {shippingFee === 0 ? (
                      <span className="text-muted-gold font-semibold uppercase text-[11px]">
                        FREE
                      </span>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Luxury Packaging & Handwritten Card</span>
                  <span className="text-muted-gold font-semibold uppercase text-[11px]">
                    COMPLIMENTARY
                  </span>
                </div>
              </div>

              {/* Final Total */}
              <div className="pt-4 border-t border-champagne/60 flex items-baseline justify-between">
                <div>
                  <span className="font-serif text-base text-charcoal font-medium block">
                    Total Amount
                  </span>
                  <span className="text-[10px] text-dark-brown/60">Inclusive of all Indian taxes (GST)</span>
                </div>
                <span className="font-sans text-xl font-bold text-charcoal">
                  ₹{finalTotal.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Checkout CTA */}
              <Link href="/checkout" className="block">
                <Button className="w-full bg-charcoal hover:bg-muted-gold text-white text-xs py-3 h-11 rounded-lg font-sans uppercase tracking-wider font-semibold shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2">
                  <span>Proceed to Secure Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-secondary-bg space-y-2 text-[11px] text-dark-brown/65">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-muted-gold shrink-0" />
                  <span>256-bit encrypted Razorpay checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-muted-gold shrink-0" />
                  <span>Doorstep 7-day replacement guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
