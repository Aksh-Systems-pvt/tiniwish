import React from "react";
import { Skeleton, SkeletonProductCard } from "@/components/ui/skeleton";

export function HomeLoading() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Skeleton */}
      <div className="w-full h-[550px] bg-secondary-bg/60 animate-pulse rounded-2xl max-w-7xl mx-auto" />

      {/* Categories Skeleton */}
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2 max-w-md mx-auto">
          <Skeleton className="h-4 w-32 mx-auto" />
          <Skeleton className="h-8 w-64 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="aspect-[4/5] rounded-2xl" />
          <Skeleton className="aspect-[4/5] rounded-2xl" />
          <Skeleton className="aspect-[4/5] rounded-2xl" />
        </div>
      </div>

      {/* Product Grid Skeletons */}
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

