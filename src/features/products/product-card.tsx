"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Eye, Star } from "lucide-react";
import { ProductDTO } from "@/types/product";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: ProductDTO;
  onQuickView?: (product: ProductDTO) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const defaultVariant = product.variants.find((v) => v.isDefault) || product.variants[0];
  const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || "/images/placeholder.jpg";
  const secondaryImage = product.images.length > 1 ? product.images[1].url : primaryImage;

  const currentPrice = defaultVariant ? defaultVariant.sellingPrice : 0;
  const compareAtPrice = defaultVariant ? defaultVariant.mrp : null;

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  return (
    <div
      className="group relative flex flex-col bg-white rounded-lg border border-champagne/40 overflow-hidden transition-all duration-300 hover:shadow-hover hover:border-muted-gold/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Hover Transition */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary-bg/30">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <Image
            src={isHovered ? secondaryImage : primaryImage}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-all duration-700 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Wishlist Action Button */}
        <button
          onClick={toggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer ${
            isWishlisted
              ? "bg-white text-rose-600 shadow-card"
              : "bg-white/80 text-dark-brown/70 hover:text-charcoal hover:bg-white shadow-subtle"
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current text-rose-600" : ""}`} />
        </button>

        {/* Quick View Button overlay */}
        {onQuickView && (
          <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
            <Button
              onClick={handleQuickView}
              variant="secondary"
              className="w-full bg-white/95 hover:bg-white text-charcoal text-xs font-sans font-medium tracking-wider uppercase py-2 shadow-card border border-champagne cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-muted-gold" />
              <span>Quick View</span>
            </Button>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Subtitle / Category & Rating */}
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="text-[10px] uppercase tracking-widest text-dark-brown/60 font-medium truncate">
              {product.subcategoryName || product.categoryName}
            </span>
            <div className="flex items-center gap-1 text-muted-gold font-medium">
              <Star className="w-3 h-3 fill-current text-muted-gold" />
              <span className="text-[11px] text-charcoal">{product.rating}</span>
              <span className="text-dark-brown/40 text-[10px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/products/${product.slug}`} className="block group-hover:text-muted-gold transition-colors">
            <h3 className="font-serif text-sm sm:text-base font-normal text-charcoal line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Price & Discount */}
        <div className="mt-3 pt-3 border-t border-secondary-bg">
          <Price
            amount={currentPrice}
            compareAtAmount={compareAtPrice}
            showDiscountBadge={true}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}

