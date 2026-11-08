import { z } from "zod";
import { apiPaginated, handleApiError } from "@/lib/api-response";
import { validateQueryParams } from "@/lib/validation";
import { productService } from "@/services/product.service";

const productQuerySchema = z.object({
  categorySlug: z.string().optional(),
  subcategorySlug: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: z.enum(["featured", "price-asc", "price-desc", "newest", "rating"]).optional(),
  query: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
});

export async function GET(request: Request) {
  try {
    const validatedParams = validateQueryParams(request.url, productQuerySchema);
    const result = await productService.getProducts(validatedParams);

    return apiPaginated(
      result.items,
      result.pagination,
      "Products retrieved successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}

