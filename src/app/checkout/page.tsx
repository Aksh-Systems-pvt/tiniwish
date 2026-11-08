"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/context/store-context";
import { ShieldCheck, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const { cartTotal, cartCount } = useStore();

  return (
    <div className="py-12 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-8">
        <div className="flex items-center justify-between pb-4 border-b border-champagne/40">
          <Link
            href="/cart"
            className="text-xs font-medium text-charcoal hover:text-muted-gold inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Shopping Bag</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-muted-gold font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit Encrypted Checkout</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-champagne/60 p-8 sm:p-12 text-center space-y-6 shadow-subtle max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-champagne-light/70 text-muted-gold mx-auto flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-gold font-semibold">
              Razorpay Secured Gateway
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
              Secure Checkout
            </h1>
            <p className="text-xs sm:text-sm text-dark-brown/70 leading-relaxed font-light">
              You have {cartCount} {cartCount === 1 ? "treasure" : "treasures"} totaling{" "}
              <strong className="text-charcoal font-semibold">₹{cartTotal.toLocaleString("en-IN")}</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-secondary-bg/40 border border-champagne/40 text-xs text-dark-brown/80 space-y-2 text-left">
            <div className="flex items-center justify-between font-medium">
              <span>Delivery Partner:</span>
              <span className="text-charcoal">Shiprocket Insured Air</span>
            </div>
            <div className="flex items-center justify-between font-medium">
              <span>Packaging:</span>
              <span className="text-muted-gold">Signature Keepsake Velvet Box (Complimentary)</span>
            </div>
            <div className="flex items-center justify-between font-medium">
              <span>Payment Methods:</span>
              <span className="text-charcoal">UPI, RuPay, Visa, Mastercard, COD</span>
            </div>
          </div>

          <p className="text-xs text-dark-brown/60">
            Full checkout order creation & Razorpay gateway activation will run during the checkout feature sprint.
          </p>

          <Link href="/products" className="inline-block">
            <Button className="bg-charcoal hover:bg-muted-gold text-white text-xs px-6 py-3 cursor-pointer">
              Continue Browsing Collections
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
