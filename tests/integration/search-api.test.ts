import { describe, it, expect } from "vitest";
import { GET as searchEndpoint } from "@/app/api/v1/search/route";
import { GET as adminAnalyticsEndpoint } from "@/app/api/v1/admin/analytics/search/route";

describe("Product Search API v1 Integration Tests", () => {
  it("GET /api/v1/search?q=kundan returns matching products with pagination contract", async () => {
    const request = new Request("http://localhost/api/v1/search?q=kundan&limit=4");
    const response = await searchEndpoint(request);

    expect(response.status).toBe(200);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.message).toBe("Search completed successfully");
    expect(json.data).toHaveProperty("items");
    expect(json.data).toHaveProperty("pagination");
    expect(json.data).toHaveProperty("facets");
    expect(json.data.items.length).toBeGreaterThan(0);
    expect(json.data.query).toBe("kundan");
    expect(json.data.hasResults).toBe(true);
  });

  it("GET /api/v1/search?q=TW-JWL-NOOR-EMR searches products by variant SKU", async () => {
    const request = new Request("http://localhost/api/v1/search?q=TW-JWL-NOOR-EMR");
    const response = await searchEndpoint(request);

    expect(response.status).toBe(200);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data.items.length).toBeGreaterThan(0);
    const hasSku = json.data.items[0].variants.some((v: { sku: string }) =>
      v.sku.includes("TW-JWL-NOOR-EMR")
    );
    expect(hasSku).toBe(true);
  });

  it("GET /api/v1/search?type=suggestions&q=kun returns auto-complete suggestions", async () => {
    const request = new Request("http://localhost/api/v1/search?type=suggestions&q=kun&limit=5");
    const response = await searchEndpoint(request);

    expect(response.status).toBe(200);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.message).toBe("Search suggestions retrieved successfully");
    expect(json.data).toHaveProperty("products");
    expect(json.data).toHaveProperty("categories");
    expect(json.data).toHaveProperty("suggestedTerms");
    expect(json.data.products.length).toBeGreaterThan(0);
  });

  it("GET /api/v1/search?type=popular returns popular search inquiries", async () => {
    const request = new Request("http://localhost/api/v1/search?type=popular&limit=6");
    const response = await searchEndpoint(request);

    expect(response.status).toBe(200);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });

  it("GET /api/v1/search supports combined price and sorting filters", async () => {
    const request = new Request(
      "http://localhost/api/v1/search?q=&minPrice=1000&maxPrice=5000&sortBy=price-asc&limit=6"
    );
    const response = await searchEndpoint(request);

    expect(response.status).toBe(200);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data.items.length).toBeGreaterThan(0);
    for (const item of json.data.items) {
      const valid = item.variants.some(
        (v: { sellingPrice: number }) => v.sellingPrice >= 1000 && v.sellingPrice <= 5000
      );
      expect(valid).toBe(true);
    }
  });

  it("GET /api/v1/search handles SQL injection attempts safely through normalization", async () => {
    const request = new Request(
      "http://localhost/api/v1/search?q=kundan%27+OR+1%3D1%3B+--+drop+table"
    );
    const response = await searchEndpoint(request);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.normalizedQuery).not.toContain("--");
    expect(json.data.normalizedQuery).not.toContain(";");
    expect(json.data.normalizedQuery).not.toContain("'");
  });

  it("GET /api/v1/search returns curated recommendations when no products match", async () => {
    const request = new Request(
      "http://localhost/api/v1/search?q=completely-unknown-fantasy-item-404"
    );
    const response = await searchEndpoint(request);

    expect(response.status).toBe(200);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data.items.length).toBe(0);
    expect(json.data.hasResults).toBe(false);
    expect(json.data.recommendations.length).toBeGreaterThan(0);
  });

  it("GET /api/v1/admin/analytics/search returns administrative search metrics", async () => {
    const request = new Request("http://localhost/api/v1/admin/analytics/search?days=30");
    const response = await adminAnalyticsEndpoint(request);

    expect(response.status).toBe(200);
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.message).toBe("Search analytics reporting retrieved successfully");
    expect(json.data).toHaveProperty("totalSearches");
    expect(json.data).toHaveProperty("uniqueQueries");
    expect(json.data).toHaveProperty("zeroResultCount");
    expect(json.data).toHaveProperty("zeroResultRate");
    expect(json.data).toHaveProperty("topSearches");
    expect(json.data).toHaveProperty("zeroResultSearches");
    expect(json.data).toHaveProperty("recentSearches");
  });
});

