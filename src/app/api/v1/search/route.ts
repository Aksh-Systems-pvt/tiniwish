import { z } from "zod";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { validateQueryParams } from "@/lib/validation";
import { searchService } from "@/services/search.service";

const searchQuerySchema = z.object({
  q: z.string().optional().default(""),
  query: z.string().optional(),
  category: z.string().optional(),
  categorySlug: z.string().optional(),
  subcategorySlug: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  material: z.string().optional(),
  occasion: z.string().optional(),
  inStockOnly: z.coerce.boolean().optional(),
  sortBy: z
    .enum(["relevance", "popularity", "price-asc", "price-desc", "newest", "rating"])
    .optional()
    .default("relevance"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
  type: z.enum(["results", "suggestions", "popular"]).optional().default("results"),
});

export async function GET(request: Request) {
  try {
    const params = validateQueryParams(request.url, searchQuerySchema);
    const searchString = params.q || params.query || "";

    // 1. Suggestions endpoint mode: ?type=suggestions&q=...
    if (params.type === "suggestions") {
      const suggestions = await searchService.getSuggestions(searchString, params.limit);
      return apiSuccess(suggestions, "Search suggestions retrieved successfully");
    }

    // 2. Popular searches endpoint mode: ?type=popular
    if (params.type === "popular") {
      const popular = await searchService.getPopularSearches(params.limit);
      return apiSuccess(popular, "Popular searches retrieved successfully");
    }

    // 3. Full Search execution mode
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("cf-connecting-ip") ||
      undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    const result = await searchService.search(
      {
        q: searchString,
        categorySlug: params.categorySlug || params.category,
        subcategorySlug: params.subcategorySlug,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        material: params.material,
        occasion: params.occasion,
        inStockOnly: params.inStockOnly,
        sortBy: params.sortBy,
        page: params.page,
        limit: params.limit,
      },
      {
        ipAddress,
        userAgent,
      }
    );

    return apiSuccess(result, "Search completed successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

