import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { connection } from "next/server";
import { productService } from "@/services/product.service";
import { Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Shop by Category | TiniWish Luxury Collections",
  description:
    "Explore TiniWish flagship categories: Artificial Jewellery, Charming Gifts, and Timeless Home Décor. Little wishes. Timeless treasures.",
};

function CategoriesFallback() {
  return (
    <div className="py-12 sm:py-16 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-12 animate-pulse">
        <div className="h-24 max-w-md mx-auto bg-champagne-light/60 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-96 rounded-3xl bg-champagne-light/70" />
          ))}
        </div>
      </div>
    </div>
  );
}

async function CategoriesContent() {
  await connection();
  const categories = await productService.getCategories();

  return (
    <div className="py-12 sm:py-16 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-12">
        {/* Editorial Heading */}
        <div className="space-y-3 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne-light text-muted-gold text-xs font-semibold uppercase tracking-widest border border-champagne">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Maison Curations</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-charcoal font-normal tracking-tight">
            Shop by Category
          </h1>
          <p className="text-sm sm:text-base text-dark-brown/70 font-light leading-relaxed">
            Delve into our three pillars of luxury Indian craftsmanship, where every design is curated to celebrate elegance and cherished memories.
          </p>
        </div>

        {/* 3 Main Category Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white border border-champagne/60 shadow-xs hover:shadow-card transition-all duration-300"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary-bg">
                <Image
                  src={cat.imageUrl || "/images/placeholder.jpg"}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <h2 className="font-serif text-2xl font-normal tracking-tight">
                    {cat.name}
                  </h2>
                  <p className="text-xs text-primary-bg/80 line-clamp-1 mt-1 font-light">
                    {cat.description}
                  </p>
                </div>
              </div>

              {/* Subcategories list */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {cat.subcategories.slice(0, 6).map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/categories/${cat.slug}?sub=${sub.slug}`}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-primary-bg/80 hover:bg-champagne-light text-dark-brown border border-champagne/60 hover:border-muted-gold transition-colors"
                    >
                      {sub.name}
                    </Link>
                  ))}
                  {cat.subcategories.length > 6 && (
                    <span className="text-[11px] px-2.5 py-1 text-muted-gold font-medium">
                      +{cat.subcategories.length - 6} more
                    </span>
                  )}
                </div>

                <Link
                  href={`/categories/${cat.slug}`}
                  className="inline-flex items-center justify-between w-full pt-3 border-t border-champagne/40 text-xs uppercase tracking-wider font-medium text-charcoal group-hover:text-muted-gold transition-colors"
                >
                  <span>Explore {cat.name}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CategoriesOverviewPage() {
  return (
    <Suspense fallback={<CategoriesFallback />}>
      <CategoriesContent />
    </Suspense>
  );
}
