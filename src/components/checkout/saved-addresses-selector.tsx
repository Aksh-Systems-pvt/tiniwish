"use client";

import React from "react";
import { CheckoutAddressDTO } from "@/types/checkout";
import { Home, Briefcase, Building2, Plus, Check } from "lucide-react";

interface SavedAddressesSelectorProps {
  addresses: CheckoutAddressDTO[];
  selectedAddress: CheckoutAddressDTO | null;
  onSelect: (address: CheckoutAddressDTO) => void;
  onAddNew: () => void;
}

export function SavedAddressesSelector({
  addresses,
  selectedAddress,
  onSelect,
  onAddNew,
}: SavedAddressesSelectorProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "WORK":
        return <Briefcase className="w-3.5 h-3.5 text-muted-gold" />;
      case "OTHER":
        return <Building2 className="w-3.5 h-3.5 text-muted-gold" />;
      default:
        return <Home className="w-3.5 h-3.5 text-muted-gold" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg text-charcoal">Select Delivery Address</h3>
        <button
          type="button"
          onClick={onAddNew}
          className="text-xs font-semibold text-muted-gold hover:text-dark-brown inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Address</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {addresses.map((addr) => {
          const isSelected = selectedAddress?.id === addr.id;

          return (
            <div
              key={addr.id || `${addr.pincode}-${addr.addressLine1}`}
              onClick={() => onSelect(addr)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all relative ${
                isSelected
                  ? "border-muted-gold bg-champagne-light/30 ring-2 ring-muted-gold/20 shadow-subtle"
                  : "border-champagne/60 bg-white hover:border-muted-gold/60"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-muted-gold">
                  {getIcon(addr.addressType)}
                  <span>{addr.addressType}</span>
                </div>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-muted-gold text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                )}
              </div>

              <p className="text-xs font-semibold text-charcoal">{addr.fullName}</p>
              <p className="text-xs text-dark-brown/70 mt-1 line-clamp-2">
                {addr.addressLine1}, {addr.addressLine2}
              </p>
              {addr.landmark && (
                <p className="text-[11px] text-dark-brown/50 italic mt-0.5">
                  Landmark: {addr.landmark}
                </p>
              )}
              <p className="text-xs text-dark-brown/80 mt-1 font-medium">
                {addr.city}, {addr.state} - {addr.pincode}
              </p>
              <p className="text-[11px] text-dark-brown/60 mt-1.5">
                Phone: +91 {addr.phone}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

