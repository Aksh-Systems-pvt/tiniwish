"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { SubcategoryDTO } from "@/types/product";

interface SubcategoryPillsProps {
  subcategories: SubcategoryDTO[];
  categoryName?: string;
  activeSubcategorySlug?: string;
  className?: string;
}

export function SubcategoryPills({
  subcategories = [],
  categoryName = "Collection",
  activeSubcategorySlug,
  className = "",
}: SubcategoryPillsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (subcategories.length === 0) {
    return null;
  }

  const createSubUrl = (subSlug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (subSlug) {
      params.set("sub", subSlug);
    } else {
      params.delete("sub");
    }
    params.delete("page"); // Reset pagination

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <div className={`w-full overflow-x-auto no-scrollbar py-1 ${className}`}>
      <div className="flex items-center gap-2 min-w-max pb-1">
        {/* All Pill */}
        <Link
          href={createSubUrl(null)}
          className={`text-xs px-4 py-2 rounded-full border transition-all font-medium ${
            !activeSubcategorySlug
              ? "bg-charcoal text-white border-charcoal shadow-xs"
              : "border-champagne/80 bg-white text-charcoal hover:border-muted-gold hover:text-muted-gold"
          }`}
        >
          All {categoryName}
        </Link>

        {/* Subcategory Pills */}
        {subcategories.map((sub) => {
          const isActive = activeSubcategorySlug === sub.slug;
          return (
            <Link
              key={sub.id}
              href={createSubUrl(sub.slug)}
              className={`text-xs px-4 py-2 rounded-full border transition-all font-medium ${
                isActive
                  ? "bg-charcoal text-white border-charcoal shadow-xs"
                  : "border-champagne/80 bg-white text-charcoal hover:border-muted-gold hover:text-muted-gold"
              }`}
            >
              {sub.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

