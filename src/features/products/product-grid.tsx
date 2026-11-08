"use client";

import React, { useState } from "react";
import { ProductDTO } from "@/types/product";
import { ProductCard } from "@/features/products/product-card";
import { QuickViewModal } from "@/features/products/quick-view-modal";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductGridProps {
  products: ProductDTO[];
  onResetFilters?: () => void;
}

export function ProductGrid({ products, onResetFilters }: ProductGridProps) {
  const [quickViewProduct, setQuickViewProduct] = useState<ProductDTO | null>(null);

  if (products.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center bg-white rounded-lg border border-warm-beige/80 p-8 my-8">
        <div className="w-12 h-12 rounded-full bg-champagne-light flex items-center justify-center text-gold-dark mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-2xl text-charcoal font-medium mb-2">
          No treasures found
        </h3>
        <p className="text-sm text-stone max-w-md mx-auto mb-6">
          We couldn&apos;t find any products matching your selected criteria. Try adjusting your price range or clearing filters to discover more items.
        </p>
        {onResetFilters && (
          <Button
            onClick={onResetFilters}
            className="bg-charcoal hover:bg-gold-dark text-ivory text-xs px-6 py-2.5 tracking-wider uppercase"
          >
            Clear All Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        ))}
      </div>

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  );
}

