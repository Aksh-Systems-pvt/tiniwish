import { PaginationMeta } from "@/types/api";

export interface PaginationOptions {
  page?: number | string | null;
  limit?: number | string | null;
  defaultLimit?: number;
  maxLimit?: number;
}

export interface ParsedPagination {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

/**
 * Extracts and sanitizes page and limit parameters with boundaries.
 */
export function parsePaginationParams(options?: PaginationOptions): ParsedPagination {
  const defaultLimit = options?.defaultLimit ?? 12;
  const maxLimit = options?.maxLimit ?? 100;

  const rawPage = Number(options?.page);
  const rawLimit = Number(options?.limit);

  const page = !isNaN(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  let limit = !isNaN(rawLimit) && rawLimit > 0 ? Math.floor(rawLimit) : defaultLimit;

  if (limit > maxLimit) {
    limit = maxLimit;
  }

  const skip = (page - 1) * limit;
  const take = limit;

  return {
    page,
    limit,
    skip,
    take,
  };
}

/**
 * Constructs complete pagination metadata for API responses.
 */
export function buildPaginationMeta(
  totalCount: number,
  page: number,
  limit: number
): PaginationMeta {
  const validTotal = Math.max(0, totalCount);
  const totalPages = Math.max(1, Math.ceil(validTotal / limit));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  return {
    page: currentPage,
    limit,
    totalCount: validTotal,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

/**
 * Slices an in-memory array according to pagination parameters.
 */
export function paginateArray<T>(
  items: T[],
  page: number,
  limit: number
): { paginatedItems: T[]; meta: PaginationMeta } {
  const meta = buildPaginationMeta(items.length, page, limit);
  const startIndex = (meta.page - 1) * meta.limit;
  const paginatedItems = items.slice(startIndex, startIndex + meta.limit);

  return {
    paginatedItems,
    meta,
  };
}

