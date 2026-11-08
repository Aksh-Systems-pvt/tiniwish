"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductDTO, ProductVariantDTO } from "@/types/product";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/store-context";
import { toast } from "@/components/ui/toast";
import { ShoppingBag, Heart, Star, ExternalLink, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface QuickViewModalProps {
  product: ProductDTO | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const variants = product.variants || [];
  const currentVariantId =
    selectedVariantId ||
    variants.find((v) => v.isDefault)?.id ||
    variants[0]?.id ||
    "default";

  const selectedVariant: ProductVariantDTO =
    variants.find((v) => v.id === currentVariantId) ||
    variants[0] || {
      id: "default",
      productId: product.id,
      sku: "TW-EXP-001",
      title: "Standard Edition",
      attributes: {},
      mrp: 3999,
      sellingPrice: 2999,
      stockQuantity: 10,
      lowStockThreshold: 3,
      weightGrams: 150,
      lengthCm: 15,
      widthCm: 10,
      heightCm: 5,
      isDefault: true,
      isActive: true,
    };

  const images = product.images.length > 0
    ? product.images
    : [
        {
          id: "def",
          productId: product.id,
          url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000&auto=format&fit=crop",
          displayOrder: 1,
          isPrimary: true,
        },
      ];

  const activeImage = images[selectedImageIndex] || images[0];

  const price = selectedVariant.sellingPrice;
  const mrp = selectedVariant.mrp;
  const discountPercent =
    mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;

  const stock = selectedVariant.stockQuantity;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= (selectedVariant.lowStockThreshold || 4);
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("Unavailable", "This item is currently out of stock.");
      return;
    }

    addToCart(
      {
        id: `${product.id}-${selectedVariant.id}`,
        productId: product.id,
        title: product.title,
        slug: product.slug,
        image: activeImage.url,
        price: Number(price),
        variantId: selectedVariant.id,
        variantTitle: selectedVariant.title,
      },
      quantity
    );
    onClose();
  };

  const handleWishlist = () => {
    toggleWishlist({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      image: activeImage.url,
      price: Number(price),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white border border-champagne/80 rounded-2xl">
        <DialogTitle className="sr-only">Quick View: {product.title}</DialogTitle>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Media Gallery */}
          <div className="p-4 sm:p-6 bg-secondary-bg/20 flex flex-col justify-between space-y-3">
            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-white border border-champagne/60 shadow-subtle">
              <Image
                src={activeImage.url}
                alt={activeImage.altText || product.title}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
              {discountPercent && discountPercent > 0 && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-muted-gold text-white text-[10px] font-semibold uppercase tracking-wider shadow-sm">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-14 h-16 rounded-md overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      selectedImageIndex === idx
                        ? "border-muted-gold ring-1 ring-muted-gold/50"
                        : "border-champagne/60 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText || product.title}
                      fill
                      sizes="60px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Purchase Details */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-widest text-muted-gold font-semibold truncate">
                  {product.categoryName || "TiniWish Luxury"}
                </span>
                <span className="text-[10px] font-mono text-dark-brown/50">
                  {selectedVariant.sku}
                </span>
              </div>

              <h2 className="font-serif text-lg sm:text-xl text-charcoal font-normal leading-snug">
                {product.title}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-gold">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        s <= Math.round(product.rating || 5)
                          ? "fill-muted-gold text-muted-gold"
                          : "fill-secondary-bg text-champagne"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-charcoal text-[11px]">
                  {(product.rating || 5.0).toFixed(1)}
                </span>
                <span className="text-dark-brown/50 text-[10px]">
                  ({product.reviewCount || 38})
                </span>
              </div>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-2.5 pb-3 border-b border-champagne/40">
                <span className="font-sans text-xl font-bold text-charcoal">
                  ₹{price.toLocaleString("en-IN")}
                </span>
                {mrp && mrp > price && (
                  <span className="font-sans text-xs text-dark-brown/50 line-through">
                    ₹{mrp.toLocaleString("en-IN")}
                  </span>
                )}
                <span className="text-[10px] text-dark-brown/60">Taxes inclusive</span>
              </div>

              {/* Description Excerpt */}
              <p className="text-xs text-dark-brown/75 font-light leading-relaxed mt-2 line-clamp-3">
                {product.description}
              </p>

              {/* Variants */}
              {variants.length > 1 && (
                <div className="mt-3 space-y-1.5">
                  <span className="text-[11px] font-semibold text-charcoal block">
                    Select Finish:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`text-[11px] px-2.5 py-1 rounded-md border font-medium transition-all cursor-pointer ${
                          currentVariantId === v.id
                            ? "border-charcoal bg-charcoal text-white"
                            : "border-champagne bg-white text-charcoal hover:border-muted-gold"
                        }`}
                      >
                        {v.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="mt-3 text-[11px]">
                {isOutOfStock ? (
                  <span className="flex items-center gap-1 text-destructive font-medium">
                    <XCircle className="w-3.5 h-3.5" />
                    Currently Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="flex items-center gap-1 text-amber-700 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Only {stock} items left in stock
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    In Stock — Ready to dispatch
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-champagne/40">
              <div className="flex items-center gap-2">
                {/* Quantity */}
                <div className="inline-flex items-center rounded-lg border border-champagne bg-white h-10 shrink-0">
                  <button
                    type="button"
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-2.5 text-xs text-dark-brown/70 hover:text-charcoal disabled:opacity-30 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-1.5 text-xs font-semibold text-charcoal font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= stock || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    className="px-2.5 text-xs text-dark-brown/70 hover:text-charcoal disabled:opacity-30 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <Button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="flex-1 bg-charcoal hover:bg-dark-brown text-white text-xs h-10 font-sans uppercase tracking-wider font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? "Sold Out" : "Add to Bag"}</span>
                </Button>

                <button
                  type="button"
                  onClick={handleWishlist}
                  aria-label="Wishlist"
                  className={`h-10 w-10 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    wishlisted
                      ? "border-muted-gold bg-champagne-light/50 text-rose-600"
                      : "border-champagne bg-white text-dark-brown/70 hover:border-muted-gold"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      wishlisted ? "fill-rose-600 text-rose-600" : ""
                    }`}
                  />
                </button>
              </div>

              <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="w-full text-center text-xs font-medium text-dark-brown/80 hover:text-muted-gold flex items-center justify-center gap-1.5 pt-1 transition-colors"
              >
                <span>View Full Details & Specifications</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

