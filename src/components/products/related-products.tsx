import React from "react";
import { ProductDTO } from "@/types/product";
import { ProductGridItem } from "@/components/products/product-grid-item";

interface RelatedProductsProps {
  products: ProductDTO[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="pt-16 border-t border-champagne/40">
      <div className="mb-8">
        <span className="text-xs uppercase tracking-widest text-muted-gold font-semibold block mb-1">
          Complete Your Ensemble
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">
          You May Also Adore
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductGridItem key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

