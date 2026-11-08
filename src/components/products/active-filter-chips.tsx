"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { X, RotateCcw } from "lucide-react";
import { SubcategoryDTO } from "@/types/product";

interface ActiveFilterChipsProps {
  subcategories?: SubcategoryDTO[];
  className?: string;
}

const PRICE_LABELS: Record<string, string> = {
  "under-1000": "Under ₹1,000",
  "1000-2500": "₹1,000 – ₹2,499",
  "2500-5000": "₹2,500 – ₹4,999",
  "above-5000": "Above ₹5,000",
};

export function ActiveFilterChips({
  subcategories = [],
  className = "",
}: ActiveFilterChipsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const subSlug = searchParams.get("sub");
  const priceKey = searchParams.get("price");
  const inStock = searchParams.get("inStock") === "true";
  const sort = searchParams.get("sort");

  // Determine subcategory label
  const activeSubcategory = subcategories.find((s) => s.slug === subSlug);

  // Check if any filter is active
  const hasActiveFilters = Boolean(subSlug || priceKey || inStock || sort);

  if (!hasActiveFilters) {
    return null;
  }

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    if (key === "price") {
      params.delete("minPrice");
      params.delete("maxPrice");
    }
    params.delete("page"); // Reset pagination

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const clearAllFilters = () => {
    router.push(pathname, { scroll: false });
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 pt-2 ${className}`}>
      <span className="text-[11px] uppercase tracking-wider text-dark-brown/60 font-semibold mr-1">
        Active Filters:
      </span>

      {/* Subcategory chip */}
      {subSlug && (
        <button
          type="button"
          onClick={() => removeFilter("sub")}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne-light/70 text-charcoal border border-champagne text-xs font-medium hover:border-muted-gold hover:text-muted-gold transition-colors"
        >
          <span>{activeSubcategory?.name || subSlug}</span>
          <X className="w-3 h-3 text-muted-gold" />
        </button>
      )}

      {/* Price range chip */}
      {priceKey && (
        <button
          type="button"
          onClick={() => removeFilter("price")}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne-light/70 text-charcoal border border-champagne text-xs font-medium hover:border-muted-gold hover:text-muted-gold transition-colors"
        >
          <span>{PRICE_LABELS[priceKey] || "Custom Price"}</span>
          <X className="w-3 h-3 text-muted-gold" />
        </button>
      )}

      {/* In Stock chip */}
      {inStock && (
        <button
          type="button"
          onClick={() => removeFilter("inStock")}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne-light/70 text-charcoal border border-champagne text-xs font-medium hover:border-muted-gold hover:text-muted-gold transition-colors"
        >
          <span>In Stock Only</span>
          <X className="w-3 h-3 text-muted-gold" />
        </button>
      )}

      {/* Sort chip */}
      {sort && (
        <button
          type="button"
          onClick={() => removeFilter("sort")}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-champagne-light/70 text-charcoal border border-champagne text-xs font-medium hover:border-muted-gold hover:text-muted-gold transition-colors"
        >
          <span>Sort: {sort}</span>
          <X className="w-3 h-3 text-muted-gold" />
        </button>
      )}

      {/* Clear all button */}
      <button
        type="button"
        onClick={clearAllFilters}
        className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-muted-gold font-medium hover:text-charcoal transition-colors ml-1"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Clear All</span>
      </button>
    </div>
  );
}

