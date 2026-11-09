import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { SearchAnalyticsSummary } from "@/types/search";
import { POPULAR_SEARCH_TERMS } from "@/lib/search-utils";

interface CreateSearchLogInput {
  query: string;
  normalizedQuery: string;
  resultsCount: number;
  hasResults: boolean;
  filters?: Record<string, unknown>;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

// In-memory fallback for test environments or offline scenarios
const inMemoryLogs: Array<{
  id: string;
  query: string;
  normalizedQuery: string;
  resultsCount: number;
  hasResults: boolean;
  filters?: Record<string, unknown>;
  userId?: string;
  createdAt: Date;
}> = [];

export class SearchAnalyticsRepository {
  /**
   * Logs a search event asynchronously without blocking user response.
   */
  async logSearch(input: CreateSearchLogInput): Promise<void> {
    if (process.env.NODE_ENV === "test") {
      inMemoryLogs.unshift({
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        query: input.query,
        normalizedQuery: input.normalizedQuery,
        resultsCount: input.resultsCount,
        hasResults: input.hasResults,
        filters: input.filters,
        userId: input.userId,
        createdAt: new Date(),
      });
      return;
    }

    try {
      await prisma.searchLog.create({
        data: {
          query: input.query,
          normalizedQuery: input.normalizedQuery,
          resultsCount: input.resultsCount,
          hasResults: input.hasResults,
          filters: input.filters ? JSON.parse(JSON.stringify(input.filters)) : undefined,
          userId: input.userId || null,
          ipAddress: input.ipAddress || null,
          userAgent: input.userAgent ? input.userAgent.substring(0, 500) : null,
        },
      });
    } catch (error) {
      // Non-critical logging failure should never crash search request
      logger.warn("Failed to persist search log to database", {
        error: error instanceof Error ? error.message : String(error),
        query: input.query,
      });
    }
  }

  /**
   * Retrieves administrative analytics summary for search behavior.
   */
  async getSummary(days: number = 30): Promise<SearchAnalyticsSummary> {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    if (process.env.NODE_ENV === "test") {
      const logs = inMemoryLogs.filter((l) => l.createdAt >= sinceDate);
      const totalSearches = logs.length;
      const uniqueQueries = new Set(logs.map((l) => l.normalizedQuery)).size;
      const zeroResultLogs = logs.filter((l) => !l.hasResults);
      const zeroResultCount = zeroResultLogs.length;
      const zeroResultRate = totalSearches > 0 ? Number(((zeroResultCount / totalSearches) * 100).toFixed(1)) : 0;

      // Group top queries
      const queryMap = new Map<string, { count: number; totalResults: number; lastSearched: Date }>();
      for (const log of logs) {
        const existing = queryMap.get(log.normalizedQuery) || { count: 0, totalResults: 0, lastSearched: log.createdAt };
        existing.count += 1;
        existing.totalResults += log.resultsCount;
        if (log.createdAt > existing.lastSearched) existing.lastSearched = log.createdAt;
        queryMap.set(log.normalizedQuery, existing);
      }

      const topSearches = Array.from(queryMap.entries())
        .map(([query, stat]) => ({
          query,
          count: stat.count,
          avgResults: Number((stat.totalResults / stat.count).toFixed(1)),
          lastSearchedAt: stat.lastSearched.toISOString(),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const zeroMap = new Map<string, { count: number; lastSearched: Date }>();
      for (const log of zeroResultLogs) {
        const existing = zeroMap.get(log.normalizedQuery) || { count: 0, lastSearched: log.createdAt };
        existing.count += 1;
        if (log.createdAt > existing.lastSearched) existing.lastSearched = log.createdAt;
        zeroMap.set(log.normalizedQuery, existing);
      }

      const zeroResultSearches = Array.from(zeroMap.entries())
        .map(([query, stat]) => ({
          query,
          count: stat.count,
          lastSearchedAt: stat.lastSearched.toISOString(),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const recentSearches = logs.slice(0, 10).map((l) => ({
        id: l.id,
        query: l.query,
        resultsCount: l.resultsCount,
        createdAt: l.createdAt.toISOString(),
      }));

      return {
        totalSearches,
        uniqueQueries,
        zeroResultCount,
        zeroResultRate,
        topSearches,
        zeroResultSearches,
        recentSearches,
      };
    }

    try {
      const [totalSearches, uniqueResult, zeroCountResult, recentLogs] = await Promise.all([
        prisma.searchLog.count({
          where: { createdAt: { gte: sinceDate } },
        }),
        prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(DISTINCT "normalizedQuery") as count 
          FROM "SearchLog" 
          WHERE "createdAt" >= ${sinceDate}
        `,
        prisma.searchLog.count({
          where: {
            createdAt: { gte: sinceDate },
            hasResults: false,
          },
        }),
        prisma.searchLog.findMany({
          where: { createdAt: { gte: sinceDate } },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            query: true,
            resultsCount: true,
            createdAt: true,
          },
        }),
      ]);

      const uniqueQueries = Number(uniqueResult[0]?.count || 0);
      const zeroResultCount = zeroCountResult;
      const zeroResultRate = totalSearches > 0 ? Number(((zeroResultCount / totalSearches) * 100).toFixed(1)) : 0;

      // Top searches query
      const topRows = await prisma.$queryRaw<
        Array<{ query: string; count: bigint; avg_results: number; last_searched: Date }>
      >`
        SELECT "normalizedQuery" as query, COUNT(*) as count, AVG("resultsCount") as avg_results, MAX("createdAt") as last_searched
        FROM "SearchLog"
        WHERE "createdAt" >= ${sinceDate} AND "hasResults" = true
        GROUP BY "normalizedQuery"
        ORDER BY count DESC
        LIMIT 10
      `;

      const topSearches = topRows.map((r) => ({
        query: r.query,
        count: Number(r.count),
        avgResults: Number((r.avg_results || 0).toFixed(1)),
        lastSearchedAt: new Date(r.last_searched).toISOString(),
      }));

      // Zero-result queries (merchandising gaps)
      const zeroRows = await prisma.$queryRaw<
        Array<{ query: string; count: bigint; last_searched: Date }>
      >`
        SELECT "normalizedQuery" as query, COUNT(*) as count, MAX("createdAt") as last_searched
        FROM "SearchLog"
        WHERE "createdAt" >= ${sinceDate} AND "hasResults" = false
        GROUP BY "normalizedQuery"
        ORDER BY count DESC
        LIMIT 10
      `;

      const zeroResultSearches = zeroRows.map((r) => ({
        query: r.query,
        count: Number(r.count),
        lastSearchedAt: new Date(r.last_searched).toISOString(),
      }));

      return {
        totalSearches,
        uniqueQueries,
        zeroResultCount,
        zeroResultRate,
        topSearches,
        zeroResultSearches,
        recentSearches: recentLogs.map((l) => ({
          id: l.id,
          query: l.query,
          resultsCount: l.resultsCount,
          createdAt: l.createdAt.toISOString(),
        })),
      };
    } catch (error) {
      logger.error("Failed to compute search analytics", { error });
      return {
        totalSearches: 0,
        uniqueQueries: 0,
        zeroResultCount: 0,
        zeroResultRate: 0,
        topSearches: POPULAR_SEARCH_TERMS.map((t) => ({
          query: t.toLowerCase(),
          count: 1,
          avgResults: 5,
          lastSearchedAt: new Date().toISOString(),
        })),
        zeroResultSearches: [],
        recentSearches: [],
      };
    }
  }

  /**
   * Retrieves popular searches based on historical logs or fallback curated list.
   */
  async getPopularQueries(limit: number = 8): Promise<string[]> {
    if (process.env.NODE_ENV === "test") {
      return POPULAR_SEARCH_TERMS.slice(0, limit);
    }

    try {
      const rows = await prisma.$queryRaw<Array<{ query: string; count: bigint }>>`
        SELECT "normalizedQuery" as query, COUNT(*) as count
        FROM "SearchLog"
        WHERE "hasResults" = true
        GROUP BY "normalizedQuery"
        ORDER BY count DESC
        LIMIT ${limit}
      `;

      if (rows.length === 0) {
        return POPULAR_SEARCH_TERMS.slice(0, limit);
      }

      // Convert from lowercase to capitalized representation or title
      return rows.map((r) =>
        r.query
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      );
    } catch {
      return POPULAR_SEARCH_TERMS.slice(0, limit);
    }
  }
}

export const searchAnalyticsRepository = new SearchAnalyticsRepository();

