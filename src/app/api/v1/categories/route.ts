import { apiSuccess, handleApiError } from "@/lib/api-response";
import { productService } from "@/services/product.service";

export async function GET() {
  try {
    const categories = await productService.getCategories();
    return apiSuccess(categories, "Categories retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

