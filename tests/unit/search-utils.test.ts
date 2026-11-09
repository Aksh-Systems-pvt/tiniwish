import { describe, it, expect } from "vitest";
import {
  normalizeSearchQuery,
  extractSearchTokens,
  highlightSearchMatches,
  matchesSku,
  POPULAR_SEARCH_TERMS,
} from "@/lib/search-utils";

describe("Search Utilities Unit Tests", () => {
  describe("normalizeSearchQuery", () => {
    it("trims leading and trailing whitespace and lowercases query", () => {
      expect(normalizeSearchQuery("  Kundan Choker  ")).toBe("kundan choker");
    });

    it("collapses multiple consecutive spaces into a single space", () => {
      expect(normalizeSearchQuery("Pearl    Jhumkas   Gold")).toBe("pearl jhumkas gold");
    });

    it("neutralizes potential SQL injection comment delimiters and quotes", () => {
      const malicious = "Kundan' OR '1'='1; -- drop table products";
      const normalized = normalizeSearchQuery(malicious);
      expect(normalized).not.toContain("--");
      expect(normalized).not.toContain(";");
      expect(normalized).not.toContain("'");
      expect(normalized).toContain("kundan");
      expect(normalized).toContain("drop table products");
    });

    it("strips null bytes and control characters", () => {
      expect(normalizeSearchQuery("Brass\0Diya\x08")).toBe("brass diya");
    });

    it("returns empty string for non-string or whitespace-only inputs", () => {
      expect(normalizeSearchQuery(null)).toBe("");
      expect(normalizeSearchQuery(undefined)).toBe("");
      expect(normalizeSearchQuery("   ")).toBe("");
    });
  });

  describe("extractSearchTokens", () => {
    it("extracts meaningful words while filtering common stop words", () => {
      const tokens = extractSearchTokens("The Royal Kundan Set for Women with Pearls");
      expect(tokens).toEqual(["royal", "kundan", "set", "women", "pearls"]);
    });

    it("retains raw tokens if the search query contains only stop words", () => {
      const tokens = extractSearchTokens("for and the");
      expect(tokens.length).toBeGreaterThan(0);
    });
  });

  describe("highlightSearchMatches", () => {
    it("identifies matching search tokens in target text", () => {
      const text = "Noor Meenakari & Kundan Choker Necklace Set";
      const segments = highlightSearchMatches(text, "kundan");

      expect(segments).toEqual([
        { text: "Noor Meenakari & ", isMatch: false },
        { text: "Kundan", isMatch: true },
        { text: " Choker Necklace Set", isMatch: false },
      ]);
    });

    it("handles multi-token queries with case-insensitivity", () => {
      const text = "Handcrafted Brass Urli with Floating Flowers";
      const segments = highlightSearchMatches(text, "brass urli");

      const matchedTexts = segments.filter((s) => s.isMatch).map((s) => s.text.toLowerCase());
      expect(matchedTexts).toContain("brass");
      expect(matchedTexts).toContain("urli");
    });

    it("returns single non-matching segment when query is empty", () => {
      expect(highlightSearchMatches("Test Product", "")).toEqual([
        { text: "Test Product", isMatch: false },
      ]);
    });
  });

  describe("matchesSku", () => {
    it("matches exact and partial SKU strings regardless of casing and hyphens", () => {
      expect(matchesSku("TW-JWL-NOOR-EMR", "tw-jwl")).toBe(true);
      expect(matchesSku("TW-JWL-NOOR-EMR", "noor")).toBe(true);
      expect(matchesSku("TW-JWL-NOOR-EMR", "EMR")).toBe(true);
      expect(matchesSku("TW-JWL-NOOR-EMR", "DIYA")).toBe(false);
    });

    it("returns false for null or undefined SKUs", () => {
      expect(matchesSku(null, "NOOR")).toBe(false);
      expect(matchesSku(undefined, "NOOR")).toBe(false);
    });
  });

  describe("POPULAR_SEARCH_TERMS", () => {
    it("contains luxury and festive search phrases", () => {
      expect(POPULAR_SEARCH_TERMS.length).toBeGreaterThan(4);
      expect(POPULAR_SEARCH_TERMS).toContain("Kundan Choker");
    });
  });
});
