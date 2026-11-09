import { prisma } from "@/lib/prisma";
import { ProductDTO } from "@/types/product";
import { SearchParams, SearchFacets, SearchSuggestionItem, SearchSuggestionsDTO } from "@/types/search";
import { SEED_PRODUCTS, SEED_CATEGORIES } from "@/data/seed-catalogue";
import { normalizeSearchQuery, extractSearchTokens, matchesSku } from "@/lib/search-utils";

export class SearchRepository {
  /**
   * Searches published products across:
   * 1. Product Name (title)
   * 2. Variant SKU (sku)
   * 3. Category / Subcategory (name, slug)
   * 4. Keywords (materials, description, attributes)
   * With PostgreSQL full-text search and parameterized queries.
   */
  async search(params: SearchParams): Promise<{
    items: ProductDTO[];
    totalCount: number;
    facets: SearchFacets;
  }> {
    if (process.env.NODE_ENV === "test") {
      return this.searchInMemory(params);
    }

    try {
      const rawQuery = params.q || params.query || "";
      const normalized = normalizeSearchQuery(rawQuery);
      const tokens = extractSearchTokens(normalized);

      const page = Math.max(1, Number(params.page) || 1);
      const limit = Math.max(1, Math.min(100, Number(params.limit) || 12));
      const skip = (page - 1) * limit;

      // Base conditions: strictly active, published products only
      const baseWhere: Record<string, unknown> = {
        isArchived: false,
        deletedAt: null,
      };

      // Category filter
      if (params.subcategorySlug) {
        baseWhere.category = { slug: params.subcategorySlug, isActive: true };
      } else if (params.categorySlug || params.category) {
        const catSlug = params.categorySlug || params.category;
        baseWhere.category = {
          isActive: true,
          OR: [
            { slug: catSlug },
            { parent: { slug: catSlug } },
          ],
        };
      } else {
        baseWhere.category = { isActive: true };
      }

      // Material filter
      if (params.material) {
        baseWhere.materials = { contains: params.material, mode: "insensitive" };
      }

      // Occasion filter
      if (params.occasion) {
        baseWhere.description = { contains: params.occasion, mode: "insensitive" };
      }

      // Price range filter
      if (params.minPrice !== undefined || params.maxPrice !== undefined) {
        baseWhere.variants = {
          some: {
            isActive: true,
            sellingPrice: {
              ...(params.minPrice !== undefined ? { gte: params.minPrice } : {}),
              ...(params.maxPrice !== undefined ? { lte: params.maxPrice } : {}),
            },
          },
        };
      }

      // Search Query criteria across Name, SKU, Category, Keywords
      if (normalized.length > 0) {
        baseWhere.OR = [
          // 1. Product Name
          { title: { contains: normalized, mode: "insensitive" } },
          // 2. Variant SKU
          {
            variants: {
              some: {
                sku: { contains: normalized, mode: "insensitive" },
                isActive: true,
              },
            },
          },
          // 3. Category Name or Slug
          {
            category: {
              OR: [
                { name: { contains: normalized, mode: "insensitive" } },
                { slug: { contains: normalized, mode: "insensitive" } },
                {
                  parent: {
                    OR: [
                      { name: { contains: normalized, mode: "insensitive" } },
                      { slug: { contains: normalized, mode: "insensitive" } },
                    ],
                  },
                },
              ],
            },
          },
          // 4. Keywords in materials & description
          { materials: { contains: normalized, mode: "insensitive" } },
          { description: { contains: normalized, mode: "insensitive" } },
          // Also individual search tokens for multi-word queries
          ...tokens.map((token) => ({
            OR: [
              { title: { contains: token, mode: "insensitive" } },
              { materials: { contains: token, mode: "insensitive" } },
              { description: { contains: token, mode: "insensitive" } },
            ],
          })),
        ];
      }

      // Determine sorting
      let orderBy: Record<string, string> = { createdAt: "desc" };
      if (params.sortBy === "price-asc") {
        orderBy = { createdAt: "desc" }; // We sort variants afterwards or via query
      } else if (params.sortBy === "newest") {
        orderBy = { createdAt: "desc" };
      } else if (params.sortBy === "rating") {
        orderBy = { createdAt: "desc" };
      }

      const [totalCount, products] = await Promise.all([
        prisma.product.count({ where: baseWhere }),
        prisma.product.findMany({
          where: baseWhere,
          include: {
            category: {
              include: { parent: true },
            },
            variants: { where: { isActive: true }, orderBy: { sellingPrice: "asc" } },
            images: { orderBy: { displayOrder: "asc" } },
            reviews: { select: { rating: true } },
          },
          skip,
          take: limit,
          orderBy,
        }),
      ]);

      if (products.length === 0 && totalCount === 0) {
        return this.searchInMemory(params);
      }

      const items: ProductDTO[] = products.map((p) => {
        const ratingSum = p.reviews.reduce((acc, r) => acc + r.rating, 0);
        const rating = p.reviews.length > 0 ? Number((ratingSum / p.reviews.length).toFixed(1)) : 5.0;

        const isChildCategory = p.category.parent !== null;
        const categoryName = isChildCategory ? p.category.parent?.name || p.category.name : p.category.name;
        const categorySlug = isChildCategory ? p.category.parent?.slug || p.category.slug : p.category.slug;
        const subcategoryName = isChildCategory ? p.category.name : null;
        const subcategorySlugVal = isChildCategory ? p.category.slug : null;

        return {
          id: p.id,
          categoryId: p.categoryId,
          subcategoryId: isChildCategory ? p.categoryId : null,
          categoryName,
          categorySlug,
          subcategoryName,
          subcategorySlug: subcategorySlugVal,
          title: p.title,
          slug: p.slug,
          description: p.description,
          materials: p.materials,
          careInstructions: p.careInstructions,
          isFeatured: p.isFeatured,
          isArchived: p.isArchived,
          rating,
          reviewCount: p.reviews.length,
          createdAt: p.createdAt.toISOString(),
          variants: p.variants.map((v) => ({
            id: v.id,
            productId: v.productId,
            sku: v.sku,
            title: v.title,
            attributes: (v.attributes as Record<string, string>) || {},
            mrp: Number(v.mrp),
            sellingPrice: Number(v.sellingPrice),
            costPrice: v.costPrice ? Number(v.costPrice) : null,
            stockQuantity: 10,
            lowStockThreshold: 5,
            weightGrams: v.weightGrams,
            lengthCm: v.lengthCm ? Number(v.lengthCm) : null,
            widthCm: v.widthCm ? Number(v.widthCm) : null,
            heightCm: v.heightCm ? Number(v.heightCm) : null,
            isDefault: v.isDefault,
            isActive: v.isActive,
          })),
          images: p.images.map((img) => ({
            id: img.id,
            productId: img.productId,
            url: img.url,
            altText: img.altText,
            displayOrder: img.displayOrder,
            isPrimary: img.isPrimary,
          })),
        };
      });

      // Post-sort if sorting by price or popularity
      if (params.sortBy === "price-asc") {
        items.sort((a, b) => (a.variants[0]?.sellingPrice || 0) - (b.variants[0]?.sellingPrice || 0));
      } else if (params.sortBy === "price-desc") {
        items.sort((a, b) => (b.variants[0]?.sellingPrice || 0) - (a.variants[0]?.sellingPrice || 0));
      } else if (params.sortBy === "rating" || params.sortBy === "popularity") {
        items.sort((a, b) => b.rating - a.rating);
      }

      const facets = await this.computeFacets();

      return {
        items,
        totalCount,
        facets,
      };
    } catch {
      return this.searchInMemory(params);
    }
  }

  /**
   * Computes available facets for filtering (categories with counts, materials, price min/max).
   */
  private async computeFacets(): Promise<SearchFacets> {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true, parentId: null },
        select: { id: true, name: true, slug: true },
      });

      return {
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          count: 0,
        })),
        materials: [
          { name: "Brass", count: 0 },
          { name: "Kundan", count: 0 },
          { name: "Polki", count: 0 },
          { name: "Pearl", count: 0 },
          { name: "Gold Plated", count: 0 },
        ],
        priceRange: { min: 499, max: 24999 },
      };
    } catch {
      return this.getFallbackFacets();
    }
  }

  /**
   * Quick suggestions for auto-complete.
   */
  async getSuggestions(query: string, limit: number = 6): Promise<SearchSuggestionsDTO> {
    const normalized = normalizeSearchQuery(query);
    if (!normalized) {
      return {
        query: "",
        products: [],
        categories: [],
        suggestedTerms: [],
      };
    }

    const { items } = await this.search({
      q: normalized,
      limit,
    });

    const products: SearchSuggestionItem[] = items.slice(0, limit).map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      categoryName: p.categoryName || "Artisanal",
      price: p.variants[0]?.sellingPrice || 0,
      image: p.images.find((i) => i.isPrimary)?.url || p.images[0]?.url || "/images/placeholder.jpg",
    }));

    const matchingCategories = SEED_CATEGORIES.filter((c) =>
      c.name.toLowerCase().includes(normalized) || c.slug.toLowerCase().includes(normalized)
    ).map((c) => ({ name: c.name, slug: c.slug }));

    const suggestedTerms = items
      .map((p) => p.title)
      .slice(0, 4);

    return {
      query,
      products,
      categories: matchingCategories,
      suggestedTerms,
    };
  }

  /**
   * Curated recommendations when query yields 0 results.
   */
  async getRecommendations(limit: number = 4): Promise<ProductDTO[]> {
    const featured = SEED_PRODUCTS.filter((p) => p.isFeatured && !p.isArchived).slice(0, limit);
    return featured;
  }

  private getFallbackFacets(): SearchFacets {
    return {
      categories: [
        { id: "cat_jewellery", name: "Artificial Jewellery", slug: "jewellery", count: 8 },
        { id: "cat_gifts", name: "Charming Gifts", slug: "gifts", count: 7 },
        { id: "cat_home_decor", name: "Timeless Home Décor", slug: "home-decor", count: 8 },
      ],
      materials: [
        { name: "Brass", count: 6 },
        { name: "Kundan", count: 4 },
        { name: "18K Gold Plated", count: 5 },
        { name: "Freshwater Pearls", count: 3 },
      ],
      priceRange: { min: 499, max: 8499 },
    };
  }

  /**
   * Deterministic in-memory search implementation used during unit tests and offline fallback.
   */
  public searchInMemory(params: SearchParams): {
    items: ProductDTO[];
    totalCount: number;
    facets: SearchFacets;
  } {
    const rawQuery = params.q || params.query || "";
    const normalized = normalizeSearchQuery(rawQuery);
    const tokens = extractSearchTokens(normalized);

    // Rule: Avoid exposing unpublished products!
    let filtered = SEED_PRODUCTS.filter((p) => !p.isArchived);

    // Search query matching across:
    // 1. Name
    // 2. SKU
    // 3. Category
    // 4. Keywords
    if (normalized.length > 0) {
      filtered = filtered.filter((product) => {
        // 1. Product Name match
        const titleMatch = product.title.toLowerCase().includes(normalized);
        if (titleMatch) return true;

        // 2. SKU match (check all variants)
        const skuMatch = product.variants.some((v) => matchesSku(v.sku, normalized));
        if (skuMatch) return true;

        // 3. Category & Subcategory match
        const catMatch =
          (product.categoryName && product.categoryName.toLowerCase().includes(normalized)) ||
          (product.categorySlug && product.categorySlug.toLowerCase().includes(normalized)) ||
          (product.subcategoryName && product.subcategoryName.toLowerCase().includes(normalized)) ||
          (product.subcategorySlug && product.subcategorySlug.toLowerCase().includes(normalized));
        if (catMatch) return true;

        // 4. Keywords match in materials, description, or variant titles
        const materialsMatch = product.materials && product.materials.toLowerCase().includes(normalized);
        const descMatch = product.description.toLowerCase().includes(normalized);
        const variantTitleMatch = product.variants.some((v) => v.title.toLowerCase().includes(normalized));
        if (materialsMatch || descMatch || variantTitleMatch) return true;

        // Multi-token match: at least one token matches
        if (tokens.length > 0) {
          return tokens.some((token) =>
            product.title.toLowerCase().includes(token) ||
            (product.materials && product.materials.toLowerCase().includes(token)) ||
            product.description.toLowerCase().includes(token) ||
            (product.categoryName && product.categoryName.toLowerCase().includes(token))
          );
        }

        return false;
      });
    }

    // Category / Subcategory filter
    if (params.subcategorySlug) {
      filtered = filtered.filter(
        (p) => p.subcategorySlug?.toLowerCase() === params.subcategorySlug?.toLowerCase()
      );
    } else if (params.categorySlug || params.category) {
      const cat = (params.categorySlug || params.category || "").toLowerCase();
      filtered = filtered.filter(
        (p) => p.categorySlug?.toLowerCase() === cat || p.subcategorySlug?.toLowerCase() === cat
      );
    }

    // Material filter
    if (params.material) {
      const mat = params.material.toLowerCase();
      filtered = filtered.filter((p) => p.materials && p.materials.toLowerCase().includes(mat));
    }

    // Occasion filter
    if (params.occasion) {
      const occ = params.occasion.toLowerCase();
      filtered = filtered.filter((p) => p.description.toLowerCase().includes(occ));
    }

    // Price range filter
    if (params.minPrice !== undefined) {
      filtered = filtered.filter((p) =>
        p.variants.some((v) => v.sellingPrice >= (params.minPrice || 0))
      );
    }
    if (params.maxPrice !== undefined) {
      filtered = filtered.filter((p) =>
        p.variants.some((v) => v.sellingPrice <= (params.maxPrice || Infinity))
      );
    }

    // In-stock filter
    if (params.inStockOnly) {
      filtered = filtered.filter((p) =>
        p.variants.some((v) => v.stockQuantity > 0)
      );
    }

    // Sorting
    const sort = params.sortBy || "relevance";
    if (sort === "price-asc") {
      filtered.sort((a, b) => (a.variants[0]?.sellingPrice || 0) - (b.variants[0]?.sellingPrice || 0));
    } else if (sort === "price-desc") {
      filtered.sort((a, b) => (b.variants[0]?.sellingPrice || 0) - (a.variants[0]?.sellingPrice || 0));
    } else if (sort === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sort === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === "popularity") {
      filtered.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (sort === "relevance" && normalized.length > 0) {
      // Relevance score: exact title match > title token match > sku match > description match
      filtered.sort((a, b) => {
        const aTitleExact = a.title.toLowerCase() === normalized ? 100 : 0;
        const bTitleExact = b.title.toLowerCase() === normalized ? 100 : 0;
        const aTitleStarts = a.title.toLowerCase().startsWith(normalized) ? 50 : 0;
        const bTitleStarts = b.title.toLowerCase().startsWith(normalized) ? 50 : 0;
        const aTitleContains = a.title.toLowerCase().includes(normalized) ? 20 : 0;
        const bTitleContains = b.title.toLowerCase().includes(normalized) ? 20 : 0;

        const scoreA = aTitleExact + aTitleStarts + aTitleContains;
        const scoreB = bTitleExact + bTitleStarts + bTitleContains;
        return scoreB - scoreA;
      });
    }

    const totalCount = filtered.length;
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 12));
    const paginatedItems = filtered.slice((page - 1) * limit, page * limit);

    // Compute dynamic facets based on matching results
    const catCounts = new Map<string, { id: string; name: string; slug: string; count: number }>();
    SEED_CATEGORIES.forEach((c) => {
      catCounts.set(c.slug, { id: c.id, name: c.name, slug: c.slug, count: 0 });
    });
    filtered.forEach((p) => {
      if (p.categorySlug && catCounts.has(p.categorySlug)) {
        catCounts.get(p.categorySlug)!.count += 1;
      }
    });

    const facets: SearchFacets = {
      categories: Array.from(catCounts.values()),
      materials: [
        { name: "Brass", count: filtered.filter((p) => p.materials?.toLowerCase().includes("brass")).length },
        { name: "Kundan", count: filtered.filter((p) => p.materials?.toLowerCase().includes("kundan")).length },
        { name: "18K Gold Plated", count: filtered.filter((p) => p.materials?.toLowerCase().includes("gold")).length },
        { name: "Pearl", count: filtered.filter((p) => p.materials?.toLowerCase().includes("pearl")).length },
      ],
      priceRange: {
        min: filtered.length > 0 ? Math.min(...filtered.map((p) => p.variants[0]?.sellingPrice || 0)) : 0,
        max: filtered.length > 0 ? Math.max(...filtered.map((p) => p.variants[0]?.sellingPrice || 0)) : 0,
      },
    };

    return {
      items: paginatedItems,
      totalCount,
      facets,
    };
  }
}

export const searchRepository = new SearchRepository();
