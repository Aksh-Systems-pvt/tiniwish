"use client";

import React from "react";
import { ArrowUpDown } from "lucide-react";

export type SortOption = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

interface ProductSortProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Featured & Curated", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Customer Rating", value: "rating" },
  { label: "Newest Arrivals", value: "newest" },
];

export function ProductSort({ value, onChange }: ProductSortProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-xs text-stone-light flex items-center gap-1">
        <ArrowUpDown className="w-3.5 h-3.5 text-stone" />
        <span className="hidden sm:inline">Sort by:</span>
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="bg-white border border-warm-beige text-charcoal text-xs rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-gold-dark cursor-pointer font-sans"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

