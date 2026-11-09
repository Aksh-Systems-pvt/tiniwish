import { ProductDTO } from "./product";
import { PaginationMeta } from "./api";

export type SearchSortOption =
  | "relevance"
  | "popularity"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "rating";

export interface SearchParams {
  q?: string;
  query?: string;
  category?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  material?: string;
  occasion?: string;
  inStockOnly?: boolean;
  sortBy?: SearchSortOption;
  page?: number;
  limit?: number;
}

export interface SearchFacetItem {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface SearchFacets {
  categories: SearchFacetItem[];
  materials: Array<{ name: string; count: number }>;
  priceRange: { min: number; max: number };
}

export interface SearchSuggestionItem {
  id: string;
  title: string;
  slug: string;
  categoryName: string;
  price: number;
  image: string;
}

export interface SearchSuggestionsDTO {
  query: string;
  products: SearchSuggestionItem[];
  categories: Array<{ name: string; slug: string }>;
  suggestedTerms: string[];
}

export interface SearchResponseDTO {
  items: ProductDTO[];
  pagination: PaginationMeta;
  query: string;
  normalizedQuery: string;
  facets: SearchFacets;
  recommendations: ProductDTO[];
  hasResults: boolean;
}

export interface SearchAnalyticsSummary {
  totalSearches: number;
  uniqueQueries: number;
  zeroResultCount: number;
  zeroResultRate: number;
  topSearches: Array<{
    query: string;
    count: number;
    avgResults: number;
    lastSearchedAt: string;
  }>;
  zeroResultSearches: Array<{
    query: string;
    count: number;
    lastSearchedAt: string;
  }>;
  recentSearches: Array<{
    id: string;
    query: string;
    resultsCount: number;
    createdAt: string;
  }>;
}

