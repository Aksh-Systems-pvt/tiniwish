"use client";

import React, { useState, useRef, MouseEvent } from "react";
import Image from "next/image";
import { ProductImageDTO } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ProductImageGalleryProps {
  images: ProductImageDTO[];
  title: string;
  isBestseller?: boolean;
  discountPercent?: number | null;
  inStock?: boolean;
}

export function ProductImageGallery({
  images,
  title,
  isBestseller = false,
  discountPercent,
  inStock = true,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHoverZooming, setIsHoverZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const galleryImages =
    images.length > 0
      ? images
      : [
          {
            id: "def",
            productId: "default",
            url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000&auto=format&fit=crop",
            displayOrder: 1,
            isPrimary: true,
            altText: title,
          },
        ];

  const currentImage = galleryImages[selectedIndex] || galleryImages[0];

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } =
      imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="space-y-4">
      {/* Primary 3:4 Luxury Image Frame with Zoom */}
      <div
        ref={imageContainerRef}
        onMouseEnter={() => setIsHoverZooming(true)}
        onMouseLeave={() => setIsHoverZooming(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setIsLightboxOpen(true)}
        className="group relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-secondary-bg/30 border border-champagne/60 shadow-subtle cursor-crosshair select-none"
        aria-label="Product Image View. Hover to zoom, click for full-screen view."
      >
        {/* Standard High-Res Image */}
        <Image
          src={currentImage.url}
          alt={currentImage.altText || `${title} view ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 650px"
          className={`object-cover transition-opacity duration-300 ${
            isHoverZooming ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Dynamic Magnifier Zoom Layer (follows cursor) */}
        {isHoverZooming && (
          <div
            className="absolute inset-0 bg-no-repeat pointer-events-none transition-transform duration-75"
            style={{
              backgroundImage: `url(${currentImage.url})`,
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              backgroundSize: "220%",
            }}
          />
        )}

        {/* Badges Strip */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 pointer-events-none items-start">
          {isBestseller && (
            <Badge className="bg-muted-gold text-white text-[10px] font-medium tracking-widest px-3 py-1 shadow-sm border-none uppercase">
              Bestseller
            </Badge>
          )}
          {discountPercent && discountPercent > 0 && (
            <Badge className="bg-white/95 text-charcoal border border-champagne text-[10px] font-semibold tracking-wider px-3 py-1 shadow-sm uppercase">
              Save {discountPercent}%
            </Badge>
          )}
          {!inStock && (
            <Badge className="bg-charcoal text-white text-[10px] tracking-widest px-3 py-1 border-none uppercase">
              Sold Out
            </Badge>
          )}
        </div>

        {/* Zoom Hint Icon */}
        <div className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-xs text-charcoal opacity-70 group-hover:opacity-100 transition-opacity shadow-sm pointer-events-none">
          <ZoomIn className="w-4 h-4 text-muted-gold" />
        </div>

        {/* Navigation Arrows for Multi-image */}
        {galleryImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous product image"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 text-charcoal hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next product image"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 text-charcoal hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Bar */}
      {galleryImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {galleryImages.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              aria-label={`View photo ${idx + 1} of ${galleryImages.length}`}
              className={`relative w-20 h-24 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 bg-secondary-bg/20 ${
                selectedIndex === idx
                  ? "border-muted-gold ring-2 ring-muted-gold/40 shadow-sm"
                  : "border-champagne/60 hover:border-muted-gold/50 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText || `${title} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Full-Screen Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-4xl p-0 bg-charcoal/95 border-none text-white overflow-hidden rounded-2xl">
          <DialogTitle className="sr-only">{title} Image Preview</DialogTitle>
          <div className="relative aspect-[3/4] sm:aspect-[4/3] w-full max-h-[85vh] flex items-center justify-center">
            <Image
              src={currentImage.url}
              alt={currentImage.altText || title}
              fill
              className="object-contain"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/60 text-xs tracking-wider">
              {selectedIndex + 1} / {galleryImages.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
