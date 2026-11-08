"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/store-context";
import { EmptyWishlist } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag, ArrowRight, Heart } from "lucide-react";

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, toggleWishlist, addToCart } = useStore();

  const handleMoveToCart = (item: (typeof wishlist)[0]) => {
    addToCart({
      id: `${item.productId}-default`,
      productId: item.productId,
      title: item.title,
      slug: item.slug,
      image: item.image,
      price: item.price,
    });
    toggleWishlist(item);
  };

  return (
    <div className="py-12 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-8 pb-4 border-b border-champagne/40 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl sm:text-4xl text-charcoal font-normal flex items-center gap-2">
              <Heart className="w-6 h-6 text-muted-gold fill-muted-gold/20" />
              <span>Saved Treasures</span>
            </h1>
            <p className="text-xs sm:text-sm text-dark-brown/70 mt-1">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"} reserved in your personal wish list.
            </p>
          </div>

          {wishlist.length > 0 && (
            <Link
              href="/products"
              className="text-xs font-medium text-charcoal hover:text-muted-gold inline-flex items-center gap-1 transition-colors"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

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
                    <button
                      type="button"
                      onClick={() => toggleWishlist(item)}
                      aria-label={`Remove ${item.title} from wishlist`}
                      className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 text-dark-brown/60 hover:text-destructive hover:bg-white shadow-sm transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
      </div>
    </div>
  );
}
