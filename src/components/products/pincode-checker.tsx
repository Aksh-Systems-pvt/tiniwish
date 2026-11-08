"use client";

import React, { useState } from "react";
import { Truck, CheckCircle2, AlertCircle, Loader2, MapPin } from "lucide-react";
import { pincodeService, PincodeServiceabilityResult } from "@/features/shipping/pincode.service";

export function PincodeChecker() {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PincodeServiceabilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const trimmed = pincode.trim();
    if (!/^[1-9][0-9]{5}$/.test(trimmed)) {
      setError("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    setLoading(true);
    // Simulate quick verification
    setTimeout(() => {
      const res = pincodeService.checkServiceability(trimmed);
      setLoading(false);
      if (!res.isServiceable) {
        setError("Delivery is currently unavailable for this PIN code.");
      } else {
        setResult(res);
      }
    }, 250);
  };

  return (
    <div className="p-4 rounded-xl bg-secondary-bg/25 border border-champagne/60 space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-charcoal">
        <MapPin className="w-4 h-4 text-muted-gold" />
        <span>Check Delivery & Serviceability</span>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <input
          type="text"
          value={pincode}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 6);
            setPincode(val);
            if (error) setError(null);
          }}
          placeholder="Enter 6-digit PIN code"
          maxLength={6}
          className="flex-1 bg-white border border-champagne rounded-lg px-3 py-2 text-xs text-charcoal placeholder:text-dark-brown/40 focus:outline-hidden focus:border-muted-gold transition-colors font-mono"
        />
        <button
          type="submit"
          disabled={loading || pincode.length !== 6}
          className="px-4 py-2 rounded-lg bg-charcoal text-white hover:bg-muted-gold disabled:bg-charcoal/40 text-xs font-medium tracking-wide uppercase transition-colors cursor-pointer shrink-0 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Checking</span>
            </>
          ) : (
            <span>Check</span>
          )}
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && result.isServiceable && (
        <div className="space-y-1.5 pt-1 text-xs text-dark-brown/85">
          <div className="flex items-center gap-2 text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Express Delivery to {result.city ? `${result.city}, ` : ""}{result.state}
            </span>
          </div>

          <div className="pl-6 space-y-1 text-[11px] text-dark-brown/75">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-muted-gold shrink-0" />
              <span>
                Estimated arrival: <strong className="text-charcoal font-semibold">{result.estimatedDeliveryDate}</strong> ({result.estimatedDays})
              </span>
            </div>
            <div>
              {result.isCodAvailable ? (
                <span className="text-emerald-700 font-medium">✓ Cash on Delivery (COD) available</span>
              ) : (
                <span className="text-dark-brown/60">Prepaid orders only</span>
              )}
            </div>
            <div className="text-muted-gold font-medium">
              Free Express Insured Courier via {result.courier}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

