import { describe, it, expect } from "vitest";
import { searchService } from "@/services/search.service";

describe("Product Search Service Unit Tests", () => {
  describe("Search Criteria & Feature Verification", () => {
    it("1. searches by product name", async () => {
      const result = await searchService.search({ q: "Kundan" });
      expect(result.items.length).toBeGreaterThan(0);
      expect(
        result.items.some((p) => p.title.toLowerCase().includes("kundan"))
      ).toBe(true);
      expect(result.hasResults).toBe(true);
    });

    it("2. searches by variant SKU", async () => {
      const result = await searchService.search({ q: "TW-JWL-NOOR-EMR" });
      expect(result.items.length).toBeGreaterThan(0);
      const foundProduct = result.items[0];
      const hasMatchingSku = foundProduct.variants.some((v) =>
        v.sku.includes("TW-JWL-NOOR-EMR")
      );
      expect(hasMatchingSku).toBe(true);
    });

    it("3. searches by category and subcategory slug/name", async () => {
      const result = await searchService.search({ q: "jewellery" });
      expect(result.items.length).toBeGreaterThan(0);
      expect(
        result.items.every(
          (p) =>
            p.categorySlug === "jewellery" ||
            p.categoryName?.toLowerCase().includes("jewellery")
        )
      ).toBe(true);
    });

    it("4. searches by keywords in materials, description, or attributes", async () => {
      const result = await searchService.search({ q: "brass" });
      expect(result.items.length).toBeGreaterThan(0);
      expect(
        result.items.some(
          (p) =>
            (p.materials && p.materials.toLowerCase().includes("brass")) ||
            p.description.toLowerCase().includes("brass")
        )
      ).toBe(true);
    });

    it("5. generates quick search suggestions with products and matching categories", async () => {
      const suggestions = await searchService.getSuggestions("kundan", 4);
      expect(suggestions.products.length).toBeGreaterThan(0);
      expect(suggestions.products[0]).toHaveProperty("title");
      expect(suggestions.products[0]).toHaveProperty("slug");
      expect(suggestions.products[0]).toHaveProperty("price");
      expect(suggestions.suggestedTerms.length).toBeGreaterThan(0);
    });

    it("6. retrieves curated recommendations when search yields zero results", async () => {
      const result = await searchService.search({ q: "nonexistent-diamond-tiara-xyz99" });
      expect(result.items.length).toBe(0);
      expect(result.hasResults).toBe(false);
      // Recommendations must be populated so the customer never hits a dead end
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0].isFeatured).toBe(true);
    });

    it("7. strictly avoids exposing unpublished or archived products", async () => {
      const result = await searchService.search({ q: "" });
      // All returned items must not be archived
      expect(result.items.every((p) => !p.isArchived)).toBe(true);
    });
  });

  describe("Search Filters, Sorting, and Pagination", () => {
    it("filters search results by category slug", async () => {
      const result = await searchService.search({
        q: "",
        categorySlug: "home-decor",
      });
      expect(result.items.length).toBeGreaterThan(0);
      expect(
        result.items.every(
          (p) => p.categorySlug === "home-decor" || p.subcategorySlug === "home-decor"
        )
      ).toBe(true);
    });

    it("filters search results by price range (minPrice and maxPrice)", async () => {
      const result = await searchService.search({
        q: "",
        minPrice: 1000,
        maxPrice: 3000,
      });

      expect(result.items.length).toBeGreaterThan(0);
      for (const item of result.items) {
        const hasVariantInPrice = item.variants.some(
          (v) => v.sellingPrice >= 1000 && v.sellingPrice <= 3000
        );
        expect(hasVariantInPrice).toBe(true);
      }
    });

    it("filters search results by material keyword", async () => {
      const result = await searchService.search({
        q: "",
        material: "Kundan",
      });
      expect(result.items.length).toBeGreaterThan(0);
      expect(
        result.items.every((p) => p.materials && p.materials.toLowerCase().includes("kundan"))
      ).toBe(true);
    });

    it("sorts search results by price ascending", async () => {
      const result = await searchService.search({
        q: "",
        sortBy: "price-asc",
      });
      expect(result.items.length).toBeGreaterThan(1);
      const firstPrice = result.items[0].variants[0]?.sellingPrice || 0;
      const secondPrice = result.items[1].variants[0]?.sellingPrice || 0;
      expect(firstPrice).toBeLessThanOrEqual(secondPrice);
    });

    it("sorts search results by price descending", async () => {
      const result = await searchService.search({
        q: "",
        sortBy: "price-desc",
      });
      expect(result.items.length).toBeGreaterThan(1);
      const firstPrice = result.items[0].variants[0]?.sellingPrice || 0;
      const secondPrice = result.items[1].variants[0]?.sellingPrice || 0;
      expect(firstPrice).toBeGreaterThanOrEqual(secondPrice);
    });

    it("sorts search results by customer rating", async () => {
      const result = await searchService.search({
        q: "",
        sortBy: "rating",
      });
      expect(result.items.length).toBeGreaterThan(1);
      expect(result.items[0].rating).toBeGreaterThanOrEqual(result.items[1].rating);
    });

    it("supports accurate pagination parameters", async () => {
      const result = await searchService.search({
        q: "",
        page: 1,
        limit: 4,
      });

      expect(result.items.length).toBe(4);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(4);
      expect(result.pagination.totalPages).toBeGreaterThan(1);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(false);
    });
  });

  describe("Administrative Search Analytics Reporting", () => {
    it("logs search queries and produces administrative summary report", async () => {
      // Perform searches to log events
      await searchService.search({ q: "Silver Jhumkas" });
      await searchService.search({ q: "Vintage Brass Lamp" });
      await searchService.search({ q: "UnavailableItem12345" });

      const summary = await searchService.getAnalyticsSummary(30);

      expect(summary.totalSearches).toBeGreaterThan(0);
      expect(summary.uniqueQueries).toBeGreaterThan(0);
      expect(Array.isArray(summary.topSearches)).toBe(true);
      expect(Array.isArray(summary.zeroResultSearches)).toBe(true);
      expect(Array.isArray(summary.recentSearches)).toBe(true);
    });
  });
});
