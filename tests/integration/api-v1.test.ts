import { describe, it, expect } from "vitest";
import { GET as getHealth } from "@/app/api/v1/health/route";
import { GET as getCategories } from "@/app/api/v1/categories/route";
import { GET as getProducts } from "@/app/api/v1/products/route";
import { GET as getProductBySlug } from "@/app/api/v1/products/[slug]/route";

describe("API v1 Route Handlers", () => {
  it("GET /api/v1/health returns healthy system status", async () => {
    const response = await getHealth();
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.message).toBe("Service is healthy and operational");
    expect(json.data.status).toBe("healthy");
    expect(json.data.version).toBe("v1");
  });

  it("GET /api/v1/categories returns luxury categories", async () => {
    const response = await getCategories();
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBe(3);
    expect(json.data[0].slug).toBe("jewellery");
  });

  it("GET /api/v1/products returns paginated products conforming to contract", async () => {
    const request = new Request("http://localhost/api/v1/products?limit=2&page=1");
    const response = await getProducts(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.message).toBe("Products retrieved successfully");
    expect(json.data.items.length).toBe(2);
    expect(json.data.pagination.page).toBe(1);
    expect(json.data.pagination.limit).toBe(2);
    expect(json.data.pagination.hasNextPage).toBe(true);
  });

  it("GET /api/v1/products/[slug] returns product details by slug", async () => {
    const request = new Request("http://localhost/api/v1/products/noor-meenakari-kundan-choker-set");
    const response = await getProductBySlug(request, {
      params: Promise.resolve({ slug: "noor-meenakari-kundan-choker-set" }),
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.slug).toBe("noor-meenakari-kundan-choker-set");
    expect(json.data.title).toContain("Noor");
  });

  it("GET /api/v1/products/[slug] returns 404 error contract when not found", async () => {
    const request = new Request("http://localhost/api/v1/products/unknown-luxury-item");
    const response = await getProductBySlug(request, {
      params: Promise.resolve({ slug: "unknown-luxury-item" }),
    });

    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("NOT_FOUND");
  });
});

