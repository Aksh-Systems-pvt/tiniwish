import { describe, it, expect } from "vitest";
import {
  parsePaginationParams,
  buildPaginationMeta,
  paginateArray,
} from "@/lib/pagination";

describe("Pagination Utilities", () => {
  it("parses valid pagination parameters and sets defaults", () => {
    const params = parsePaginationParams();
    expect(params.page).toBe(1);
    expect(params.limit).toBe(12);
    expect(params.skip).toBe(0);
    expect(params.take).toBe(12);
  });

  it("handles string input and clamps maximum limit", () => {
    const params = parsePaginationParams({ page: "3", limit: "250", maxLimit: 50 });
    expect(params.page).toBe(3);
    expect(params.limit).toBe(50);
    expect(params.skip).toBe(100);
    expect(params.take).toBe(50);
  });

  it("handles negative or invalid values gracefully", () => {
    const params = parsePaginationParams({ page: "-5", limit: "abc" });
    expect(params.page).toBe(1);
    expect(params.limit).toBe(12);
  });

  it("builds correct pagination metadata", () => {
    const meta = buildPaginationMeta(45, 2, 10);
    expect(meta.totalCount).toBe(45);
    expect(meta.totalPages).toBe(5);
    expect(meta.page).toBe(2);
    expect(meta.limit).toBe(10);
    expect(meta.hasNextPage).toBe(true);
    expect(meta.hasPreviousPage).toBe(true);
  });

  it("builds correct metadata for edge cases (last page, single page)", () => {
    const metaLast = buildPaginationMeta(45, 5, 10);
    expect(metaLast.hasNextPage).toBe(false);
    expect(metaLast.hasPreviousPage).toBe(true);

    const metaSingle = buildPaginationMeta(5, 1, 10);
    expect(metaSingle.totalPages).toBe(1);
    expect(metaSingle.hasNextPage).toBe(false);
    expect(metaSingle.hasPreviousPage).toBe(false);
  });

  it("slices array correctly with paginateArray", () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const { paginatedItems, meta } = paginateArray(numbers, 2, 3);

    expect(paginatedItems).toEqual([4, 5, 6]);
    expect(meta.totalCount).toBe(10);
    expect(meta.totalPages).toBe(4);
    expect(meta.page).toBe(2);
  });
});

