import React from "react";
import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
import { ProductDTO } from "@/types/product";
import { ProductGridItem } from "@/components/products/product-grid-item";

interface BestSellersProps {
  products: ProductDTO[];
}

export function BestSellers({ products }: BestSellersProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-20 lg:py-24 bg-primary-bg border-b border-champagne/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-12">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-champagne/40">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-gold font-sans font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>Beloved by Connoisseurs</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal tracking-tight">
              Most Cherished Treasures
            </h2>
            <p className="text-xs sm:text-sm text-dark-brown/70 font-light max-w-lg">
              Our iconic best sellers, revered for exceptional artisanal detail and heirloom beauty.
            </p>
          </div>

          <Link
            href="/products?sort=bestselling"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-charcoal hover:text-muted-gold transition-colors pb-1"
          >
            <span>View All Best Sellers</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4-Item Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 4).map((product) => (
            <ProductGridItem key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

