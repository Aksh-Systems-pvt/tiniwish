"use client";

import React, { useState } from "react";
import { Package, Truck, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "found" | "not_found">("idle");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setStatus("loading");
    setTimeout(() => {
      // If entered demo order format (e.g. TW-...), display realistic track information
      if (orderId.trim().toUpperCase().startsWith("TW-")) {
        setStatus("found");
      } else {
        setStatus("not_found");
      }
    }, 600);
  };

  return (
    <div className="py-12 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-10">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne-light/70 text-muted-gold text-xs font-medium uppercase tracking-widest border border-champagne">
            <Truck className="w-3.5 h-3.5" />
            <span>Pan-India Logistics</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-dark-brown/70 font-light">
            Enter your TiniWish Order Number or Shiprocket AWB tracking ID to inspect real-time courier updates.
          </p>
        </div>

        {/* Lookup Box */}
        <div className="bg-white rounded-2xl border border-champagne/60 p-6 sm:p-8 shadow-subtle max-w-xl mx-auto">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-dark-brown/70 font-semibold block mb-1.5">
                Order ID or AWB Tracking Number
              </label>
              <Input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. TW-2026-0819 or 143289012"
                className="bg-white border-champagne text-sm uppercase"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-dark-brown/70 font-semibold block mb-1.5">
                Registered Mobile Number or Email
              </label>
              <Input
                type="text"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                placeholder="+91 or email@domain.com"
                className="bg-white border-champagne text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-charcoal hover:bg-muted-gold text-white text-xs h-11 font-sans uppercase tracking-wider font-semibold rounded-lg cursor-pointer transition-colors"
            >
              {status === "loading" ? "Locating Consignment..." : "Track Consignment"}
            </Button>
          </form>

          {/* Results Display */}
          {status === "found" && (
            <div className="mt-8 pt-6 border-t border-champagne/40 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-dark-brown/60 block">Consignment Status</span>
                  <span className="font-serif text-lg text-emerald-800 font-medium">In Transit via Shiprocket</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  On Schedule
                </span>
              </div>

              <div className="space-y-3 pt-2 text-xs text-dark-brown/80">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-charcoal">Package Dispatched from Gurugram Hub</span>
                    <p className="text-[11px] text-dark-brown/60">Insured express line haul departed for delivery metro.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-charcoal">Quality Inspection & Gift Box Packed</span>
                    <p className="text-[11px] text-dark-brown/60">Sealed with tamper-evident security ribbon.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === "not_found" && (
            <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1 animate-in fade-in">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>No active consignment found for this reference.</span>
              </p>
              <p className="text-amber-800/80 pl-5.5">
                Please double-check your Order ID from your confirmation SMS or email, or connect with our customer concierge at care@tiniwish.com.
              </p>
            </div>
          )}
        </div>

        {/* Helpful Info Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-center text-xs text-dark-brown/70">
          <div className="p-4 bg-white/60 rounded-xl border border-champagne/40">
            <Clock className="w-5 h-5 text-muted-gold mx-auto mb-2" />
            <h4 className="font-serif font-medium text-charcoal text-sm">Metro SLAs: 2-3 Days</h4>
            <p className="text-[11px] mt-0.5">Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai & Kolkata.</p>
          </div>
          <div className="p-4 bg-white/60 rounded-xl border border-champagne/40">
            <Truck className="w-5 h-5 text-muted-gold mx-auto mb-2" />
            <h4 className="font-serif font-medium text-charcoal text-sm">Rest of India: 4-6 Days</h4>
            <p className="text-[11px] mt-0.5">Covering 19,000+ pin codes via premium air express.</p>
          </div>
          <div className="p-4 bg-white/60 rounded-xl border border-champagne/40">
            <Package className="w-5 h-5 text-muted-gold mx-auto mb-2" />
            <h4 className="font-serif font-medium text-charcoal text-sm">Tamper-Proof Insured</h4>
            <p className="text-[11px] mt-0.5">Transit insurance covering all artificial jewellery & brass.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
