import { searchRepository } from "@/repositories/search.repository";
import { searchAnalyticsRepository } from "@/repositories/search-analytics.repository";
import {
  SearchParams,
  SearchResponseDTO,
  SearchSuggestionsDTO,
  SearchAnalyticsSummary,
} from "@/types/search";
import { normalizeSearchQuery } from "@/lib/search-utils";
import { parsePaginationParams, buildPaginationMeta } from "@/lib/pagination";

export interface SearchRequestMeta {
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class SearchService {
  /**
   * Performs complete product search across name, SKU, category, and keywords
   * with pagination, faceted filtering, and automatic search logging.
   */
  async search(
    params: SearchParams,
    meta?: SearchRequestMeta
  ): Promise<SearchResponseDTO> {
    const rawQuery = params.q || params.query || "";
    const normalizedQuery = normalizeSearchQuery(rawQuery);

    const { page, limit } = parsePaginationParams({
      page: params.page,
      limit: params.limit,
      defaultLimit: 12,
      maxLimit: 48,
    });

    const { items, totalCount, facets } = await searchRepository.search({
      ...params,
      q: rawQuery,
      page,
      limit,
    });

    const pagination = buildPaginationMeta(totalCount, page, limit);

    // If no results matched, retrieve luxury recommendations
    let recommendations: typeof items = [];
    if (totalCount === 0) {
      recommendations = await searchRepository.getRecommendations(4);
    }

    // Asynchronously log analytics for administrative reporting (non-blocking)
    if (rawQuery.trim().length > 0) {
      // Fire-and-forget
      void searchAnalyticsRepository.logSearch({
        query: rawQuery.trim(),
        normalizedQuery,
        resultsCount: totalCount,
        hasResults: totalCount > 0,
        filters: {
          category: params.categorySlug || params.category,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          material: params.material,
          occasion: params.occasion,
          sortBy: params.sortBy,
        },
        userId: meta?.userId,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      });
    }

    return {
      items,
      pagination,
      query: rawQuery,
      normalizedQuery,
      facets,
      recommendations,
      hasResults: totalCount > 0,
    };
  }

  /**
   * Retrieves quick auto-complete suggestions for typing users.
   */
  async getSuggestions(query: string, limit: number = 6): Promise<SearchSuggestionsDTO> {
    return searchRepository.getSuggestions(query, limit);
  }

  /**
   * Retrieves popular searches backed by search analytics.
   */
  async getPopularSearches(limit: number = 8): Promise<string[]> {
    return searchAnalyticsRepository.getPopularQueries(limit);
  }

  /**
   * Retrieves administrative search analytics reporting summary.
   */
  async getAnalyticsSummary(days: number = 30): Promise<SearchAnalyticsSummary> {
    return searchAnalyticsRepository.getSummary(days);
  }
}

export const searchService = new SearchService();

