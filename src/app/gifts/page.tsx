import React, { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryView } from "@/components/categories/category-view";
import { SkeletonProductCard } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Charming Gifts | TiniWish Keepsake Curations",
  description:
    "Discover handcrafted gift boxes, personalized keepsakes, wedding hampers, and thoughtful surprises wrapped in signature champagne satin.",
  openGraph: {
    title: "Charming Gifts | TiniWish Keepsake Curations",
    description: "Thoughtfully curated hampers, bespoke keepsake boxes, and celebratory gifts.",
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

export default function GiftsPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<CategoryLoadingSkeleton />}>
      <CategoryView slug="gifts" searchParams={searchParams} />
    </Suspense>
  );
}
