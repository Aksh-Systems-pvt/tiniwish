"use client";

import React, { useState, useMemo } from "react";
import { CategoryDTO, ProductDTO } from "@/types/product";
import { ProductFilters, FilterState } from "@/features/products/product-filters";
import { ProductSort, SortOption } from "@/features/products/product-sort";
import { ProductGrid } from "@/features/products/product-grid";

interface CategoryViewProps {
  category: CategoryDTO;
  initialProducts: ProductDTO[];
}

export function CategoryView({ category, initialProducts }: CategoryViewProps) {
  const [filters, setFilters] = useState<FilterState>({});
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filter by subcategory
    if (filters.subcategorySlug) {
      result = result.filter((p) => p.subcategorySlug === filters.subcategorySlug);
    }

    // Filter by price range
    if (filters.minPrice !== undefined) {
      result = result.filter((p) => {
        const lowestPrice = Math.min(...p.variants.map((v) => v.sellingPrice));
        return lowestPrice >= (filters.minPrice ?? 0);
      });
    }

    if (filters.maxPrice !== undefined) {
      result = result.filter((p) => {
        const lowestPrice = Math.min(...p.variants.map((v) => v.sellingPrice));
        return lowestPrice <= (filters.maxPrice ?? Infinity);
      });
    }

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => {
        const priceA = Math.min(...a.variants.map((v) => v.sellingPrice));
        const priceB = Math.min(...b.variants.map((v) => v.sellingPrice));
        return priceA - priceB;
      });
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => {
        const priceA = Math.min(...a.variants.map((v) => v.sellingPrice));
        const priceB = Math.min(...b.variants.map((v) => v.sellingPrice));
        return priceB - priceA;
      });
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [initialProducts, filters, sortBy]);

  const activeFilterCount =
    (filters.subcategorySlug ? 1 : 0) +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0);

  const resetFilters = () => {
    setFilters({});
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Filters Sidebar (desktop & mobile trigger) */}
      <ProductFilters
        subcategories={category.subcategories}
        filters={filters}
        onFilterChange={setFilters}
        onReset={resetFilters}
        activeCount={activeFilterCount}
      />

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Top Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-warm-beige">
          <div className="text-xs text-stone-light">
            Showing <span className="font-semibold text-charcoal">{filteredProducts.length}</span>{" "}
            {filteredProducts.length === 1 ? "treasure" : "treasures"}
          </div>

          <div className="flex items-center gap-4">
            <ProductSort value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        {/* Product Grid */}
        <ProductGrid products={filteredProducts} onResetFilters={resetFilters} />
      </div>
    </div>
  );
}

