"use client";

import React, { useState } from "react";
import { CheckoutAddressDTO, AddressType } from "@/types/checkout";
import { pincodeService } from "@/features/shipping/pincode.service";
import { MapPin, User, Home, Briefcase, Building2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AddressFormProps {
  initialData?: Partial<CheckoutAddressDTO>;
  isLoggedIn?: boolean;
  onSubmit: (data: CheckoutAddressDTO) => void;
  onCancel?: () => void;
  submitButtonText?: string;
}

export function AddressForm({
  initialData,
  isLoggedIn = false,
  onSubmit,
  onCancel,
  submitButtonText = "Deliver to this Address",
}: AddressFormProps) {
  const [formData, setFormData] = useState<CheckoutAddressDTO>({
    fullName: initialData?.fullName || "",
    phone: initialData?.phone || "",
    pincode: initialData?.pincode || "",
    state: initialData?.state || "",
    city: initialData?.city || "",
    addressLine1: initialData?.addressLine1 || "",
    addressLine2: initialData?.addressLine2 || "",
    landmark: initialData?.landmark || "",
    addressType: (initialData?.addressType as AddressType) || "HOME",
    saveToProfile: initialData?.saveToProfile ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pincodeStatus, setPincodeStatus] = useState<{
    message?: string;
    isServiceable?: boolean;
    courier?: string;
  } | null>(null);

  const handlePincodeChange = (pincodeVal: string) => {
    const clean = pincodeVal.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, pincode: clean }));

    if (clean.length === 6) {
      if (pincodeService.isValidPincode(clean)) {
        const check = pincodeService.checkServiceability(clean);
        if (check.isServiceable) {
          setFormData((prev) => ({
            ...prev,
            pincode: clean,
            city: prev.city || check.city || "",
            state: prev.state || check.state || "",
          }));
          setPincodeStatus({
            message: `Serviceable by ${check.courier} • Est. delivery: ${check.estimatedDays}`,
            isServiceable: true,
            courier: check.courier,
          });
          setErrors((prev) => {
            const next = { ...prev };
            delete next.pincode;
            return next;
          });
        } else {
          setPincodeStatus({
            message: "Delivery currently not available for this PIN code.",
            isServiceable: false,
          });
        }
      } else {
        setPincodeStatus(null);
      }
    } else {
      setPincodeStatus(null);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number";
    }

    if (!/^[1-9][0-9]{5}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Enter a valid 6-digit Indian PIN code";
    }

    if (!formData.addressLine1.trim() || formData.addressLine1.trim().length < 2) {
      newErrors.addressLine1 = "House / Flat / Building details are required";
    }

    if (!formData.addressLine2.trim() || formData.addressLine2.trim().length < 2) {
      newErrors.addressLine2 = "Street / Area / Locality details are required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 sm:p-7 rounded-2xl border border-champagne/60 shadow-subtle">
      <div className="flex items-center justify-between pb-3 border-b border-champagne/30">
        <h3 className="font-serif text-lg text-charcoal flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-gold" />
          <span>Delivery Details</span>
        </h3>
        <span className="text-[11px] text-dark-brown/60">India Deliveries Only</span>
      </div>

      {/* Full Name & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-charcoal mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-brown/40" />
            <Input
              type="text"
              placeholder="e.g. Radhika Sharma"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={`pl-9.5 text-xs h-10 ${errors.fullName ? "border-red-400 focus:ring-red-400" : ""}`}
            />
          </div>
          {errors.fullName && <p className="text-[11px] text-red-500 mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-charcoal mb-1.5">
            Mobile Number (10 Digits) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-dark-brown/60">
              +91
            </span>
            <Input
              type="tel"
              placeholder="9876543210"
              value={formData.phone}
              onChange={(e) => {
                const clean = e.target.value.replace(/\D/g, "").slice(0, 10);
                setFormData({ ...formData, phone: clean });
              }}
              className={`pl-11 text-xs h-10 ${errors.phone ? "border-red-400 focus:ring-red-400" : ""}`}
            />
          </div>
          {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
        </div>
      </div>

      {/* PIN Code, City & State */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-charcoal mb-1.5">
            PIN Code <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="6-Digit PIN (e.g. 110001)"
            value={formData.pincode}
            onChange={(e) => handlePincodeChange(e.target.value)}
            className={`text-xs h-10 ${errors.pincode ? "border-red-400" : ""}`}
          />
          {errors.pincode && <p className="text-[11px] text-red-500 mt-1">{errors.pincode}</p>}
          {pincodeStatus && (
            <p
              className={`text-[11px] mt-1 flex items-center gap-1 ${
                pincodeStatus.isServiceable ? "text-emerald-700 font-medium" : "text-red-600"
              }`}
            >
              {pincodeStatus.isServiceable && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
              <span>{pincodeStatus.message}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-charcoal mb-1.5">
            City <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className={`text-xs h-10 ${errors.city ? "border-red-400" : ""}`}
          />
          {errors.city && <p className="text-[11px] text-red-500 mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-charcoal mb-1.5">
            State <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="State"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className={`text-xs h-10 ${errors.state ? "border-red-400" : ""}`}
          />
          {errors.state && <p className="text-[11px] text-red-500 mt-1">{errors.state}</p>}
        </div>
      </div>

      {/* House/Building */}
      <div>
        <label className="block text-xs font-medium text-charcoal mb-1.5">
          Flat, House no., Building, Apartment <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          placeholder="e.g. Penthouse 4B, Silver Heights"
          value={formData.addressLine1}
          onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
          className={`text-xs h-10 ${errors.addressLine1 ? "border-red-400" : ""}`}
        />
        {errors.addressLine1 && (
          <p className="text-[11px] text-red-500 mt-1">{errors.addressLine1}</p>
        )}
      </div>

      {/* Street/Area */}
      <div>
        <label className="block text-xs font-medium text-charcoal mb-1.5">
          Area, Street, Sector, Village <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          placeholder="e.g. Golf Course Road, Sector 54"
          value={formData.addressLine2}
          onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
          className={`text-xs h-10 ${errors.addressLine2 ? "border-red-400" : ""}`}
        />
        {errors.addressLine2 && (
          <p className="text-[11px] text-red-500 mt-1">{errors.addressLine2}</p>
        )}
      </div>

      {/* Landmark */}
      <div>
        <label className="block text-xs font-medium text-charcoal mb-1.5">
          Landmark (Optional)
        </label>
        <Input
          type="text"
          placeholder="e.g. Near DLF Horizon Center"
          value={formData.landmark || ""}
          onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
          className="text-xs h-10"
        />
      </div>

      {/* Address Type Selector */}
      <div>
        <label className="block text-xs font-medium text-charcoal mb-2">Address Type</label>
        <div className="flex gap-3">
          {(
            [
              { type: "HOME", label: "Home (All Day Delivery)", icon: Home },
              { type: "WORK", label: "Work (10 AM - 6 PM)", icon: Briefcase },
              { type: "OTHER", label: "Other", icon: Building2 },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const isSelected = formData.addressType === item.type;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => setFormData({ ...formData, addressType: item.type })}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? "border-muted-gold bg-champagne-light/50 text-charcoal shadow-sm"
                    : "border-champagne/60 bg-white text-dark-brown/70 hover:border-muted-gold/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-muted-gold" : "text-dark-brown/50"}`} />
                <span>{item.type === "HOME" ? "Home" : item.type === "WORK" ? "Office" : "Other"}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Save to Profile (for logged in customers) */}
      {isLoggedIn && (
        <label className="flex items-center gap-2 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={formData.saveToProfile}
            onChange={(e) => setFormData({ ...formData, saveToProfile: e.target.checked })}
            className="w-4 h-4 rounded text-muted-gold focus:ring-muted-gold border-champagne"
          />
          <span className="text-xs text-dark-brown/80 font-medium">
            Save this address to my profile for future orders
          </span>
        </label>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-champagne/30">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg border border-champagne/70 text-xs font-medium text-dark-brown/80 hover:bg-secondary-bg transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-charcoal hover:bg-muted-gold text-white text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer shadow-subtle"
        >
          {submitButtonText}
        </button>
      </div>
    </form>
  );
}

