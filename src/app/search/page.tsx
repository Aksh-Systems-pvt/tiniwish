import React, { Suspense } from "react";
import Link from "next/link";
import { productService } from "@/services/product.service";
import { ProductGridItem } from "@/components/products/product-grid-item";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { ProductDTO } from "@/types/product";
import { SkeletonProductCard } from "@/components/ui/skeleton";

export const metadata = {
  title: "Search Treasures | TiniWish",
  description: "Search for artificial jewellery, keepsake gifts, and artisanal home décor.",
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

const POPULAR_SEARCHES = [
  "Kundan Choker",
  "Pearl Jhumkas",
  "Gift Hamper",
  "Brass Diya",
  "Under ₹1,999",
  "Bridal Set",
];

function SearchFallback() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
}

async function SearchResultsContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";

  let products: ProductDTO[] = [];

  if (query.trim()) {
    try {
      const data = await productService.getProducts({
        query: query.trim(),
        limit: 24,
      });
      products = data.items;
    } catch {
      products = [];
    }
  }

  return (
    <>
      {/* Results Grid */}
      {query && products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-4">
          {products.map((product) => (
            <ProductGridItem key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Empty Query / No Results */}
      {query && products.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-champagne/40 p-8 max-w-lg mx-auto">
          <Search className="w-8 h-8 text-muted-gold mx-auto mb-3" />
          <h3 className="font-serif text-xl text-charcoal">No Treasures Found</h3>
          <p className="text-xs text-dark-brown/70 mt-1">
            We couldn&apos;t find anything matching &ldquo;{query}&rdquo;. Try another search term or browse our collections.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="/jewellery"
              className="px-4 py-2 rounded-lg bg-charcoal text-white text-xs hover:bg-muted-gold transition-colors"
            >
              Jewellery
            </Link>
            <Link
              href="/gifts"
              className="px-4 py-2 rounded-lg bg-charcoal text-white text-xs hover:bg-muted-gold transition-colors"
            >
              Gifts
            </Link>
            <Link
              href="/home-decor"
              className="px-4 py-2 rounded-lg bg-charcoal text-white text-xs hover:bg-muted-gold transition-colors"
            >
              Home Décor
            </Link>
          </div>
        </div>
      )}

      {!query && (
        <div className="py-16 text-center bg-white/60 rounded-2xl border border-champagne/40 p-8 max-w-lg mx-auto">
          <Sparkles className="w-8 h-8 text-muted-gold mx-auto mb-3" />
          <h3 className="font-serif text-xl text-charcoal">Begin Your Search</h3>
          <p className="text-xs text-dark-brown/70 mt-1">
            Use the search bar in the header or select any popular search tag above to discover our collection.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-charcoal text-white text-xs uppercase tracking-wider font-medium hover:bg-muted-gold transition-colors"
          >
            <span>Explore All Treasures</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </>
  );
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div className="py-10 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-4">
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal">
            Search Our Collection
          </h1>
          <p className="text-xs sm:text-sm text-dark-brown/70 font-light">
            Discover exquisite artificial jewellery, heartwarming gifts, and timeless home accents.
          </p>

          {/* Popular searches suggestions */}
          <div className="pt-2">
            <span className="text-[11px] uppercase tracking-wider text-dark-brown/60 font-medium block mb-2">
              Popular Searches
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="text-xs px-3 py-1 rounded-full border border-champagne bg-white text-charcoal hover:border-muted-gold hover:text-muted-gold transition-colors"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Results Container wrapped in Suspense */}
        <Suspense fallback={<SearchFallback />}>
          <SearchResultsContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
