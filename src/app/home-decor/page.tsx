import React, { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryView } from "@/components/categories/category-view";
import { SkeletonProductCard } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Timeless Home Décor | TiniWish Artisanal Accents",
  description:
    "Adorn your living sanctuary and sacred corners with artisanal brassware, handcrafted vases, festive diyas, and carved marble accents.",
  openGraph: {
    title: "Timeless Home Décor | TiniWish Artisanal Accents",
    description: "Artisanal brassware, fluted marble accents, and fragrant soy candles.",
  },
};

interface PageProps {
  searchParams: Promise<{
    sub?: string;
    sort?: string;
    page?: string;
    price?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
  }>;
}

function CategoryLoadingSkeleton() {
  return (
    <div className="py-12 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl space-y-8 animate-pulse">
        <div className="h-64 sm:h-80 rounded-3xl bg-champagne-light/70" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomeDecorPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<CategoryLoadingSkeleton />}>
      <CategoryView slug="home-decor" searchParams={searchParams} />
    </Suspense>
  );
}
