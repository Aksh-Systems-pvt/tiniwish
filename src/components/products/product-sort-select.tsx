"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

export interface SortOption {
  value: string;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: "featured", label: "Featured Curation" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Customer Rating" },
  { value: "newest", label: "Newest Arrivals" },
];

interface ProductSortSelectProps {
  currentSort?: string;
  className?: string;
}

export function ProductSortSelect({
  currentSort = "featured",
  className = "",
}: ProductSortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (newSort === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", newSort);
    }
    // Reset to page 1 on sort change
    params.delete("page");

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div className="relative flex items-center">
        <label htmlFor="product-sort" className="sr-only">
          Sort treasures by
        </label>
        <span className="hidden sm:inline-block text-xs uppercase tracking-wider text-dark-brown/70 font-medium mr-2">
          Sort by:
        </span>
        <div className="relative">
          <select
            id="product-sort"
            value={currentSort || "featured"}
            onChange={handleSortChange}
            className="appearance-none bg-white border border-champagne/80 hover:border-muted-gold rounded-full px-4 py-2 pr-9 text-xs font-medium text-charcoal focus:outline-none focus:ring-1 focus:ring-muted-gold transition-colors cursor-pointer shadow-xs"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-gold pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

