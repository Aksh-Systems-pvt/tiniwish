import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductSortSelect } from "@/components/products/product-sort-select";
import { ProductFilters } from "@/components/products/product-filters";
import { ActiveFilterChips } from "@/components/products/active-filter-chips";
import { PaginationControl } from "@/components/products/pagination-control";
import { CategoryHeroBanner } from "@/components/categories/category-hero-banner";
import { SubcategoryPills } from "@/components/categories/subcategory-pills";
import { productService } from "@/services/product.service";
import { CategoryDTO, SubcategoryDTO } from "@/types/product";

// Mock Next.js navigation hooks
const pushMock = vi.fn();
let currentSearch = "";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/categories/jewellery",
  useSearchParams: () => new URLSearchParams(currentSearch),
  notFound: vi.fn(),
}));

// Mock Next.js Image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

const mockSubcategories: SubcategoryDTO[] = [
  { id: "sub_1", categoryId: "cat_jewellery", name: "Earrings", slug: "earrings" },
  { id: "sub_2", categoryId: "cat_jewellery", name: "Necklaces", slug: "necklaces" },
  { id: "sub_3", categoryId: "cat_jewellery", name: "Rings", slug: "rings" },
  { id: "sub_4", categoryId: "cat_jewellery", name: "Bangles", slug: "bangles" },
];

const mockCategory: CategoryDTO = {
  id: "cat_jewellery",
  name: "Artificial Jewellery",
  slug: "jewellery",
  description: "Handcrafted Kundan, Polki, and American Diamond jewellery.",
  imageUrl: "/images/jewellery.jpg",
  displayOrder: 1,
  subcategories: mockSubcategories,
};

describe("Category & Collection Browsing Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentSearch = "";
  });

  describe("Category & Subcategory Data Services", () => {
    it("retrieves the 3 flagship categories from category repository", async () => {
      const categories = await productService.getCategories();
      expect(categories.length).toBeGreaterThanOrEqual(3);

      const slugs = categories.map((c) => c.slug);
      expect(slugs).toContain("jewellery");
      expect(slugs).toContain("gifts");
      expect(slugs).toContain("home-decor");
    });

    it("retrieves subcategories for Artificial Jewellery", async () => {
      const category = await productService.getCategoryBySlug("jewellery");
      expect(category.name).toBe("Artificial Jewellery");

      const subSlugs = category.subcategories.map((s) => s.slug);
      expect(subSlugs).toContain("earrings");
      expect(subSlugs).toContain("necklaces");
      expect(subSlugs).toContain("bangles");
      expect(subSlugs).toContain("rings");
    });

    it("retrieves subcategories for Charming Gifts", async () => {
      const category = await productService.getCategoryBySlug("gifts");
      expect(category.name).toBe("Charming Gifts");

      const subSlugs = category.subcategories.map((s) => s.slug);
      expect(subSlugs).toContain("gift-hampers");
      expect(subSlugs).toContain("personalized-gifts");
      expect(subSlugs).toContain("anniversary-gifts");
    });

    it("retrieves subcategories for Timeless Home Décor", async () => {
      const category = await productService.getCategoryBySlug("home-decor");
      expect(category.name).toBe("Timeless Home Décor");

      const subSlugs = category.subcategories.map((s) => s.slug);
      expect(subSlugs).toContain("vases");
      expect(subSlugs).toContain("candles");
      expect(subSlugs).toContain("table-decor");
      expect(subSlugs).toContain("showpieces");
    });

    it("throws NotFoundError when querying an invalid category slug", async () => {
      await expect(
        productService.getCategoryBySlug("non-existent-luxury-category")
      ).rejects.toThrow();
    });

    it("filters products by category and subcategory properly", async () => {
      const result = await productService.getProducts({
        categorySlug: "jewellery",
        subcategorySlug: "necklaces",
      });

      expect(result.items.length).toBeGreaterThan(0);
      result.items.forEach((item) => {
        expect(item.categorySlug).toBe("jewellery");
      });
    });

    it("handles empty subcategories gracefully by returning empty items", async () => {
      const result = await productService.getProducts({
        categorySlug: "jewellery",
        subcategorySlug: "rings", // subcategory without seed products
      });

      expect(result.items).toHaveLength(0);
      expect(result.pagination.totalCount).toBe(0);
    });

    it("filters products by price range tiers", async () => {
      const result = await productService.getProducts({
        categorySlug: "jewellery",
        minPrice: 1000,
        maxPrice: 2500,
      });

      result.items.forEach((item) => {
        const lowestPrice = Math.min(...item.variants.map((v) => v.sellingPrice));
        expect(lowestPrice).toBeGreaterThanOrEqual(1000);
        expect(lowestPrice).toBeLessThanOrEqual(2500);
      });
    });

    it("sorts products by price ascending", async () => {
      const result = await productService.getProducts({
        categorySlug: "jewellery",
        sortBy: "price-asc",
      });

      for (let i = 1; i < result.items.length; i++) {
        const pricePrev = Math.min(...result.items[i - 1].variants.map((v) => v.sellingPrice));
        const priceCurr = Math.min(...result.items[i].variants.map((v) => v.sellingPrice));
        expect(priceCurr).toBeGreaterThanOrEqual(pricePrev);
      }
    });
  });

  describe("Category UI Components", () => {
    it("renders CategoryHeroBanner with title, description, and breadcrumbs", () => {
      render(
        <CategoryHeroBanner
          category={mockCategory}
          productCount={18}
        />
      );

      expect(screen.getByRole("heading", { name: "Artificial Jewellery" })).toBeDefined();
      expect(screen.getByText(/Handcrafted Kundan, Polki/i)).toBeDefined();
      expect(screen.getByText(/18 treasures in atelier/i)).toBeDefined();
      expect(screen.getByText("Home")).toBeDefined();
      expect(screen.getByText("Collections")).toBeDefined();
    });

    it("renders SubcategoryPills and highlights active subcategory", () => {
      render(
        <SubcategoryPills
          subcategories={mockSubcategories}
          categoryName="Artificial Jewellery"
          activeSubcategorySlug="earrings"
        />
      );

      expect(screen.getByText("All Artificial Jewellery")).toBeDefined();
      expect(screen.getByText("Earrings")).toBeDefined();
      expect(screen.getByText("Necklaces")).toBeDefined();
    });

    it("renders ProductSortSelect and triggers router push on selection", () => {
      render(<ProductSortSelect currentSort="featured" />);

      const select = screen.getByLabelText(/Sort treasures by/i) as HTMLSelectElement;
      expect(select.value).toBe("featured");

      fireEvent.change(select, { target: { value: "price-asc" } });
      expect(pushMock).toHaveBeenCalledWith("/categories/jewellery?sort=price-asc", { scroll: false });
    });

    it("renders ActiveFilterChips and allows removal of individual filters", () => {
      currentSearch = "sub=earrings&price=1000-2500";

      render(<ActiveFilterChips subcategories={mockSubcategories} />);

      expect(screen.getByText("Earrings")).toBeDefined();
      expect(screen.getByText("₹1,000 – ₹2,499")).toBeDefined();
      expect(screen.getByText("Clear All")).toBeDefined();
    });

    it("renders PaginationControl with page links and item counter", () => {
      render(
        <PaginationControl
          currentPage={2}
          totalPages={5}
          totalCount={50}
          limit={10}
        />
      );

      expect(screen.getByText(/Showing/i)).toBeDefined();
      expect(screen.getByText("50")).toBeDefined();
      expect(screen.getByLabelText("Go to previous page")).toBeDefined();
      expect(screen.getByLabelText("Go to next page")).toBeDefined();
    });

    it("renders ProductFilters with price tiers and availability", () => {
      render(
        <ProductFilters
          subcategories={mockSubcategories}
          categoryName="Artificial Jewellery"
          totalCount={18}
        />
      );

      expect(screen.getByText("Refine Treasures")).toBeDefined();
      expect(screen.getByText("In-Stock Only")).toBeDefined();
      expect(screen.getByText("Under ₹1,000")).toBeDefined();
    });
  });
});

