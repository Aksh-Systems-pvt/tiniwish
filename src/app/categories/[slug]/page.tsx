import React, { Suspense } from "react";
import type { Metadata } from "next";
import { productService } from "@/services/product.service";
import { CategoryView } from "@/components/categories/category-view";
import { SkeletonProductCard } from "@/components/ui/skeleton";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const category = await productService.getCategoryBySlug(slug);
    return {
      title: `${category.name} | TiniWish Luxury Collections`,
      description:
        category.description ||
        `Explore the finest handcrafted ${category.name} at TiniWish. Little wishes. Timeless treasures.`,
      openGraph: {
        title: `${category.name} | TiniWish Boutique`,
        description: category.description || `Luxury ${category.name} collection at TiniWish.`,
        images: category.imageUrl ? [{ url: category.imageUrl }] : undefined,
      },
    };
  } catch {
    return {
      title: "Category Collections | TiniWish",
      description: "Discover handcrafted luxury jewellery, charming gifts, and timeless home décor.",
    };
  }
}

function CategoryLoadingSkeleton() {
  return (
    <div className="py-12 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl space-y-8 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-64 sm:h-80 rounded-3xl bg-champagne-light/70" />

        {/* Pills Skeleton */}
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-full bg-champagne-light/60" />
          ))}
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

async function DynamicCategoryContent({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  return <CategoryView slug={slug} searchParams={searchParams} />;
}

export default function DynamicCategoryPage(props: CategoryPageProps) {
  return (
    <Suspense fallback={<CategoryLoadingSkeleton />}>
      <DynamicCategoryContent {...props} />
    </Suspense>
  );
}
