import { describe, it, expect } from "vitest";
import { z } from "zod";
import { apiSuccess, apiError, apiPaginated, handleApiError } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";

describe("API Response Utilities & Contracts", () => {
  it("formats success response according to contract", async () => {
    const data = { id: "123", name: "Test" };
    const response = apiSuccess(data, "Operation successful", 200);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      message: "Operation successful",
      data: { id: "123", name: "Test" },
    });
  });

  it("formats paginated response with metadata", async () => {
    const items = [{ id: "1" }, { id: "2" }];
    const pagination = {
      page: 1,
      limit: 10,
      totalCount: 2,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };

    const response = apiPaginated(items, pagination, "Items loaded");
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.items).toEqual(items);
    expect(json.data.pagination).toEqual(pagination);
  });

  it("formats error response according to contract", async () => {
    const response = apiError("Validation failed", "VALIDATION_ERROR", 400);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({
      success: false,
      message: "Validation failed",
      error: {
        code: "VALIDATION_ERROR",
      },
    });
  });

  it("handleApiError transforms AppError correctly", async () => {
    const notFound = new NotFoundError("Product with slug 'abc' not found");
    const response = handleApiError(notFound);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.message).toBe("Product with slug 'abc' not found");
    expect(json.error.code).toBe("NOT_FOUND");
  });

  it("handleApiError transforms ZodError to VALIDATION_ERROR", async () => {
    const schema = z.object({ email: z.string().email() });
    const parseResult = schema.safeParse({ email: "not-an-email" });

    if (!parseResult.success) {
      const response = handleApiError(parseResult.error);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("VALIDATION_ERROR");
      expect(Array.isArray(json.error.details)).toBe(true);
    }
  });

  it("handleApiError transforms unknown exceptions to 500 error", async () => {
    const genericError = new Error("Database network socket closed");
    const response = handleApiError(genericError);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("INTERNAL_SERVER_ERROR");
  });
});

