import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { productService } from "@/services/product.service";
import { ProductGridItem } from "@/components/products/product-grid-item";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductSortSelect } from "@/components/products/product-sort-select";
import { ActiveFilterChips } from "@/components/products/active-filter-chips";
import { PaginationControl } from "@/components/products/pagination-control";
import { CategoryHeroBanner } from "@/components/categories/category-hero-banner";
import { SubcategoryPills } from "@/components/categories/subcategory-pills";
import { Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { ProductDTO, CategoryDTO, SubcategoryDTO } from "@/types/product";

interface CategoryViewProps {
  slug: string;
  searchParams?: Promise<{
    sub?: string;
    sort?: string;
    page?: string;
    price?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
  }>;
}

export async function CategoryView({ slug, searchParams }: CategoryViewProps) {
  // Indicate Next.js 16 request-time dynamic streaming
  await connection();

  const resolvedParams = searchParams ? await searchParams : {};
  const currentSubSlug = resolvedParams.sub;
  const currentSort = resolvedParams.sort;
  const currentPage = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;
  const minPrice = resolvedParams.minPrice ? parseFloat(resolvedParams.minPrice) : undefined;
  const maxPrice = resolvedParams.maxPrice ? parseFloat(resolvedParams.maxPrice) : undefined;
  const inStockOnly = resolvedParams.inStock === "true";

  // 1. Fetch category metadata from database (or seed fallback)
  let category: CategoryDTO | null = null;
  try {
    category = await productService.getCategoryBySlug(slug);
  } catch {
    category = null;
  }

  // Handle invalid category slug
  if (!category) {
    notFound();
  }

  // Determine active subcategory (either directly requested by slug or via ?sub=)
  let activeSubcategory: SubcategoryDTO | null = null;
  let categorySlugForProducts = category.slug;
  let subcategorySlugForProducts = currentSubSlug;

  if (category.parentId && category.parentSlug) {
    // Current route itself is a child subcategory
    activeSubcategory = {
      id: category.id,
      categoryId: category.parentId,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
    };
    categorySlugForProducts = category.parentSlug;
    subcategorySlugForProducts = category.slug;
  } else if (currentSubSlug) {
    activeSubcategory = category.subcategories.find((s) => s.slug === currentSubSlug) || null;
  }

  // 2. Fetch paginated products with applied filters from database
  let products: ProductDTO[] = [];
  let totalCount = 0;
  let totalPages = 1;
  const limit = 12;

  try {
    const data = await productService.getProducts({
      categorySlug: categorySlugForProducts,
      subcategorySlug: subcategorySlugForProducts,
      minPrice,
      maxPrice,
      inStockOnly,
      sortBy: (currentSort as "featured" | "price-asc" | "price-desc" | "newest" | "rating") || "featured",
      page: currentPage,
      limit,
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
    <div className="py-8 sm:py-12 bg-primary-bg min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-8">
        {/* 1. Category Banner & Breadcrumb Header */}
        <CategoryHeroBanner
          category={category}
          activeSubcategory={activeSubcategory}
          productCount={totalCount}
        />

        {/* 2. Subcategory Quick Filter Pills */}
        <SubcategoryPills
          subcategories={category.subcategories}
          categoryName={category.name}
          activeSubcategorySlug={activeSubcategory?.slug}
        />

        {/* 3. Action Bar (Refinement trigger, item count, and sorting) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-champagne/40">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            {/* Mobile Filter Sheet Trigger */}
            <ProductFilters
              subcategories={category.subcategories}
              categoryName={category.name}
              totalCount={totalCount}
              className="lg:hidden"
            />

            <span className="text-xs text-dark-brown/70 font-light">
              Showing <span className="font-medium text-charcoal">{products.length}</span> of{" "}
              <span className="font-medium text-charcoal">{totalCount}</span>{" "}
              {totalCount === 1 ? "treasure" : "treasures"}
            </span>
          </div>

          <div className="flex items-center justify-end w-full sm:w-auto">
            <ProductSortSelect currentSort={currentSort} />
          </div>
        </div>

        {/* 4. Active Filter Chips */}
        <ActiveFilterChips subcategories={category.subcategories} />

        {/* 5. Responsive Body: Desktop Sidebar + Product Grid / Empty State */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <ProductFilters
            subcategories={category.subcategories}
            categoryName={category.name}
            totalCount={totalCount}
            className="hidden lg:block"
          />

          {/* Product Grid or Graceful Empty State */}
          <div className="flex-1 w-full space-y-8">
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductGridItem key={product.id} product={product} />
                ))}
              </div>
            ) : (
              /* Empty Category & Refinement State */
              <div className="py-20 px-6 sm:px-12 text-center bg-white rounded-3xl border border-champagne/60 shadow-xs space-y-4 max-w-xl mx-auto">
                <div className="h-14 w-14 rounded-full bg-secondary-bg/80 border border-champagne flex items-center justify-center mx-auto text-muted-gold">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-serif text-2xl text-charcoal">
                    No Treasures in this Selection
                  </h3>
                  <p className="text-xs text-dark-brown/70 leading-relaxed font-light max-w-sm mx-auto">
                    {activeSubcategory
                      ? `Our artisans are currently curating new additions for ${activeSubcategory.name}. Check back shortly or browse other collections.`
                      : "We could not find treasures matching your selected filter criteria. Try resetting your price or availability filters."}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href={`/categories/${category.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-champagne bg-secondary-bg text-charcoal text-xs font-medium hover:border-muted-gold hover:text-muted-gold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Category Filters</span>
                  </Link>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-charcoal text-white text-xs uppercase tracking-wider font-medium hover:bg-muted-gold transition-colors shadow-xs"
                  >
                    <span>Browse All Treasures</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* 6. Luxury Pagination */}
            <PaginationControl
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              limit={limit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

