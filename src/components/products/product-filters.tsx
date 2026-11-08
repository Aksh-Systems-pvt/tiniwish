"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, Check, X, RotateCcw } from "lucide-react";
import { SubcategoryDTO } from "@/types/product";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

interface ProductFiltersProps {
  subcategories: SubcategoryDTO[];
  categorySlug?: string;
  categoryName?: string;
  totalCount?: number;
  className?: string;
}

interface PriceTier {
  id: string;
  label: string;
  minPrice?: number;
  maxPrice?: number;
}

const PRICE_TIERS: PriceTier[] = [
  { id: "all", label: "All Prices" },
  { id: "under-1000", label: "Under ₹1,000", maxPrice: 1000 },
  { id: "1000-2500", label: "₹1,000 – ₹2,499", minPrice: 1000, maxPrice: 2499 },
  { id: "2500-5000", label: "₹2,500 – ₹4,999", minPrice: 2500, maxPrice: 4999 },
  { id: "above-5000", label: "Above ₹5,000", minPrice: 5000 },
];

interface FilterControlsProps {
  subcategories: SubcategoryDTO[];
  categoryName: string;
  currentSub: string | null;
  currentPrice: string;
  inStockOnly: boolean;
  activeCount: number;
  onSubcategorySelect: (slug: string | null) => void;
  onPriceSelect: (tier: PriceTier) => void;
  onInStockToggle: () => void;
  onResetAll: () => void;
}

function FilterControls({
  subcategories,
  categoryName,
  currentSub,
  currentPrice,
  inStockOnly,
  activeCount,
  onSubcategorySelect,
  onPriceSelect,
  onInStockToggle,
  onResetAll,
}: FilterControlsProps) {
  return (
    <div className="space-y-6 text-sm">
      {/* Subcategory List */}
      {subcategories.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-serif text-sm font-medium text-charcoal tracking-wide flex items-center justify-between">
            <span>Subcategories</span>
            {currentSub && (
              <button
                type="button"
                onClick={() => onSubcategorySelect(null)}
                className="text-[11px] text-muted-gold font-sans font-normal hover:underline"
              >
                Reset
              </button>
            )}
          </h4>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onSubcategorySelect(null)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                !currentSub
                  ? "bg-secondary-bg text-charcoal font-semibold"
                  : "text-dark-brown/80 hover:bg-white hover:text-charcoal"
              }`}
            >
              <span>All {categoryName}</span>
              {!currentSub && <Check className="w-3.5 h-3.5 text-muted-gold" />}
            </button>

            {subcategories.map((sub) => {
              const isSelected = currentSub === sub.slug;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onSubcategorySelect(sub.slug)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                    isSelected
                      ? "bg-secondary-bg text-charcoal font-semibold"
                      : "text-dark-brown/80 hover:bg-white hover:text-charcoal"
                  }`}
                >
                  <span className="truncate">{sub.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-muted-gold" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Tiers */}
      <div className="space-y-3 pt-4 border-t border-champagne/40">
        <h4 className="font-serif text-sm font-medium text-charcoal tracking-wide flex items-center justify-between">
          <span>Price Range</span>
          {currentPrice !== "all" && (
            <button
              type="button"
              onClick={() => onPriceSelect(PRICE_TIERS[0])}
              className="text-[11px] text-muted-gold font-sans font-normal hover:underline"
            >
              Reset
            </button>
          )}
        </h4>
        <div className="space-y-1.5">
          {PRICE_TIERS.map((tier) => {
            const isSelected = currentPrice === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => onPriceSelect(tier)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left ${
                  isSelected
                    ? "bg-secondary-bg text-charcoal font-semibold"
                    : "text-dark-brown/80 hover:bg-white hover:text-charcoal"
                }`}
              >
                <span>{tier.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-muted-gold" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-3 pt-4 border-t border-champagne/40">
        <h4 className="font-serif text-sm font-medium text-charcoal tracking-wide">
          Availability
        </h4>
        <label className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-champagne/60 hover:border-muted-gold cursor-pointer transition-colors">
          <span className="text-xs text-charcoal font-medium">In-Stock Only</span>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={onInStockToggle}
            className="h-4 w-4 rounded border-champagne text-muted-gold focus:ring-muted-gold accent-muted-gold cursor-pointer"
          />
        </label>
      </div>

      {/* Reset button */}
      {activeCount > 0 && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onResetAll}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-champagne text-xs uppercase tracking-wider font-medium text-dark-brown/80 hover:bg-white hover:text-charcoal hover:border-muted-gold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function ProductFilters({
  subcategories = [],
  categoryName = "Collection",
  totalCount,
  className = "",
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const currentSub = searchParams.get("sub");
  const currentPrice = searchParams.get("price") || "all";
  const inStockOnly = searchParams.get("inStock") === "true";

  // Count active filters
  let activeCount = 0;
  if (currentSub) activeCount++;
  if (currentPrice && currentPrice !== "all") activeCount++;
  if (inStockOnly) activeCount++;

  const applyParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "all" || value === "") {
      params.delete(key);
      if (key === "price") {
        params.delete("minPrice");
        params.delete("maxPrice");
      }
    } else {
      params.set(key, value);
    }

    params.delete("page"); // Reset pagination
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const handlePriceSelect = (tier: PriceTier) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tier.id === "all") {
      params.delete("price");
      params.delete("minPrice");
      params.delete("maxPrice");
    } else {
      params.set("price", tier.id);
      if (tier.minPrice !== undefined) {
        params.set("minPrice", tier.minPrice.toString());
      } else {
        params.delete("minPrice");
      }
      if (tier.maxPrice !== undefined) {
        params.set("maxPrice", tier.maxPrice.toString());
      } else {
        params.delete("maxPrice");
      }
    }

    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const handleSubcategorySelect = (slug: string | null) => {
    applyParam("sub", slug);
  };

  const handleInStockToggle = () => {
    applyParam("inStock", inStockOnly ? null : "true");
  };

  const resetAllFilters = () => {
    router.push(pathname, { scroll: false });
    setIsMobileOpen(false);
  };

  const filterControlsProps: FilterControlsProps = {
    subcategories,
    categoryName,
    currentSub,
    currentPrice,
    inStockOnly,
    activeCount,
    onSubcategorySelect: handleSubcategorySelect,
    onPriceSelect: handlePriceSelect,
    onInStockToggle: handleInStockToggle,
    onResetAll: resetAllFilters,
  };

  return (
    <div className={className}>
      {/* Mobile Filter Drawer Button */}
      <div className="lg:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger
            render={
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-champagne/80 bg-white text-xs font-medium text-charcoal hover:border-muted-gold transition-colors shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted-gold" />
                <span>Filters</span>
                {activeCount > 0 && (
                  <span className="flex items-center justify-center h-4 w-4 rounded-full bg-muted-gold text-[10px] font-bold text-white">
                    {activeCount}
                  </span>
                )}
              </button>
            }
          />
          <SheetContent side="left" className="w-[300px] sm:w-[360px] p-6 overflow-y-auto">
            <SheetHeader className="pb-4 border-b border-champagne/40">
              <SheetTitle className="font-serif text-lg text-charcoal flex items-center justify-between">
                <span>Refine Selection</span>
                <SheetClose
                  render={
                    <button
                      type="button"
                      className="h-8 w-8 rounded-full flex items-center justify-center text-charcoal/70 hover:bg-secondary-bg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  }
                />
              </SheetTitle>
            </SheetHeader>

            <div className="py-4">
              <FilterControls {...filterControlsProps} />
            </div>

            <div className="pt-4 border-t border-champagne/40">
              <SheetClose
                render={
                  <button
                    type="button"
                    className="w-full py-2.5 rounded-lg bg-charcoal text-white text-xs uppercase tracking-widest font-medium hover:bg-muted-gold transition-colors"
                  >
                    View {totalCount !== undefined ? `${totalCount} ` : ""}Treasures
                  </button>
                }
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
        <div className="sticky top-24 rounded-2xl bg-primary-bg/70 border border-champagne/60 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-champagne/40">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-muted-gold" />
              <h3 className="font-serif text-base font-normal text-charcoal">
                Refine Treasures
              </h3>
            </div>
            {activeCount > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-gold px-2 py-0.5 rounded-full bg-champagne-light/70 border border-champagne">
                {activeCount} active
              </span>
            )}
          </div>

          <FilterControls {...filterControlsProps} />
        </div>
      </aside>
    </div>
  );
}

