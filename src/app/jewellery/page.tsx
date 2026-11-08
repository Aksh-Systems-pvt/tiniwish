import React, { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryView } from "@/components/categories/category-view";
import { SkeletonProductCard } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Artificial Jewellery | TiniWish Luxury Collections",
  description:
    "Explore handcrafted artificial jewellery featuring Kundan chokers, heritage pearl jhumkas, temple necklaces, and royal bangles.",
  openGraph: {
    title: "Artificial Jewellery | TiniWish Luxury Collections",
    description: "Opulent Kundan, Polki, American Diamond, and temple jewellery for modern Indian grace.",
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

export default function JewelleryPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<CategoryLoadingSkeleton />}>
      <CategoryView slug="jewellery" searchParams={searchParams} />
    </Suspense>
  );
}
