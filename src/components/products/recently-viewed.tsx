"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import { ProductDTO } from "@/types/product";
import { ProductGridItem } from "@/components/products/product-grid-item";
import { QuickViewModal } from "@/components/products/quick-view-modal";
import {
  trackRecentlyViewed,
  getRecentlyViewed,
  clearRecentlyViewed,
} from "@/lib/recently-viewed";
import { toast } from "@/components/ui/toast";
import { Clock, Trash2 } from "lucide-react";

interface RecentlyViewedProps {
  currentProduct?: ProductDTO;
  title?: string;
  subtitle?: string;
  maxItems?: number;
  className?: string;
}

const emptySubscribe = () => () => {};

export function RecentlyViewed({
  currentProduct,
  title = "Recently Viewed Pieces",
  subtitle = "Your Curated Journey",
  maxItems = 4,
  className = "",
}: RecentlyViewedProps) {
  const [items, setItems] = useState<ProductDTO[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductDTO | null>(null);

  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentProduct) {
        const updated = trackRecentlyViewed(currentProduct);
        // Filter out the current product so we don't display it to itself
        setItems(updated.filter((p) => p.id !== currentProduct.id).slice(0, maxItems));
      } else {
        const stored = getRecentlyViewed();
        setItems(stored.slice(0, maxItems));
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [currentProduct, maxItems]);

  const handleClear = () => {
    clearRecentlyViewed();
    setItems([]);
    toast.info("Browsing History Cleared", "Your recently viewed items have been reset.");
  };

  if (!isMounted || items.length === 0) {
    return null;
  }

  return (
    <section className={`pt-14 pb-4 border-t border-champagne/40 ${className}`}>
      {/* Section Header with Clear History Button */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-gold font-semibold mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{subtitle}</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">
            {title}
          </h2>
        </div>

        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear recently viewed history"
          className="inline-flex items-center gap-1.5 text-xs text-dark-brown/60 hover:text-rose-600 transition-colors cursor-pointer py-1 px-2 rounded-md hover:bg-secondary-bg/60"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {items.map((p) => (
          <ProductGridItem
            key={p.id}
            product={p}
            onQuickView={(prod) => setQuickViewProduct(prod)}
          />
        ))}
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  );
}
