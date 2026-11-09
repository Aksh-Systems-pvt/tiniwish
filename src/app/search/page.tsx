import React, { Suspense } from "react";
import { searchService } from "@/services/search.service";
import { SearchClient } from "./search-client";
import { SkeletonProductCard } from "@/components/ui/skeleton";
import { SearchResponseDTO, SearchSortOption } from "@/types/search";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolved = await searchParams;
  const q = resolved.q?.trim();

  if (q) {
    return {
      title: `Search results for "${q}" | TiniWish`,
      description: `Explore handcrafted luxury jewellery, gifts, and home décor matching "${q}".`,
    };
  }

  return {
    title: "Search Treasures | TiniWish",
    description: "Search for artificial jewellery, keepsake gifts, and artisanal home décor.",
  };
}

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    query?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    material?: string;
    occasion?: string;
    sortBy?: string;
    page?: string;
  }>;
}

function SearchFallback() {
  return (
    <div className="py-12 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl space-y-8 animate-pulse">
        <div className="h-10 bg-champagne/30 rounded-full max-w-xl mx-auto" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

async function SearchResultsLoader({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    query?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    material?: string;
    occasion?: string;
    sortBy?: string;
    page?: string;
  }>;
}) {
  const resolved = await searchParams;
  const q = (resolved.q || resolved.query || "").trim();

  const minPrice = resolved.minPrice ? Number(resolved.minPrice) : undefined;
  const maxPrice = resolved.maxPrice ? Number(resolved.maxPrice) : undefined;
  const page = resolved.page ? Number(resolved.page) : 1;
  const sortBy = (resolved.sortBy as SearchSortOption) || "relevance";

  const searchData: SearchResponseDTO = await searchService.search({
    q,
    category: resolved.category,
    minPrice,
    maxPrice,
    material: resolved.material,
    occasion: resolved.occasion,
    sortBy,
    page,
    limit: 12,
  });

  return <SearchClient initialData={searchData} initialQuery={q} />;
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchResultsLoader searchParams={searchParams} />
    </Suspense>
  );
}
