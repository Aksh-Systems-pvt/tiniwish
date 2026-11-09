import { describe, it, expect, beforeEach } from "vitest";
import {
  trackRecentlyViewed,
  getRecentlyViewed,
  clearRecentlyViewed,
  MAX_RECENTLY_VIEWED,
} from "@/lib/recently-viewed";
import { ProductDTO } from "@/types/product";

describe("Recently Viewed Utilities Unit Tests", () => {
  const dummyProductA = {
    id: "prod_test_A",
    title: "Product Alpha",
    slug: "product-alpha",
    price: 1000,
  } as unknown as ProductDTO;

  const dummyProductB = {
    id: "prod_test_B",
    title: "Product Beta",
    slug: "product-beta",
    price: 2000,
  } as unknown as ProductDTO;

  const dummyProductC = {
    id: "prod_test_C",
    title: "Product Gamma",
    slug: "product-gamma",
    price: 3000,
  } as unknown as ProductDTO;

  beforeEach(() => {
    clearRecentlyViewed();
  });

  it("tracks a viewed product and retrieves it from storage", () => {
    trackRecentlyViewed(dummyProductA);
    const history = getRecentlyViewed();

    expect(history.length).toBe(1);
    expect(history[0].id).toBe("prod_test_A");
  });

  it("avoids duplicate entries and brings latest viewed to front", () => {
    trackRecentlyViewed(dummyProductA);
    trackRecentlyViewed(dummyProductB);
    // View product A again
    trackRecentlyViewed(dummyProductA);

    const history = getRecentlyViewed();

    expect(history.length).toBe(2);
    // Product A must now be at the front
    expect(history[0].id).toBe("prod_test_A");
    expect(history[1].id).toBe("prod_test_B");
  });

  it("clears browsing history completely", () => {
    trackRecentlyViewed(dummyProductA);
    trackRecentlyViewed(dummyProductB);
    trackRecentlyViewed(dummyProductC);

    expect(getRecentlyViewed().length).toBe(3);

    clearRecentlyViewed();
    expect(getRecentlyViewed().length).toBe(0);
  });

  it("caps maximum history items at MAX_RECENTLY_VIEWED", () => {
    for (let i = 0; i < MAX_RECENTLY_VIEWED + 5; i++) {
      trackRecentlyViewed({
        id: `prod_overflow_${i}`,
        title: `Product ${i}`,
        slug: `product-${i}`,
      } as unknown as ProductDTO);
    }

    const history = getRecentlyViewed();
    expect(history.length).toBe(MAX_RECENTLY_VIEWED);
  });
});

