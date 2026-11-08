import { describe, it, expect } from "vitest";
import { z } from "zod";
import { validateRequestBody, validateQueryParams } from "@/lib/validation";
import { ValidationError } from "@/lib/errors";

describe("Request Validation Utilities", () => {
  const schema = z.object({
    title: z.string().min(3),
    quantity: z.number().int().positive(),
  });

  it("validates request body successfully", async () => {
    const validBody = { title: "Golden Jhumka", quantity: 2 };
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const parsed = await validateRequestBody(request, schema);
    expect(parsed).toEqual(validBody);
  });

  it("throws ValidationError when JSON body is invalid", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      body: "not-json-format",
    });

    await expect(validateRequestBody(request, schema)).rejects.toThrow(ValidationError);
  });

  it("throws ZodError when schema fails", async () => {
    const invalidBody = { title: "No", quantity: -1 };
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidBody),
    });

    await expect(validateRequestBody(request, schema)).rejects.toThrow(z.ZodError);
  });

  it("validates query parameters from string URL", () => {
    const querySchema = z.object({
      category: z.string(),
      page: z.coerce.number().int().positive(),
    });

    const url = "http://localhost/api/v1/products?category=jewellery&page=2";
    const result = validateQueryParams(url, querySchema);

    expect(result.category).toBe("jewellery");
    expect(result.page).toBe(2);
  });
});

