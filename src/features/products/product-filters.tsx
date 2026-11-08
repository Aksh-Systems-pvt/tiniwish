"use client";

import React from "react";
import { SubcategoryDTO } from "@/types/product";
import { SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export interface FilterState {
  subcategorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface ProductFiltersProps {
  subcategories: SubcategoryDTO[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  activeCount: number;
}

const PRICE_TIERS = [
  { label: "All Prices", min: undefined, max: undefined },
  { label: "Under ₹1,999", min: 0, max: 1999 },
  { label: "₹2,000 to ₹3,499", min: 2000, max: 3499 },
  { label: "Above ₹3,500", min: 3500, max: undefined },
];

export function ProductFilters({
  subcategories,
  filters,
  onFilterChange,
  onReset,
  activeCount,
}: ProductFiltersProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleSubcategory = (slug?: string) => {
    onFilterChange({
      ...filters,
      subcategorySlug: filters.subcategorySlug === slug ? undefined : slug,
    });
  };

  const handlePriceTier = (min?: number, max?: number) => {
    onFilterChange({
      ...filters,
      minPrice: min,
      maxPrice: max,
    });
  };

  const renderFilterBody = () => (
    <div className="space-y-6">
      {/* Subcategories */}
      {subcategories.length > 0 && (
        <div>
          <h4 className="font-serif text-sm font-semibold text-charcoal tracking-wide uppercase mb-3">
            Collections
          </h4>
          <div className="space-y-2">
            <button
              onClick={() => handleSubcategory(undefined)}
              className={`w-full text-left text-xs py-1.5 px-2.5 rounded transition-colors flex items-center justify-between cursor-pointer ${
                !filters.subcategorySlug
                  ? "bg-champagne-light text-charcoal font-semibold"
                  : "text-stone hover:bg-ivory-soft hover:text-charcoal"
              }`}
            >
              <span>All Items</span>
            </button>
            {subcategories.map((sub) => {
              const isSelected = filters.subcategorySlug === sub.slug;
              return (
                <button
                  key={sub.id}
                  onClick={() => handleSubcategory(sub.slug)}
                  className={`w-full text-left text-xs py-1.5 px-2.5 rounded transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-champagne-light text-charcoal font-semibold"
                      : "text-stone hover:bg-ivory-soft hover:text-charcoal"
                  }`}
                >
                  <span>{sub.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Ranges */}
      <div className="pt-4 border-t border-warm-beige">
        <h4 className="font-serif text-sm font-semibold text-charcoal tracking-wide uppercase mb-3">
          Price Range (INR)
        </h4>
        <div className="space-y-2">
          {PRICE_TIERS.map((tier, idx) => {
            const isSelected =
              filters.minPrice === tier.min && filters.maxPrice === tier.max;
            return (
              <button
                key={idx}
                onClick={() => handlePriceTier(tier.min, tier.max)}
                className={`w-full text-left text-xs py-1.5 px-2.5 rounded transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-champagne-light text-charcoal font-semibold"
                    : "text-stone hover:bg-ivory-soft hover:text-charcoal"
                }`}
              >
                <span>{tier.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset button */}
      {activeCount > 0 && (
        <div className="pt-4 border-t border-warm-beige">
          <Button
            onClick={() => {
              onReset();
              setMobileOpen(false);
            }}
            variant="outline"
            className="w-full text-xs text-stone hover:text-charcoal border-warm-beige hover:bg-champagne-light/50 flex items-center justify-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset All Filters ({activeCount})</span>
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filter Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white p-6 rounded-lg border border-warm-beige/80 self-start">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-warm-beige">
          <span className="font-serif text-base font-medium text-charcoal">Filters</span>
          {activeCount > 0 && (
            <span className="text-[11px] bg-champagne-light text-gold-deep px-2 py-0.5 rounded-full font-medium">
              {activeCount} active
            </span>
          )}
        </div>
        {renderFilterBody()}
      </aside>

      {/* Mobile Filter Sheet Drawer */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            aria-label="Open Filter Drawer"
            className="inline-flex items-center gap-2 bg-white border border-warm-beige text-charcoal px-4 py-2 rounded-md text-xs font-medium hover:bg-champagne-light cursor-pointer shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-gold-dark" />
            <span>Filters {activeCount > 0 ? `(${activeCount})` : ""}</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] bg-ivory p-6 overflow-y-auto">
            <SheetTitle className="font-serif text-xl font-medium text-charcoal mb-4">
              Filter Collection
            </SheetTitle>
            {renderFilterBody()}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

