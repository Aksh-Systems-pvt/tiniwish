import React from "react";
import { Scale } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | TiniWish",
  description:
    "Official terms and conditions governing purchases and usage on the TiniWish luxury e-commerce platform.",
};

export default function TermsPage() {
  return (
    <div className="py-14 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne-light/70 text-muted-gold text-xs font-medium uppercase tracking-widest border border-champagne">
            <Scale className="w-3.5 h-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-dark-brown/70 font-light">
            Last Updated: January 2026 • TiniWish Luxury Retails LLP
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-champagne/60 p-8 sm:p-12 space-y-8 shadow-subtle text-xs sm:text-sm text-dark-brown/80 leading-relaxed font-light">
          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the website tiniwish.com or placing an order, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, you must discontinue use of the platform immediately.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              2. Products & Pricing
            </h2>
            <p>
              All products listed are handcrafted artificial jewellery, bespoke gifts, and brass home décor. Minor variations in stone hue, texture, or enamel are natural hallmarks of artisanal handcrafting. All prices are listed in Indian Rupees (INR) and are inclusive of Goods & Services Tax (GST).
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              3. Order Acceptance & Payments
            </h2>
            <p>
              Receipt of an order confirmation does not signify our final acceptance of your order. TiniWish reserves the right to accept or decline your order in case of pricing errors, suspected fraud, or inventory shortages. Payments are charged upon order placement through authorized payment partners.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              4. Intellectual Property
            </h2>
            <p>
              All trademarks, product photography, editorial designs, and brand taglines (&ldquo;Little wishes. Timeless treasures.&rdquo;) are the exclusive intellectual property of TiniWish Luxury Retails LLP. Unauthorized duplication or commercial use without prior written consent is strictly prohibited.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              5. Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in Gurugram, Haryana.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
