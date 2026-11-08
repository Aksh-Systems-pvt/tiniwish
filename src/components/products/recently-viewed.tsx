"use client";

import React, { useEffect, useState } from "react";
import { ProductDTO } from "@/types/product";
import { ProductGridItem } from "@/components/products/product-grid-item";

const RECENTLY_VIEWED_KEY = "tiniwish_recently_viewed_v1";
const MAX_RECENT_ITEMS = 6;

interface RecentlyViewedProps {
  currentProduct: ProductDTO;
}

export function RecentlyViewed({ currentProduct }: RecentlyViewedProps) {
  const [recentProducts, setRecentProducts] = useState<ProductDTO[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      const list: ProductDTO[] = stored ? JSON.parse(stored) : [];

      // Add current product to the front of history without duplicate
      const updatedList = [
        currentProduct,
        ...list.filter((p) => p.id !== currentProduct.id),
      ].slice(0, MAX_RECENT_ITEMS);

      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updatedList));

      // Asynchronously update recent list to comply with strict external state synchronization
      queueMicrotask(() => {
        const displayList = list.filter((p) => p.id !== currentProduct.id).slice(0, 4);
        setRecentProducts(displayList);
      });
    } catch {
      // Storage unavailable
    }
  }, [currentProduct]);

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <section className="pt-16 border-t border-champagne/40">
      <div className="mb-8">
        <span className="text-xs uppercase tracking-widest text-muted-gold font-semibold block mb-1">
          Your Curated Journey
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">
          Recently Viewed Pieces
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {recentProducts.map((p) => (
          <ProductGridItem key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
