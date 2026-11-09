"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  X,
  ChevronDown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { ProductGridItem } from "@/components/products/product-grid-item";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SearchResponseDTO, SearchSortOption } from "@/types/search";
import { POPULAR_SEARCH_TERMS } from "@/lib/search-utils";

interface SearchClientProps {
  initialData: SearchResponseDTO;
  initialQuery: string;
}

export function SearchClient({ initialData, initialQuery }: SearchClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [prevQuery, setPrevQuery] = useState(initialQuery);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Sync state during render when initialQuery prop changes (React recommended pattern)
  if (initialQuery !== prevQuery) {
    setPrevQuery(initialQuery);
    setSearchInput(initialQuery);
  }

  const data = initialData;

  // Read active filter states from URL search params
  const currentQuery = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentMaterial = searchParams.get("material") || "";
  const currentSort = (searchParams.get("sortBy") as SearchSortOption) || "relevance";
  const currentPage = Number(searchParams.get("page") || 1);

  // URL updating helper that keeps search URLs 100% shareable
  const updateUrlParams = (newParams: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset to page 1 whenever filters change (except when page itself is explicitly changed)
    if (!newParams.page) {
      params.delete("page");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ q: searchInput.trim(), page: null });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    updateUrlParams({ q: null, page: null });
  };

  const handleCategorySelect = (categorySlug: string) => {
    updateUrlParams({
      category: currentCategory === categorySlug ? null : categorySlug,
      page: null,
    });
    setIsFilterSheetOpen(false);
  };

  const handlePriceSelect = (min?: number, max?: number) => {
    updateUrlParams({
      minPrice: min !== undefined ? String(min) : null,
      maxPrice: max !== undefined ? String(max) : null,
      page: null,
    });
    setIsFilterSheetOpen(false);
  };

  const handleMaterialSelect = (material: string) => {
    updateUrlParams({
      material: currentMaterial === material ? null : material,
      page: null,
    });
    setIsFilterSheetOpen(false);
  };

  const handleSortChange = (newSort: SearchSortOption) => {
    updateUrlParams({ sortBy: newSort });
  };

  const handlePageChange = (page: number) => {
    updateUrlParams({ page: String(page) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearAllFilters = () => {
    updateUrlParams({
      category: null,
      minPrice: null,
      maxPrice: null,
      material: null,
      sortBy: "relevance",
      page: null,
    });
    setIsFilterSheetOpen(false);
  };

  const hasActiveFilters = Boolean(
    currentCategory || currentMinPrice || currentMaxPrice || currentMaterial || currentSort !== "relevance"
  );

  const filterSummaryCount =
    (currentCategory ? 1 : 0) +
    (currentMinPrice || currentMaxPrice ? 1 : 0) +
    (currentMaterial ? 1 : 0) +
    (currentSort !== "relevance" ? 1 : 0);

  return (
    <div className="py-8 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-8">
        {/* Search Header Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal tracking-tight">
            Search Our Collection
          </h1>
          <p className="text-xs sm:text-sm text-dark-brown/70 font-light">
            Explore handcrafted jewellery, bespoke gifts, and timeless home accents by name, SKU, or keyword.
          </p>

          {/* Interactive Search Input Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center shadow-xs rounded-full border border-champagne bg-white p-1.5 focus-within:border-muted-gold transition-colors"
          >
            <Search className="w-5 h-5 text-muted-gold ml-3.5 mr-2 shrink-0" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by jewellery title, SKU (e.g. TW-JWL), brassware..."
              className="w-full bg-transparent text-sm sm:text-base text-charcoal placeholder:text-dark-brown/40 outline-none pr-3"
              aria-label="Search collection input"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-1.5 text-dark-brown/40 hover:text-charcoal transition-colors cursor-pointer mr-1"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <Button
              type="submit"
              className="rounded-full bg-charcoal text-white hover:bg-muted-gold px-5 py-2 text-xs uppercase tracking-wider font-medium transition-colors cursor-pointer shrink-0"
            >
              Search
            </Button>
          </form>

          {/* Popular Searches Pills */}
          <div className="pt-2">
            <span className="text-[10px] uppercase tracking-wider text-dark-brown/60 font-semibold block mb-2">
              Popular Searches
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {POPULAR_SEARCH_TERMS.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setSearchInput(term);
                    updateUrlParams({ q: term, page: null });
                  }}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                    currentQuery.toLowerCase() === term.toLowerCase()
                      ? "border-muted-gold bg-muted-gold text-white font-medium shadow-xs"
                      : "border-champagne bg-white text-charcoal hover:border-muted-gold hover:text-muted-gold"
                  }`}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Results & Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-champagne/40">
          <div>
            {currentQuery ? (
              <p className="text-xs sm:text-sm text-dark-brown/80 font-sans">
                Found{" "}
                <span className="font-semibold text-charcoal">{data.pagination.totalCount}</span>{" "}
                {data.pagination.totalCount === 1 ? "treasure" : "treasures"} matching &ldquo;
                <span className="font-serif italic font-medium text-muted-gold">{currentQuery}</span>
                &rdquo;
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-dark-brown/80 font-sans">
                Showing all curated treasures ({data.pagination.totalCount})
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            {/* Mobile / Desktop Filter Sheet */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFilterSheetOpen(true)}
              className="rounded-lg border-champagne text-xs flex items-center gap-1.5 cursor-pointer hover:border-muted-gold"
            >
              <Filter className="w-3.5 h-3.5 text-muted-gold" />
              <span>Filters</span>
              {filterSummaryCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-muted-gold text-white text-[10px] font-bold leading-none">
                  {filterSummaryCount}
                </span>
              )}
            </Button>
            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
              <SheetContent side="right" className="w-[320px] sm:w-[380px] bg-primary-bg p-6 overflow-y-auto">
                <SheetHeader className="pb-4 border-b border-champagne/40">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="font-serif text-xl text-charcoal">Filter Treasures</SheetTitle>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="text-xs text-muted-gold hover:text-dark-brown transition-colors underline"
                      >
                        Reset All
                      </button>
                    )}
                  </div>
                </SheetHeader>

                {/* Filter Options */}
                <div className="space-y-6 pt-6">
                  {/* Category Filter */}
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-charcoal">
                      Collection
                    </h4>
                    <div className="space-y-1.5">
                      {data.facets.categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategorySelect(cat.slug)}
                          className={`w-full flex items-center justify-between text-xs px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                            currentCategory === cat.slug
                              ? "bg-muted-gold text-white border-muted-gold font-medium"
                              : "bg-white text-dark-brown border-champagne/60 hover:border-muted-gold"
                          }`}
                        >
                          <span>{cat.name}</span>
                          {cat.count > 0 && (
                            <span className="text-[10px] opacity-80">({cat.count})</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-charcoal">
                      Price Range
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handlePriceSelect(undefined, 1999)}
                        className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                          currentMaxPrice === "1999" && !currentMinPrice
                            ? "bg-muted-gold text-white border-muted-gold font-medium"
                            : "bg-white text-dark-brown border-champagne/60 hover:border-muted-gold"
                        }`}
                      >
                        Under ₹1,999
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePriceSelect(2000, 4999)}
                        className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                          currentMinPrice === "2000" && currentMaxPrice === "4999"
                            ? "bg-muted-gold text-white border-muted-gold font-medium"
                            : "bg-white text-dark-brown border-champagne/60 hover:border-muted-gold"
                        }`}
                      >
                        ₹2,000 - ₹4,999
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePriceSelect(5000, 9999)}
                        className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                          currentMinPrice === "5000" && currentMaxPrice === "9999"
                            ? "bg-muted-gold text-white border-muted-gold font-medium"
                            : "bg-white text-dark-brown border-champagne/60 hover:border-muted-gold"
                        }`}
                      >
                        ₹5,000 - ₹9,999
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePriceSelect(10000, undefined)}
                        className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                          currentMinPrice === "10000" && !currentMaxPrice
                            ? "bg-muted-gold text-white border-muted-gold font-medium"
                            : "bg-white text-dark-brown border-champagne/60 hover:border-muted-gold"
                        }`}
                      >
                        ₹10,000 & Above
                      </button>
                    </div>
                  </div>

                  {/* Material Filter */}
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-charcoal">
                      Material
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {["Brass", "Kundan", "Polki", "Pearl", "Gold Plated"].map((mat) => (
                        <button
                          key={mat}
                          type="button"
                          onClick={() => handleMaterialSelect(mat)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                            currentMaterial.toLowerCase() === mat.toLowerCase()
                              ? "bg-muted-gold text-white border-muted-gold font-medium"
                              : "bg-white text-dark-brown border-champagne/60 hover:border-muted-gold"
                          }`}
                        >
                          {mat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort Selector Dropdown */}
            <div className="relative">
              <select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value as SearchSortOption)}
                className="appearance-none bg-white border border-champagne text-xs text-charcoal rounded-lg pl-3 pr-8 py-2 outline-none hover:border-muted-gold transition-colors cursor-pointer font-sans"
                aria-label="Sort search results"
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Additions</option>
                <option value="rating">Customer Rating</option>
                <option value="popularity">Popularity</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-dark-brown/60 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filters Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] uppercase tracking-wider text-dark-brown/60 font-semibold mr-1">
              Active Filters:
            </span>
            {currentCategory && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white border border-champagne text-charcoal">
                <span>Category: {currentCategory}</span>
                <button
                  type="button"
                  onClick={() => updateUrlParams({ category: null })}
                  className="hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(currentMinPrice || currentMaxPrice) && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white border border-champagne text-charcoal">
                <span>
                  Price: ₹{currentMinPrice || "0"} - {currentMaxPrice ? `₹${currentMaxPrice}` : "Above"}
                </span>
                <button
                  type="button"
                  onClick={() => updateUrlParams({ minPrice: null, maxPrice: null })}
                  className="hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {currentMaterial && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white border border-champagne text-charcoal">
                <span>Material: {currentMaterial}</span>
                <button
                  type="button"
                  onClick={() => updateUrlParams({ material: null })}
                  className="hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {currentSort !== "relevance" && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white border border-champagne text-charcoal">
                <span>Sorted by: {currentSort}</span>
                <button
                  type="button"
                  onClick={() => updateUrlParams({ sortBy: "relevance" })}
                  className="hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-muted-gold hover:text-dark-brown underline font-medium ml-1 cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Results Grid with Highlighting */}
        {data.items.length > 0 && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {data.items.map((product) => (
                <ProductGridItem
                  key={product.id}
                  product={product}
                  searchQuery={currentQuery}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {data.pagination.totalPages > 1 && (
              <div className="pt-6 border-t border-champagne/40 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.pagination.hasPreviousPage}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="text-xs border-champagne text-charcoal disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  <span>Previous</span>
                </Button>

                <span className="text-xs text-dark-brown/70 font-sans">
                  Page <span className="font-semibold text-charcoal">{currentPage}</span> of{" "}
                  <span className="font-semibold text-charcoal">{data.pagination.totalPages}</span>
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.pagination.hasNextPage}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="text-xs border-champagne text-charcoal disabled:opacity-40"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty Results / No Matches -> Recommendations Section */}
        {data.items.length === 0 && (
          <div className="space-y-12">
            <div className="py-12 px-6 text-center bg-white rounded-2xl border border-champagne/40 max-w-xl mx-auto shadow-xs">
              <Sparkles className="w-9 h-9 text-muted-gold mx-auto mb-3 opacity-80" />
              <h3 className="font-serif text-2xl text-charcoal font-medium">
                No Treasures Found
              </h3>
              <p className="text-xs sm:text-sm text-dark-brown/70 mt-2 max-w-md mx-auto leading-relaxed">
                We couldn&apos;t find any items matching &ldquo;
                <span className="font-medium text-charcoal">{currentQuery}</span>&rdquo;. Check for typos, try broader keywords, or explore our collections below.
              </p>

              {/* Quick links to categories */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Link
                  href="/jewellery"
                  className="px-4 py-2 rounded-lg bg-charcoal text-white text-xs hover:bg-muted-gold transition-colors"
                >
                  Artificial Jewellery
                </Link>
                <Link
                  href="/gifts"
                  className="px-4 py-2 rounded-lg bg-charcoal text-white text-xs hover:bg-muted-gold transition-colors"
                >
                  Charming Gifts
                </Link>
                <Link
                  href="/home-decor"
                  className="px-4 py-2 rounded-lg bg-charcoal text-white text-xs hover:bg-muted-gold transition-colors"
                >
                  Timeless Home Décor
                </Link>
              </div>
            </div>

            {/* Recommendations Grid */}
            {data.recommendations && data.recommendations.length > 0 && (
              <div className="space-y-6 pt-4 border-t border-champagne/40">
                <div className="text-center">
                  <span className="text-[10px] uppercase tracking-widest text-muted-gold font-semibold block mb-1">
                    Curated Alternatives
                  </span>
                  <h3 className="font-serif text-2xl text-charcoal font-medium">
                    Treasures You May Adore
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                  {data.recommendations.map((rec) => (
                    <ProductGridItem key={rec.id} product={rec} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
