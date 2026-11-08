import React from "react";
import { Truck } from "lucide-react";

export const metadata = {
  title: "Shipping & Delivery Policy | TiniWish",
  description:
    "Complimentary express shipping across India on orders above ₹999. Fast, insured dispatch via Shiprocket.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="py-14 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-12">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne-light/70 text-muted-gold text-xs font-medium uppercase tracking-widest border border-champagne">
            <Truck className="w-3.5 h-3.5" />
            <span>Pan-India Logistics</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal">
            Shipping & Delivery Policy
          </h1>
          <p className="text-xs sm:text-sm text-dark-brown/70 font-light">
            Last revised: January 2026 • Compliant with Indian Consumer Protection (E-Commerce) Rules
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-champagne/60 p-8 sm:p-12 space-y-8 shadow-subtle text-xs sm:text-sm text-dark-brown/80 leading-relaxed font-light">
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              1. Delivery Coverage & Logistics Partners
            </h2>
            <p>
              TiniWish partners with Shiprocket and tier-1 Indian express couriers (Bluedart, Delhivery, Shadowfax, Xpressbees) covering over 19,000 postal pin codes across India. All parcels travel via prioritized air line hauls where available to ensure prompt arrival.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              2. Shipping Charges & Free Delivery Threshold
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-charcoal font-medium">Orders Above ₹999: </strong>
                Complimentary Express Shipping across all supported pin codes in India.
              </li>
              <li>
                <strong className="text-charcoal font-medium">Orders Under ₹999: </strong>
                A flat subsidized shipping fee of ₹99 applies at checkout.
              </li>
              <li>
                <strong className="text-charcoal font-medium">Cash on Delivery (COD): </strong>
                Available for select postal codes for orders up to ₹5,000 with a standard verification OTP.
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              3. Processing & Delivery Timelines
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-secondary-bg/50 border border-champagne/40">
                <span className="font-serif font-medium text-charcoal block mb-1">
                  Tier-1 Metros (2 – 3 Business Days)
                </span>
                <p className="text-xs text-dark-brown/70">
                  Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Pune & Ahmedabad.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-secondary-bg/50 border border-champagne/40">
                <span className="font-serif font-medium text-charcoal block mb-1">
                  Rest of India (4 – 6 Business Days)
                </span>
                <p className="text-xs text-dark-brown/70">
                  State capitals, tier-2 cities, and regional destinations across North, South, East & West zones.
                </p>
              </div>
            </div>
            <p className="text-xs text-dark-brown/65 pt-2">
              Orders placed before 2:00 PM IST on business days are dispatched on the same day from our Gurugram fulfillment center.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              4. Tamper-Proof Packaging & Transit Insurance
            </h2>
            <p>
              Every jewellery and brass order is insured in transit. Consignments are packed in rigid branded outer boxes and sealed with tamper-evident security tape. If the outer courier flyer shows signs of tearing or tampering upon delivery, please reject the package and immediately notify our concierge at <a href="mailto:care@tiniwish.com" className="text-muted-gold hover:underline font-medium">care@tiniwish.com</a>.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3">
            <h2 className="font-serif text-lg sm:text-xl text-charcoal font-medium">
              5. Live Tracking Notifications
            </h2>
            <p>
              As soon as your parcel is scanned by our logistics carrier, you will receive an SMS and WhatsApp notification containing your Shiprocket AWB tracking link. You may also track anytime via our <a href="/track-order" className="text-muted-gold hover:underline font-medium">Track Order</a> utility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
