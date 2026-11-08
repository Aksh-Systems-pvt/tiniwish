"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";
import { CategoryDTO, SubcategoryDTO } from "@/types/product";

interface CategoryHeroBannerProps {
  category: CategoryDTO;
  activeSubcategory?: SubcategoryDTO | null;
  productCount: number;
}

const CATEGORY_TAGLINES: Record<string, string> = {
  jewellery: "Maison Collection · Royal Splendor",
  gifts: "Keepsake Curations · The Art of Thoughtful Gifting",
  "home-decor": "Sanctuary Living · Artisanal Indian Warmth",
};

export function CategoryHeroBanner({
  category,
  activeSubcategory,
  productCount,
}: CategoryHeroBannerProps) {
  const isSubcategory = Boolean(activeSubcategory);
  const title = activeSubcategory ? activeSubcategory.name : category.name;
  const description =
    (activeSubcategory && activeSubcategory.description) ||
    category.description ||
    "Discover handcrafted treasures designed to celebrate life's most precious occasions.";

  const tagline =
    CATEGORY_TAGLINES[category.slug] || "Handcrafted Heritage · Timeless Treasures";

  const bannerImage =
    (activeSubcategory && activeSubcategory.imageUrl) ||
    category.imageUrl ||
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=85&w=1920&auto=format&fit=crop";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-charcoal text-white shadow-card">
      {/* Background Editorial Photography */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bannerImage}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Editorial Gradients for Readability and Mood */}
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/95 via-charcoal/80 to-charcoal/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-transparent to-transparent" />
      </div>

      {/* Banner Content Container */}
      <div className="relative z-10 px-6 sm:px-10 lg:px-14 py-12 sm:py-16 lg:py-20 max-w-4xl space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-champagne/80 font-sans">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-champagne/50" />
          <Link href="/products" className="hover:text-white transition-colors">
            Collections
          </Link>
          <ChevronRight className="w-3 h-3 text-champagne/50" />
          {isSubcategory ? (
            <>
              <Link
                href={`/categories/${category.slug}`}
                className="hover:text-white transition-colors"
              >
                {category.name}
              </Link>
              <ChevronRight className="w-3 h-3 text-champagne/50" />
              <span className="text-white font-medium" aria-current="page">
                {activeSubcategory?.name}
              </span>
            </>
          ) : (
            <span className="text-white font-medium" aria-current="page">
              {category.name}
            </span>
          )}
        </nav>

        {/* Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-champagne text-[11px] uppercase tracking-widest font-semibold">
          <Sparkles className="w-3 h-3 text-muted-gold" />
          <span>{tagline}</span>
        </div>

        {/* Editorial Title */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal tracking-tight leading-tight">
          {title}
        </h1>

        {/* Category Description */}
        <p className="text-sm sm:text-base text-primary-bg/85 font-light leading-relaxed max-w-2xl">
          {description}
        </p>

        {/* Product Count Pill */}
        <div className="pt-2 flex items-center gap-4 text-xs text-champagne font-light">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-charcoal/60 backdrop-blur-sm border border-champagne/30 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-gold animate-pulse" />
            <span>
              {productCount} {productCount === 1 ? "treasure" : "treasures"} in atelier
            </span>
          </span>
          <span className="text-champagne/60 hidden sm:inline">
            Complimentary velvet gift packaging across India
          </span>
        </div>
      </div>
    </div>
  );
}

