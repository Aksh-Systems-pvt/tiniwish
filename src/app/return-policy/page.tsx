import React from "react";
import { RefreshCw } from "lucide-react";

export const metadata = {
  title: "Return & Replacement Policy | TiniWish",
  description:
    "7-day doorstep replacement guarantee on artificial jewellery, gifts, and home décor.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="py-14 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne-light/70 text-muted-gold text-xs font-medium uppercase tracking-widest border border-champagne">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Customer Protection Guarantee</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal">
            Returns & Replacements Policy
          </h1>
          <p className="text-xs sm:text-sm text-dark-brown/70 font-light">
            7-day hassle-free replacement promise for transit damages, defects, or sizing concerns.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-champagne/60 p-8 sm:p-12 space-y-8 shadow-subtle text-xs sm:text-sm text-dark-brown/80 leading-relaxed font-light">
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              1. 7-Day Replacement Window
            </h2>
            <p>
              At TiniWish, every order is hand-inspected before dispatch. However, if your item arrives damaged in transit, with missing stones, or has a manufacturing defect, you are entitled to a complimentary doorstep replacement within 7 calendar days of delivery.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              2. Eligibility Criteria
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>The item must be in its original, unworn condition with all original security tags attached.</li>
              <li>Must include the signature velvet keepsake box, brand inserts, and packaging intact.</li>
              <li>Personalized or custom-engraved gift orders are eligible for replacement only in cases of craftsmanship defects or shipping damage.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              3. Doorstep Pickup Process
            </h2>
            <p>
              Once your replacement request is verified by our customer concierge, our courier partner will arrange a doorstep reverse pickup from your original delivery address within 24 to 48 hours. You do not need to print any return labels.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              4. Refunds & Store Credit
            </h2>
            <p>
              If a replacement piece is out of stock, you will receive an immediate 100% refund to your original payment method (processed within 3 – 5 banking days) or instant TiniWish Store Credit with no expiration date, per your preference.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              5. How to Initiate a Replacement
            </h2>
            <p>
              Simply email <a href="mailto:care@tiniwish.com" className="text-muted-gold hover:underline font-medium">care@tiniwish.com</a> or WhatsApp us at <a href="tel:+918000123456" className="text-muted-gold hover:underline font-medium">+91 8000 123 456</a> with your Order ID and 2 clear photos/unboxing video of the affected item.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
