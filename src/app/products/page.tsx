import React, { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { productService } from "@/services/product.service";
import { ProductGridItem } from "@/components/products/product-grid-item";
import { ProductSortSelect } from "@/components/products/product-sort-select";
import { ActiveFilterChips } from "@/components/products/active-filter-chips";
import { PaginationControl } from "@/components/products/pagination-control";
import { Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { ProductDTO } from "@/types/product";
import { SkeletonProductCard } from "@/components/ui/skeleton";

export const metadata = {
  title: "All Collections | TiniWish Luxury Catalogue",
  description:
    "Explore the complete TiniWish collection of artificial jewellery, charming celebratory gifts, and artisanal home décor.",
};

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    sub?: string;
    search?: string;
    sort?: string;
    page?: string;
    price?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
  }>;
}

function GridFallback() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
}

async function ProductsContent({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    sub?: string;
    search?: string;
    sort?: string;
    page?: string;
    price?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
  }>;
}) {
  await connection();

  const resolvedParams = await searchParams;
  const categorySlug = resolvedParams.category;
  const subcategorySlug = resolvedParams.sub;
  const searchQuery = resolvedParams.search;
  const currentSort = resolvedParams.sort;
  const currentPage = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;
  const minPrice = resolvedParams.minPrice ? parseFloat(resolvedParams.minPrice) : undefined;
  const maxPrice = resolvedParams.maxPrice ? parseFloat(resolvedParams.maxPrice) : undefined;
  const inStockOnly = resolvedParams.inStock === "true";

  let products: ProductDTO[] = [];
  let totalCount = 0;
  let totalPages = 1;
  const limit = 12;

  try {
    const data = await productService.getProducts({
      categorySlug,
      subcategorySlug,
      query: searchQuery,
      minPrice,
      maxPrice,
      inStockOnly,
      sortBy: (currentSort as "featured" | "price-asc" | "price-desc" | "newest" | "rating") || "featured",
      limit,
      page: currentPage,
    });
    products = data.items;
    totalCount = data.pagination.totalCount;
    totalPages = data.pagination.totalPages;
  } catch {
    products = [];
    totalCount = 0;
    totalPages = 1;
  }

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-champagne/40">
        <span className="text-xs text-dark-brown/70 font-light">
          Showing <span className="font-medium text-charcoal">{products.length}</span> of{" "}
          <span className="font-medium text-charcoal">{totalCount}</span>{" "}
          {totalCount === 1 ? "treasure" : "treasures"}
        </span>

        <ProductSortSelect currentSort={currentSort} />
      </div>

      {/* Active Filter Chips */}
      <ActiveFilterChips />

      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductGridItem key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border border-champagne/40 p-8 max-w-lg mx-auto shadow-xs space-y-4">
          <div className="h-12 w-12 rounded-full bg-secondary-bg flex items-center justify-center mx-auto text-muted-gold border border-champagne">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl text-charcoal">No Treasures Found</h3>
            <p className="text-xs text-dark-brown/70 max-w-sm mx-auto font-light">
              We couldn&apos;t find matching pieces with your current filters. Try resetting price or browsing by category.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-champagne text-xs font-medium text-charcoal hover:border-muted-gold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </Link>
            <Link
              href="/jewellery"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-charcoal text-white text-xs uppercase tracking-wider font-medium hover:bg-muted-gold transition-colors"
            >
              <span>Explore Jewellery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <PaginationControl
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        limit={limit}
      />
    </div>
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const categoryFilters = [
    { label: "All Treasures", href: "/products" },
    { label: "Artificial Jewellery", href: "/jewellery" },
    { label: "Charming Gifts", href: "/gifts" },
    { label: "Timeless Home Décor", href: "/home-decor" },
  ];

  return (
    <div className="py-10 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-3 text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-muted-gold font-semibold">
            Complete Boutique Catalogue
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-charcoal font-normal tracking-tight">
            All Collections
          </h1>
          <p className="text-sm text-dark-brown/70 font-light">
            Every creation is inspected by hand, honoring heritage Indian craftsmanship and contemporary elegance.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {categoryFilters.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="text-xs px-4 py-2 rounded-full border border-champagne/80 bg-white hover:border-muted-gold hover:text-muted-gold transition-colors font-medium text-charcoal"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Product Grid Suspense Boundary */}
        <Suspense fallback={<GridFallback />}>
          <ProductsContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
