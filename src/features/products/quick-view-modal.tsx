"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductDTO, ProductVariantDTO } from "@/types/product";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";
import { Star, ShieldCheck, ShoppingBag, X } from "lucide-react";

interface QuickViewModalProps {
  product: ProductDTO;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDTO>(
    product.variants.find((v) => v.isDefault) || product.variants[0]
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = product.images.length > 0 ? product.images : [{ id: "1", url: "/images/placeholder.jpg", altText: product.title, displayOrder: 1, isPrimary: true, productId: product.id }];
  const currentImage = images[activeImageIndex] || images[0];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-ivory p-0 overflow-hidden border-warm-beige">
        <div className="relative grid grid-cols-1 md:grid-cols-2">
          {/* Close button */}
          <DialogClose className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/80 text-stone hover:text-charcoal transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </DialogClose>

          {/* Left: Gallery view */}
          <div className="bg-ivory-soft p-6 flex flex-col justify-between">
            <div className="relative aspect-square w-full rounded-md overflow-hidden bg-white border border-warm-beige/50">
              <Image
                src={currentImage.url}
                alt={currentImage.altText || product.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-14 rounded border cursor-pointer overflow-hidden transition-all ${
                      activeImageIndex === idx ? "border-gold-dark ring-1 ring-gold-dark" : "border-warm-beige opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img.url} alt={img.altText || ""} fill sizes="56px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Variant Picker */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-gold-dark font-semibold">
                {product.subcategoryName || product.categoryName}
              </span>

              <DialogTitle className="font-serif text-xl sm:text-2xl font-normal text-charcoal mt-1 mb-2">
                {product.title}
              </DialogTitle>

              {/* Rating */}
              <div className="flex items-center gap-1.5 text-xs text-stone mb-4">
                <div className="flex items-center text-gold-dark">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="ml-1 font-semibold">{product.rating}</span>
                </div>
                <span>•</span>
                <span className="text-stone-light">({product.reviewCount} verified reviews)</span>
              </div>

              {/* Price */}
              <div className="mb-6 pb-4 border-b border-warm-beige">
                <Price
                  amount={selectedVariant.sellingPrice}
                  compareAtAmount={selectedVariant.mrp}
                  showDiscountBadge={true}
                  size="lg"
                />
                <span className="text-[11px] text-stone-light block mt-1">
                  Inclusive of all taxes (Indian GST) • Free express shipping over ₹999
                </span>
              </div>

              {/* Variant Selector */}
              {product.variants.length > 1 && (
                <div className="mb-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-charcoal block mb-2">
                    Select Option
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`text-xs px-3 py-2 rounded border transition-all cursor-pointer ${
                          selectedVariant.id === v.id
                            ? "border-charcoal bg-charcoal text-ivory font-medium"
                            : "border-warm-beige bg-white text-stone hover:border-gold-dark"
                        }`}
                      >
                        {v.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-stone line-clamp-3 mb-6 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-warm-beige">
              <Button className="w-full bg-charcoal hover:bg-gold-dark text-ivory text-xs py-5 uppercase tracking-wider font-medium flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Bag</span>
              </Button>

              <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="block text-center text-xs text-stone hover:text-gold-dark font-medium transition-colors py-1"
              >
                View Full Product Details & Specifications →
              </Link>

              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-light pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-dark" />
                <span>100% Authentic Indian Craftsmanship • 7-Day Exchange</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

