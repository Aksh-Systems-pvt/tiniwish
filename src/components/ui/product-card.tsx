"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Eye, Star, ShoppingBag } from "lucide-react"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"

export interface ProductCardUIProps {
  id: string
  title: React.ReactNode
  slug: string
  price: number | string
  compareAtPrice?: number | string | null
  primaryImage: string
  secondaryImage?: string | null
  categoryName?: string | null
  altText?: string
  rating?: number
  reviewCount?: number
  isWishlisted?: boolean
  isBestseller?: boolean
  isNewArrival?: boolean
  badgeText?: string
  inStock?: boolean
  onWishlistToggle?: (id: string, e: React.MouseEvent) => void
  onQuickView?: (id: string, e: React.MouseEvent) => void
  onAddToCart?: (id: string, e: React.MouseEvent) => void
  className?: string
}

export function ProductCardUI({
  id,
  title,
  slug,
  price,
  compareAtPrice,
  primaryImage,
  secondaryImage,
  categoryName,
  altText,
  rating,
  reviewCount,
  isWishlisted = false,
  isBestseller = false,
  isNewArrival = false,
  badgeText,
  inStock = true,
  onWishlistToggle,
  onQuickView,
  onAddToCart,
  className,
}: ProductCardUIProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  const numPrice = Number(price) || 0
  const numCompare = compareAtPrice ? Number(compareAtPrice) : null
  const discountPercent =
    numCompare && numCompare > numPrice
      ? Math.round(((numCompare - numPrice) / numCompare) * 100)
      : null

  const displayImage = isHovered && secondaryImage ? secondaryImage : primaryImage

  return (
    <div
      data-slot="product-card"
      className={cn(
        "group relative flex flex-col bg-white rounded-lg border border-champagne/40 overflow-hidden transition-all duration-300 hover:shadow-hover hover:border-muted-gold/50",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3:4 Luxury Aspect Ratio Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary-bg/30">
        <Link href={`/products/${slug}`} className="block w-full h-full">
          <Image
            src={displayImage || "/images/placeholder.jpg"}
            alt={altText || (typeof title === "string" ? title : "TiniWish luxury treasure")}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Badges strip (Discount, Bestseller, New Arrival, In-Stock) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none items-start">
          {isBestseller && (
            <Badge variant="gold" className="text-[9px] font-sans font-medium tracking-widest px-2 py-0.5 shadow-subtle bg-muted-gold text-white border-none">
              Bestseller
            </Badge>
          )}
          {isNewArrival && !isBestseller && (
            <Badge variant="champagne" className="text-[9px] font-sans font-medium tracking-widest px-2 py-0.5 shadow-subtle bg-champagne text-charcoal border-none">
              New Arrival
            </Badge>
          )}
          {discountPercent && discountPercent > 0 && (
            <Badge variant="outline" className="text-[9px] font-sans font-semibold tracking-wider px-2 py-0.5 bg-white/95 text-charcoal border-champagne/80 shadow-subtle">
              Save {discountPercent}%
            </Badge>
          )}
          {badgeText && !isBestseller && !isNewArrival && (
            <Badge variant="champagne" className="text-[9px] font-sans font-medium tracking-widest px-2 py-0.5 shadow-subtle">
              {badgeText}
            </Badge>
          )}
          {!inStock && (
            <Badge variant="outline" className="bg-charcoal/90 text-white text-[9px] px-2 py-0.5 border-none">
              Sold Out
            </Badge>
          )}
        </div>

        {/* Wishlist Action Button */}
        {onWishlistToggle && (
          <button
            type="button"
            onClick={(e) => onWishlistToggle(id, e)}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(
              "absolute top-2.5 right-2.5 size-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer z-10",
              isWishlisted
                ? "bg-white text-rose-600 shadow-card"
                : "bg-white/80 backdrop-blur-xs text-dark-brown/70 hover:text-charcoal hover:bg-white shadow-subtle"
            )}
          >
            <Heart className={cn("size-4 transition-transform active:scale-90", isWishlisted && "fill-current text-rose-600")} />
          </button>
        )}

        {/* Hover Quick Actions Overlay */}
        <div className="absolute inset-x-2.5 bottom-2.5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
          {onQuickView && (
            <button
              type="button"
              onClick={(e) => onQuickView(id, e)}
              className="flex-1 h-9 rounded-md bg-white/95 hover:bg-white text-charcoal border border-champagne text-xs font-sans font-medium tracking-wider uppercase shadow-card flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="size-3.5 text-muted-gold" />
              <span>Quick View</span>
            </button>
          )}
          {onAddToCart && inStock && (
            <button
              type="button"
              onClick={(e) => onAddToCart(id, e)}
              className="size-9 rounded-md bg-charcoal hover:bg-dark-brown text-white shadow-card flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Add to cart"
            >
              <ShoppingBag className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Category Subtitle & Rating */}
          <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
            {categoryName && (
              <span className="text-[10px] uppercase tracking-widest text-dark-brown/60 font-sans font-medium truncate">
                {categoryName}
              </span>
            )}
            {typeof rating === "number" && (
              <div className="flex items-center gap-1 text-muted-gold font-sans text-xs ml-auto shrink-0">
                <Star className="size-3 fill-current text-muted-gold" />
                <span className="font-medium text-[11px] text-charcoal">{rating.toFixed(1)}</span>
                {typeof reviewCount === "number" && (
                  <span className="text-dark-brown/40 text-[10px]">({reviewCount})</span>
                )}
              </div>
            )}
          </div>

          {/* Product Title */}
          <Link href={`/products/${slug}`} className="block group/link">
            <h3 className="font-serif text-sm sm:text-base font-normal text-charcoal line-clamp-2 leading-snug group-hover/link:text-muted-gold transition-colors">
              {title}
            </h3>
          </Link>
        </div>

        {/* Price Strip */}
        <div className="mt-3 pt-3 border-t border-secondary-bg flex items-baseline gap-2">
          <span className="font-sans font-medium text-sm sm:text-base text-charcoal">
            ₹{numPrice.toLocaleString("en-IN")}
          </span>
          {numCompare && numCompare > numPrice && (
            <span className="font-sans text-xs text-dark-brown/40 line-through">
              ₹{numCompare.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

