"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CartItem } from "@/context/store-context";
import { CheckoutCalculationDTO } from "@/types/checkout";
import { Tag, Gift, ShieldCheck, X, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  calculation: CheckoutCalculationDTO | null;
  couponCode: string;
  onApplyCoupon: (code: string) => Promise<void>;
  onRemoveCoupon: () => Promise<void>;
  isGiftWrapped: boolean;
  onToggleGiftWrap: (wrapped: boolean) => void;
  giftMessage?: string;
  onGiftMessageChange?: (msg: string) => void;
  isApplyingCoupon?: boolean;
}

export function CheckoutOrderSummary({
  items,
  calculation,
  couponCode,
  onApplyCoupon,
  onRemoveCoupon,
  isGiftWrapped,
  onToggleGiftWrap,
  giftMessage = "",
  onGiftMessageChange,
  isApplyingCoupon = false,
}: CheckoutOrderSummaryProps) {
  const [couponInput, setCouponInput] = useState(couponCode);
  const [couponError, setCouponError] = useState("");

  const handleApply = async () => {
    if (!couponInput.trim()) return;
    setCouponError("");
    try {
      await onApplyCoupon(couponInput.trim().toUpperCase());
    } catch (err: unknown) {
      setCouponError(err instanceof Error ? err.message : "Invalid coupon code");
    }
  };

  const handleRemove = async () => {
    setCouponError("");
    setCouponInput("");
    await onRemoveCoupon();
  };

  // Fallback calculations while server calculates
  const rawSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = calculation ? calculation.subtotal : rawSubtotal;
  const discount = calculation ? calculation.discountAmount : 0;
  const shippingFee = calculation ? calculation.shippingFee : subtotal >= 999 ? 0 : 99;
  const giftFee = isGiftWrapped ? 99 : 0;
  const grandTotal = calculation ? calculation.grandTotal : Math.max(0, subtotal - discount + shippingFee + giftFee);
  const gstTax = calculation ? calculation.taxAmount : Math.round((subtotal * 0.03) * 100) / 100;

  return (
    <div className="bg-white rounded-2xl border border-champagne/60 p-6 sm:p-7 shadow-subtle space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-champagne/30">
        <h3 className="font-serif text-lg text-charcoal">Order Summary</h3>
        <span className="text-xs text-dark-brown/60">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Items Preview List */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-champagne/20">
        {items.map((item) => (
          <div key={`${item.productId}-${item.variantId || "def"}`} className="pt-3 first:pt-0 flex items-center gap-3">
            <div className="w-13 h-13 rounded-lg overflow-hidden bg-secondary-bg/50 border border-champagne/40 shrink-0 relative">
              <Image
                src={item.image}
                alt={item.title}
                width={52}
                height={52}
                className="w-full h-full object-cover"
              />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-charcoal text-[9px] font-bold text-white flex items-center justify-center">
                {item.quantity}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-medium text-charcoal truncate">{item.title}</h4>
              {item.variantTitle && (
                <p className="text-[11px] text-dark-brown/60 truncate">{item.variantTitle}</p>
              )}
              <p className="text-xs font-semibold text-charcoal mt-0.5">
                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon Application */}
      <div className="pt-2 border-t border-champagne/30">
        {calculation?.appliedCoupon ? (
          <div className="p-3 rounded-xl bg-champagne-light/40 border border-muted-gold/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-muted-gold" />
              <div>
                <span className="text-xs font-bold text-charcoal tracking-wide">
                  {calculation.appliedCoupon.code}
                </span>
                <span className="text-[11px] text-muted-gold font-semibold ml-2">
                  -₹{calculation.appliedCoupon.discountAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-dark-brown/50 hover:text-red-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-brown/40" />
                <Input
                  type="text"
                  placeholder="Coupon (e.g. WELCOME10)"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value);
                    setCouponError("");
                  }}
                  className="pl-8 text-xs h-9 uppercase"
                />
              </div>
              <button
                type="button"
                onClick={handleApply}
                disabled={isApplyingCoupon || !couponInput.trim()}
                className="px-4 h-9 rounded-lg bg-charcoal hover:bg-muted-gold text-white text-xs font-medium disabled:opacity-50 transition-colors cursor-pointer shrink-0"
              >
                {isApplyingCoupon ? "Applying..." : "Apply"}
              </button>
            </div>
            {couponError && <p className="text-[11px] text-red-500">{couponError}</p>}
          </div>
        )}
      </div>

      {/* Gift Packaging Add-on */}
      <div className="pt-3 border-t border-champagne/30 space-y-2">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={isGiftWrapped}
            onChange={(e) => onToggleGiftWrap(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-muted-gold focus:ring-muted-gold border-champagne"
          />
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-charcoal">
              <Gift className="w-3.5 h-3.5 text-muted-gold" />
              <span>Complimentary Velvet Box + Satin Ribbon (+₹99)</span>
            </div>
            <p className="text-[11px] text-dark-brown/60">
              Includes bespoke handwritten card and wax seal
            </p>
          </div>
        </label>

        {isGiftWrapped && onGiftMessageChange && (
          <div className="pt-1.5 pl-6">
            <textarea
              rows={2}
              placeholder="Write a personalized gift card message..."
              value={giftMessage}
              onChange={(e) => onGiftMessageChange(e.target.value)}
              maxLength={200}
              className="w-full text-xs p-2 rounded-lg border border-champagne/60 focus:outline-none focus:border-muted-gold resize-none"
            />
          </div>
        )}
      </div>

      {/* Financial Price Breakdown */}
      <div className="pt-3 border-t border-champagne/30 space-y-2 text-xs">
        <div className="flex items-center justify-between text-dark-brown/80">
          <span>Items Subtotal</span>
          <span className="font-medium text-charcoal">₹{subtotal.toLocaleString("en-IN")}</span>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between text-emerald-700 font-medium">
            <span>Coupon Discount</span>
            <span>-₹{discount.toLocaleString("en-IN")}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-dark-brown/80">
          <div className="flex items-center gap-1">
            <span>Express Delivery</span>
            {calculation?.isFreeShipping && (
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 rounded font-bold">
                FREE
              </span>
            )}
          </div>
          <span className="font-medium text-charcoal">
            {shippingFee === 0 ? "₹0 (Free)" : `₹${shippingFee}`}
          </span>
        </div>

        {isGiftWrapped && (
          <div className="flex items-center justify-between text-dark-brown/80">
            <span>Signature Gift Packaging</span>
            <span className="font-medium text-charcoal">₹99</span>
          </div>
        )}

        <div className="flex items-center justify-between text-dark-brown/60 text-[11px] pt-1">
          <span>Embedded GST (3-18% Inclusive)</span>
          <span>₹{gstTax.toLocaleString("en-IN")}</span>
        </div>

        <div className="pt-3 border-t border-champagne/50 flex items-center justify-between text-sm sm:text-base font-serif font-medium text-charcoal">
          <span>Grand Total</span>
          <span className="text-muted-gold font-bold">₹{grandTotal.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Courier & Security Assurance */}
      <div className="pt-2 text-[11px] text-dark-brown/70 space-y-1.5 bg-secondary-bg/40 p-3 rounded-xl border border-champagne/40">
        {calculation?.estimatedDeliveryDate && (
          <div className="flex items-center gap-1.5 font-medium text-charcoal">
            <Truck className="w-3.5 h-3.5 text-muted-gold" />
            <span>
              Est. Delivery by <strong className="text-muted-gold">{calculation.estimatedDeliveryDate}</strong>
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Complimentary insurance & 7-day hassle-free replacement</span>
        </div>
      </div>
    </div>
  );
}

