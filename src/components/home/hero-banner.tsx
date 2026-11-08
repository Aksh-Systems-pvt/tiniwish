"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BannerDTO } from "@/types/banner";

interface HeroBannerProps {
  banners: BannerDTO[];
}

export function HeroBanner({ banners }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const total = banners.length > 0 ? banners.length : 1;

  const next = () => setCurrentIndex((prev) => (prev + 1) % total);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + total) % total);

  useEffect(() => {
    if (isPaused || total <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, total]);

  const activeBanner = banners[currentIndex] || {
    id: "default",
    title: "Little Things. Beautiful Moments.",
    subtitle: "Discover thoughtfully curated jewellery, charming gifts and timeless pieces for your home.",
    linkUrl: "/products",
    desktopImageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=85&w=1920&auto=format&fit=crop",
    ctaText: "Explore Collection",
  };

  return (
    <section
      aria-label="Hero Showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-[600px] sm:h-[680px] lg:h-[760px] bg-secondary-bg/80 overflow-hidden"
    >
      {/* Background Image with Transition */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={activeBanner.desktopImageUrl}
          alt={activeBanner.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center transition-all duration-1000 ease-out scale-100 hover:scale-102"
        />
        {/* Soft luxury champagne & charcoal gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
      </div>

      {/* Hero Content Container */}
      <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex items-center">
        <div className="max-w-2xl text-white space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Subtle Gold Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-charcoal/60 backdrop-blur-md border border-muted-gold/50 text-champagne text-xs uppercase tracking-widest font-sans font-medium">
            <Sparkles className="w-3.5 h-3.5 text-muted-gold animate-pulse" />
            <span>Handcrafted In India • Free Express Shipping Over ₹999</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-ivory leading-[1.1]">
            Little Things. <br />
            <span className="italic font-serif text-champagne font-light">Beautiful Moments.</span>
          </h1>

          {/* Subheading */}
          <p className="font-sans text-sm sm:text-base lg:text-lg text-ivory/85 font-light leading-relaxed max-w-xl">
            {activeBanner.subtitle || "Discover thoughtfully curated jewellery, charming gifts and timeless pieces for your home."}
          </p>

          {/* Call to Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link href={activeBanner.linkUrl || "/products"}>
              <Button className="bg-muted-gold hover:bg-gold-light text-charcoal font-sans text-xs sm:text-sm uppercase tracking-wider font-semibold px-8 py-6 rounded-md shadow-lg transition-all duration-300 hover:scale-102 cursor-pointer flex items-center gap-2">
                <span>{activeBanner.ctaText || "Explore Collection"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/jewellery">
              <Button
                variant="outline"
                className="border-champagne/60 bg-charcoal/40 backdrop-blur-sm text-ivory hover:bg-white/20 text-xs sm:text-sm uppercase tracking-wider font-medium px-8 py-6 rounded-md transition-all cursor-pointer"
              >
                Jewellery Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Navigation Controls */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-charcoal/50 hover:bg-charcoal/80 text-white backdrop-blur-sm border border-champagne/30 transition-all cursor-pointer hidden sm:flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-charcoal/50 hover:bg-charcoal/80 text-white backdrop-blur-sm border border-champagne/30 transition-all cursor-pointer hidden sm:flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {banners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx ? "w-8 bg-muted-gold" : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

