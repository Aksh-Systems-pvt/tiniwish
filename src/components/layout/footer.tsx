"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Truck,
  Gift,
  RefreshCw,
  Mail,
  Phone,
  Clock,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setMessage("Welcome to the TiniWish Circle. Use code TINIWISH10 for 10% off.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message || "Unable to subscribe. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please check your connection.");
    }
  };

  return (
    <footer className="bg-secondary-bg/50 border-t border-champagne/60 text-dark-brown/80 font-sans">
      {/* Brand Value Pillars */}
      <div className="border-b border-champagne/40 py-10 bg-white/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-champagne-light/60 text-muted-gold shrink-0 border border-champagne/40">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-serif font-medium text-charcoal text-sm">
                  Signature Gift Packaging
                </h4>
                <p className="text-xs text-dark-brown/65 mt-0.5 leading-relaxed">
                  Complimentary keepsake velvet box & handwritten calligraphy card on every order.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-champagne-light/60 text-muted-gold shrink-0 border border-champagne/40">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-serif font-medium text-charcoal text-sm">
                  Insured Pan-India Express
                </h4>
                <p className="text-xs text-dark-brown/65 mt-0.5 leading-relaxed">
                  Free shipping over ₹999. Tamper-evident transit insured via Shiprocket.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-champagne-light/60 text-muted-gold shrink-0 border border-champagne/40">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-serif font-medium text-charcoal text-sm">
                  100% Encrypted Checkout
                </h4>
                <p className="text-xs text-dark-brown/65 mt-0.5 leading-relaxed">
                  Bank-grade 256-bit SSL security powering UPI, credit/debit cards & net banking.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-champagne-light/60 text-muted-gold shrink-0 border border-champagne/40">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-serif font-medium text-charcoal text-sm">
                  7-Day Easy Replacements
                </h4>
                <p className="text-xs text-dark-brown/65 mt-0.5 leading-relaxed">
                  Complete peace of mind with doorstep pickup for transit damage or sizing issues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand & Newsletter Column */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <Image
                  src="/icons/logo.png"
                  alt="TiniWish Logo"
                  width={36}
                  height={32}
                  className="h-8 w-auto object-contain transition-transform group-hover:scale-105 shrink-0"
                />
                <span className="font-serif text-2xl font-medium text-charcoal tracking-tight group-hover:text-muted-gold transition-colors">
                  TiniWish
                </span>
              </Link>
              <p className="text-[11px] tracking-widest uppercase text-muted-gold font-sans font-medium mt-1">
                Little wishes. Timeless treasures.
              </p>
            </div>

            <p className="text-xs text-dark-brown/75 leading-relaxed max-w-sm">
              An Indian boutique dedicated to artisanal artificial jewellery, heartfelt gifts, and timeless home accents crafted by master artisans across heritage craft clusters.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <span className="text-xs font-serif font-medium text-charcoal block mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-muted-gold" />
                <span>Join the TiniWish Circle</span>
              </span>
              <p className="text-[11px] text-dark-brown/65 mb-3">
                Receive secret previews of limited edition drops and 10% off your maiden treasure.
              </p>

              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex max-w-md gap-2">
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    aria-label="Newsletter email address"
                    className="bg-white border-champagne text-xs h-10 placeholder:text-dark-brown/40"
                    disabled={status === "loading"}
                  />
                  <Button
                    type="submit"
                    disabled={status === "loading"}
                    className="bg-charcoal hover:bg-muted-gold text-white text-xs px-5 h-10 font-sans tracking-wide shrink-0 transition-colors cursor-pointer"
                  >
                    {status === "loading" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Join Circle"
                    )}
                  </Button>
                </div>

                {status === "success" && (
                  <p className="text-xs text-emerald-800 flex items-center gap-1.5 font-medium animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{message}</span>
                  </p>
                )}

                {status === "error" && (
                  <p className="text-xs text-rose-700 font-medium animate-in fade-in">
                    {message}
                  </p>
                )}
              </form>
            </div>

            {/* Contact Concierge Info */}
            <div className="pt-3 border-t border-champagne/40 space-y-1.5 text-xs text-dark-brown/70">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-muted-gold" />
                <span>Concierge Desk: </span>
                <a
                  href="tel:+918000123456"
                  className="font-medium text-charcoal hover:text-muted-gold transition-colors"
                >
                  +91 8000 123 456
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-muted-gold" />
                <span>Inquiries: </span>
                <a
                  href="mailto:care@tiniwish.com"
                  className="font-medium text-charcoal hover:text-muted-gold transition-colors"
                >
                  care@tiniwish.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-muted-gold" />
                <span>Mon – Sat: 10:00 AM – 7:00 PM IST</span>
              </div>
            </div>
          </div>

          {/* Column 2: Shopping Categories */}
          <div>
            <h4 className="font-serif text-sm font-medium text-charcoal uppercase tracking-wider mb-4 pb-1 border-b border-champagne/40 inline-block">
              Collections
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/jewellery" className="hover:text-muted-gold transition-colors block py-0.5">
                  Artificial Jewellery
                </Link>
              </li>
              <li>
                <Link href="/gifts" className="hover:text-muted-gold transition-colors block py-0.5">
                  Charming Gifts
                </Link>
              </li>
              <li>
                <Link href="/home-decor" className="hover:text-muted-gold transition-colors block py-0.5">
                  Timeless Home Décor
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-muted-gold transition-colors block py-0.5">
                  All Collections
                </Link>
              </li>
              <li>
                <Link href="/gifts?sub=under-1999" className="hover:text-muted-gold transition-colors block py-0.5">
                  Gifts Under ₹1,999
                </Link>
              </li>
              <li>
                <Link href="/jewellery?sub=bridal-sets" className="hover:text-muted-gold transition-colors block py-0.5">
                  Bridal Trousseau Edits
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Concierge */}
          <div>
            <h4 className="font-serif text-sm font-medium text-charcoal uppercase tracking-wider mb-4 pb-1 border-b border-champagne/40 inline-block">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/track-order" className="hover:text-muted-gold transition-colors block py-0.5">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-muted-gold transition-colors block py-0.5">
                  Shipping & Express Delivery
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-muted-gold transition-colors block py-0.5">
                  Returns & Replacements
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-muted-gold transition-colors block py-0.5">
                  Contact Concierge
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-muted-gold transition-colors block py-0.5">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/care-guide" className="hover:text-muted-gold transition-colors block py-0.5">
                  Jewellery Care Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: About & Legal */}
          <div>
            <h4 className="font-serif text-sm font-medium text-charcoal uppercase tracking-wider mb-4 pb-1 border-b border-champagne/40 inline-block">
              Our Maison
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-muted-gold transition-colors block py-0.5">
                  About TiniWish
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-muted-gold transition-colors block py-0.5">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-muted-gold transition-colors block py-0.5">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/payment-security" className="hover:text-muted-gold transition-colors block py-0.5">
                  Payment Security
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-muted-gold transition-colors block py-0.5">
                  Customer Portal
                </Link>
              </li>
            </ul>

            {/* Social Media Links */}
            <div className="pt-6">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-charcoal block mb-3">
                Follow Our Journey
              </span>
              <div className="flex items-center space-x-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TiniWish on Instagram"
                  className="h-8 w-8 rounded-full border border-champagne/80 bg-white/70 flex items-center justify-center text-charcoal hover:text-muted-gold hover:border-muted-gold transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TiniWish on Facebook"
                  className="h-8 w-8 rounded-full border border-champagne/80 bg-white/70 flex items-center justify-center text-charcoal hover:text-muted-gold hover:border-muted-gold transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a
                  href="https://pinterest.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TiniWish on Pinterest"
                  className="h-8 w-8 rounded-full border border-champagne/80 bg-white/70 flex items-center justify-center text-charcoal hover:text-muted-gold hover:border-muted-gold transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.332 1.365-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TiniWish on YouTube"
                  className="h-8 w-8 rounded-full border border-champagne/80 bg-white/70 flex items-center justify-center text-charcoal hover:text-muted-gold hover:border-muted-gold transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                    <polygon points="10 15 15 12 10 9 10 15"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-footer: Registered Entity & Payment Badges */}
      <div className="border-t border-champagne/50 py-6 bg-white/60 text-xs text-dark-brown/70">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <p className="font-medium text-charcoal">
              © 2026 TiniWish Luxury Retails LLP. All rights reserved. Handcrafted with passion in India.
            </p>
            <p className="text-[11px] text-dark-brown/60">
              Registered Office: Plot 42, DLF Phase 5, Golf Course Road, Gurugram, Haryana - 122002 • GSTIN: 06AAACT0000A1Z5
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-sans font-medium uppercase tracking-wider text-charcoal/80">
            <span className="px-2 py-1 rounded bg-white border border-champagne/60 shadow-xs">UPI</span>
            <span className="px-2 py-1 rounded bg-white border border-champagne/60 shadow-xs">RuPay</span>
            <span className="px-2 py-1 rounded bg-white border border-champagne/60 shadow-xs">Visa</span>
            <span className="px-2 py-1 rounded bg-white border border-champagne/60 shadow-xs">Mastercard</span>
            <span className="px-2 py-1 rounded bg-white border border-champagne/60 shadow-xs">NetBanking</span>
            <span className="px-2 py-1 rounded bg-white border border-champagne/60 shadow-xs">Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
