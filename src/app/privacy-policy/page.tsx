import React from "react";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | TiniWish",
  description:
    "How TiniWish protects your personal data under the Digital Personal Data Protection Act (DPDP) and IT Act of India.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-14 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne-light/70 text-muted-gold text-xs font-medium uppercase tracking-widest border border-champagne">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-dark-brown/70 font-light">
            Effective: January 1, 2026 • TiniWish Luxury Retails LLP
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-champagne/60 p-8 sm:p-12 space-y-8 shadow-subtle text-xs sm:text-sm text-dark-brown/80 leading-relaxed font-light">
          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              1. Overview & Commitment
            </h2>
            <p>
              TiniWish Luxury Retails LLP (&ldquo;TiniWish&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is committed to protecting the privacy and personal data of our customers and visitors in strict compliance with the Indian Information Technology Act, 2000, and the Digital Personal Data Protection Act, 2023 (DPDP).
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              2. Data We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-charcoal font-medium">Identity & Contact Data: </strong> Name, delivery address, billing address, phone number, and email address.</li>
              <li><strong className="text-charcoal font-medium">Transaction Data: </strong> Order history, items purchased, shipping logs, and payment confirmation tokens received from Razorpay. (We never store your raw credit card numbers or UPI MPINs).</li>
              <li><strong className="text-charcoal font-medium">Technical Data: </strong> IP address, browser type, device information, and session cookies strictly used for authentication and shopping bag persistence.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              3. Purpose of Processing
            </h2>
            <p>
              Your personal information is used exclusively to process orders, orchestrate courier dispatch via Shiprocket, provide shipping notifications via SMS/WhatsApp, and prevent fraud. We will never sell, rent, or trade your personal information to third-party data brokers.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              4. Payment Security & PCI-DSS
            </h2>
            <p>
              All online payments are securely channeled through Razorpay, a PCI-DSS Level 1 certified payment aggregator governed by Reserve Bank of India (RBI) regulations. All communications are encrypted with 256-bit TLS/SSL encryption.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              5. Your Rights as a Data Principal
            </h2>
            <p>
              Under the DPDP Act 2023, you have the right to request access to the personal data we hold about you, request corrections, or request deletion of your account. Inquiries may be addressed to our Data Protection Officer at <a href="mailto:privacy@tiniwish.com" className="text-muted-gold hover:underline font-medium">privacy@tiniwish.com</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
