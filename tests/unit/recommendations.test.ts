import { describe, it, expect } from "vitest";
import { recommendationService } from "@/services/recommendation.service";
import { NotFoundError } from "@/lib/errors";

describe("Product Recommendation Service Unit Tests", () => {
  it("retrieves similar products based on category, subcategory and attributes", async () => {
    // prod_kundan_choker: Category = Artificial Jewellery, Subcategory = Necklaces / Chokers
    const recommendations = await recommendationService.getSimilarProducts(
      "prod_kundan_choker",
      4
    );

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.length).toBeLessThanOrEqual(4);

    // Target product itself must NEVER be included in its own recommendations
    expect(recommendations.some((p) => p.id === "prod_kundan_choker")).toBe(false);

    // Should include other jewellery pieces (same category or related attributes like Kundan / Meenakari)
    const sameCategoryCount = recommendations.filter(
      (p) => p.categoryName === "Artificial Jewellery"
    ).length;
    expect(sameCategoryCount).toBeGreaterThan(0);
  });

  it("recommends home décor items for brass diya target", async () => {
    // prod_brass_peacock_diya: Category = Timeless Home Décor
    const recommendations = await recommendationService.getSimilarProducts(
      "prod_brass_peacock_diya",
      4
    );

    expect(recommendations.some((p) => p.id === "prod_brass_peacock_diya")).toBe(false);
    expect(recommendations.some((p) => p.categoryName === "Timeless Home Décor")).toBe(true);
  });

  it("generates wishlist-based recommendations", async () => {
    const recommendations = await recommendationService.getWishlistRecommendations(
      ["prod_kundan_choker"],
      4
    );

    expect(recommendations.length).toBeGreaterThan(0);
    // Must not include already wishlisted item
    expect(recommendations.some((p) => p.id === "prod_kundan_choker")).toBe(false);
  });

  it("throws NotFoundError for non-existent product", async () => {
    await expect(
      recommendationService.getSimilarProducts("non_existent_product_xyz")
    ).rejects.toThrow(NotFoundError);
  });
});
