"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useStore, WishlistItem } from "@/context/store-context";
import { EmptyWishlist } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ProductShareModal } from "@/components/products/product-share-modal";
import { QuickViewModal } from "@/components/products/quick-view-modal";
import { RecentlyViewed } from "@/components/products/recently-viewed";
import { ProductDTO } from "@/types/product";
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  Heart,
  Share2,
} from "lucide-react";

export default function WishlistPage() {
  const router = useRouter();
  const {
    wishlist,
    toggleWishlist,
    moveToCart,
    clearWishlist,
    isHydrated,
  } = useStore();

  const [shareProduct, setShareProduct] = useState<WishlistItem | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductDTO | null>(null);

  const handleMoveToCart = async (item: WishlistItem) => {
    await moveToCart(item);
  };

  const handleMoveAllToBag = async () => {
    for (const item of [...wishlist]) {
      await moveToCart(item);
    }
  };

  if (!isHydrated) {
    return (
      <div className="py-12 bg-primary-bg min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl animate-pulse space-y-6">
          <div className="h-8 w-48 bg-champagne/40 rounded" />
          <div className="h-64 bg-white rounded-xl border border-champagne/40" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-12">
        {/* Header Strip with Actions */}
        <div className="pb-5 border-b border-champagne/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-4xl text-charcoal font-normal flex items-center gap-2.5">
              <Heart className="w-6 h-6 text-muted-gold fill-muted-gold/20" />
              <span>Saved Treasures</span>
            </h1>
            <p className="text-xs sm:text-sm text-dark-brown/70 mt-1">
              {wishlist.length} {wishlist.length === 1 ? "piece" : "pieces"} thoughtfully reserved in your boutique wishlist.
            </p>
          </div>

          {wishlist.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={clearWishlist}
                className="text-xs font-medium text-dark-brown/60 hover:text-rose-600 transition-colors cursor-pointer py-1.5 px-3 rounded-md hover:bg-secondary-bg/60"
              >
                Clear All
              </button>
              <Button
                type="button"
                onClick={handleMoveAllToBag}
                variant="outline"
                className="text-xs border-champagne text-charcoal hover:bg-secondary-bg h-9 px-3.5 cursor-pointer flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-muted-gold" />
                <span>Move All to Bag</span>
              </Button>
              <Link
                href="/products"
                className="text-xs font-medium text-charcoal hover:text-muted-gold inline-flex items-center gap-1 transition-colors ml-1"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Content Body */}
        {wishlist.length === 0 ? (
          <EmptyWishlist
            onExplore={() => {
              router.push("/products");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.productId}
                className="group bg-white rounded-xl border border-champagne/50 overflow-hidden flex flex-col justify-between hover:shadow-hover transition-all duration-300"
              >
                <div>
                  <div className="relative aspect-[3/4] w-full bg-secondary-bg/30 overflow-hidden">
                    <Link href={`/products/${item.slug}`}>
                      <Image
                        src={item.image || "/images/placeholder.jpg"}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 300px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* Top Right Quick Actions: Remove & Share */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShareProduct(item)}
                        aria-label={`Share ${item.title}`}
                        className="p-1.5 rounded-full bg-white/90 text-dark-brown/60 hover:text-charcoal hover:bg-white shadow-sm transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleWishlist(item)}
                        aria-label={`Remove ${item.title} from wishlist`}
                        className="p-1.5 rounded-full bg-white/90 text-dark-brown/60 hover:text-rose-600 hover:bg-white shadow-sm transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <Link href={`/products/${item.slug}`}>
                      <h3 className="font-serif text-sm text-charcoal hover:text-muted-gold transition-colors font-medium truncate">
                        {item.title}
                      </h3>
                    </Link>
                    <span className="font-sans text-sm font-semibold text-charcoal mt-1 block">
                      ₹{item.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-secondary-bg/60 mt-2">
                  <Button
                    onClick={() => handleMoveToCart(item)}
                    className="w-full bg-charcoal hover:bg-muted-gold text-white text-xs py-2 h-9 rounded-md font-sans tracking-wide flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Shopping Bag</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recently Viewed Browsing History */}
        <RecentlyViewed />

        {/* Product Sharing Modal */}
        {shareProduct && (
          <ProductShareModal
            isOpen={Boolean(shareProduct)}
            onClose={() => setShareProduct(null)}
            product={{
              id: shareProduct.productId,
              title: shareProduct.title,
              slug: shareProduct.slug,
              price: shareProduct.price,
              image: shareProduct.image,
            }}
          />
        )}

        {/* Quick View Modal */}
        <QuickViewModal
          product={quickViewProduct}
          isOpen={Boolean(quickViewProduct)}
          onClose={() => setQuickViewProduct(null)}
        />
      </div>
    </div>
  );
}
