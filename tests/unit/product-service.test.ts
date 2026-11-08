import { describe, it, expect } from "vitest";
import { productService } from "@/services/product.service";
import { NotFoundError } from "@/lib/errors";

describe("ProductService & Repository Layer", () => {
  it("retrieves paginated products", async () => {
    const result = await productService.getProducts({ page: 1, limit: 4 });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.length).toBeLessThanOrEqual(4);
    expect(result.pagination.totalCount).toBeGreaterThan(0);
    expect(result.pagination.page).toBe(1);
  });

  it("filters products by category slug", async () => {
    const result = await productService.getProducts({ categorySlug: "jewellery" });
    expect(result.items.length).toBeGreaterThan(0);
    for (const item of result.items) {
      expect(item.categorySlug).toBe("jewellery");
    }
  });

  it("filters products by query search term", async () => {
    const result = await productService.getProducts({ query: "Kundan" });
    expect(result.items.length).toBeGreaterThan(0);
    const hasKundan = result.items.some(
      (p) =>
        p.title.toLowerCase().includes("kundan") ||
        p.description.toLowerCase().includes("kundan")
    );
    expect(hasKundan).toBe(true);
  });

  it("retrieves single product by slug", async () => {
    const product = await productService.getProductBySlug("noor-meenakari-kundan-choker-set");
    expect(product.slug).toBe("noor-meenakari-kundan-choker-set");
    expect(product.variants.length).toBeGreaterThan(0);
  });

  it("throws NotFoundError when slug does not exist", async () => {
    await expect(
      productService.getProductBySlug("non-existent-luxury-item")
    ).rejects.toThrow(NotFoundError);
  });

  it("retrieves all categories", async () => {
    const categories = await productService.getCategories();
    expect(categories.length).toBe(3);
    const slugs = categories.map((c) => c.slug);
    expect(slugs).toContain("jewellery");
    expect(slugs).toContain("gifts");
    expect(slugs).toContain("home-decor");
  });
});

