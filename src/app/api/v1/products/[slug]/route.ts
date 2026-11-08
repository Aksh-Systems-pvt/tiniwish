import { apiSuccess, handleApiError } from "@/lib/api-response";
import { productService } from "@/services/product.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await productService.getProductBySlug(slug);

    return apiSuccess(product, "Product details retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

