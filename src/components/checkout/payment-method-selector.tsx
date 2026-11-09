"use client";

import React from "react";
import { PaymentMethodType } from "@/types/checkout";
import { CreditCard, Banknote, ShieldCheck, Zap, Lock } from "lucide-react";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType;
  onSelect: (method: PaymentMethodType) => void;
  isCodAvailable?: boolean;
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelect,
  isCodAvailable = true,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4 bg-white p-6 sm:p-7 rounded-2xl border border-champagne/60 shadow-subtle">
      <div className="flex items-center justify-between pb-3 border-b border-champagne/30">
        <h3 className="font-serif text-lg text-charcoal flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-gold" />
          <span>Payment Method</span>
        </h3>
        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          256-Bit SSL Encrypted
        </span>
      </div>

      <div className="space-y-3">
        {/* Razorpay Option */}
        <div
          onClick={() => onSelect("RAZORPAY")}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedMethod === "RAZORPAY"
              ? "border-muted-gold bg-champagne-light/30 ring-2 ring-muted-gold/20 shadow-subtle"
              : "border-champagne/60 hover:border-muted-gold/50 bg-white"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="paymentMethod"
                value="RAZORPAY"
                checked={selectedMethod === "RAZORPAY"}
                onChange={() => onSelect("RAZORPAY")}
                className="mt-1 w-4 h-4 text-muted-gold focus:ring-muted-gold border-champagne"
              />
              <div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-gold" />
                  <span className="text-xs font-semibold text-charcoal">
                    Online Payment (Razorpay Secure)
                  </span>
                  <span className="text-[10px] font-bold text-white bg-charcoal px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 text-muted-gold" />
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-dark-brown/70 mt-1">
                  UPI (Google Pay, PhonePe, Paytm), RuPay, Visa, Mastercard, NetBanking & Wallets
                </p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-emerald-700 font-medium">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    100% Protected
                  </span>
                  <span>•</span>
                  <span>Instant Refund Assurance</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cash on Delivery Option */}
        <div
          onClick={() => isCodAvailable && onSelect("COD")}
          className={`p-4 rounded-xl border transition-all ${
            !isCodAvailable
              ? "opacity-60 bg-gray-50 border-gray-200 cursor-not-allowed"
              : selectedMethod === "COD"
              ? "border-muted-gold bg-champagne-light/30 ring-2 ring-muted-gold/20 shadow-subtle cursor-pointer"
              : "border-champagne/60 hover:border-muted-gold/50 bg-white cursor-pointer"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={selectedMethod === "COD"}
                disabled={!isCodAvailable}
                onChange={() => isCodAvailable && onSelect("COD")}
                className="mt-1 w-4 h-4 text-muted-gold focus:ring-muted-gold border-champagne"
              />
              <div>
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-muted-gold" />
                  <span className="text-xs font-semibold text-charcoal">
                    Cash on Delivery (COD)
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                    Free
                  </span>
                </div>
                <p className="text-[11px] text-dark-brown/70 mt-1">
                  Pay via Cash or UPI to delivery personnel at your doorstep
                </p>
                {!isCodAvailable && (
                  <p className="text-[11px] text-red-500 mt-1">
                    Cash on Delivery is unavailable for this PIN code
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

