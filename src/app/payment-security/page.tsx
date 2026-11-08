import React from "react";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Payment Security & Certifications | TiniWish",
  description:
    "Learn about our 256-bit bank-grade encryption, PCI-DSS Level 1 compliance, and RBI-regulated payment gateways.",
};

export default function PaymentSecurityPage() {
  return (
    <div className="py-14 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne-light/70 text-muted-gold text-xs font-medium uppercase tracking-widest border border-champagne">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Bank-Grade Encryption</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal">
            Payment Security & Privacy
          </h1>
          <p className="text-xs sm:text-sm text-dark-brown/70 font-light">
            Every transaction on TiniWish is protected by multi-layered bank-grade encryption standards.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-champagne/60 p-8 sm:p-12 space-y-8 shadow-subtle text-xs sm:text-sm text-dark-brown/80 leading-relaxed font-light">
          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              1. 256-Bit SSL/TLS Encryption
            </h2>
            <p>
              Your sensitive information is encrypted before transmission using SHA-256 with RSA encryption. This ensures that no unauthorized parties can intercept or read your data during transit between your browser and our servers.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              2. PCI-DSS Level 1 Certified Gateway
            </h2>
            <p>
              All card and electronic payments are processed directly through Razorpay, a certified PCI-DSS Level 1 Service Provider — the highest tier of security in the payments industry. TiniWish never stores, logs, or views your card CVV, expiry dates, or bank passwords.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              3. Two-Factor Authentication (2FA) & UPI
            </h2>
            <p>
              In accordance with Reserve Bank of India (RBI) mandates, all Indian domestic card payments require Two-Factor Authentication via One-Time Password (OTP). For UPI transactions, confirmation occurs directly within your trusted UPI app (BHIM, Google Pay, PhonePe, Paytm).
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              4. Safe Cash on Delivery (COD)
            </h2>
            <p>
              For customers preferring cash payments, we provide Cash on Delivery with phone number verification to prevent fraudulent orders, ensuring complete peace of mind.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
