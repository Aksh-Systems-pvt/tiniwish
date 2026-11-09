import { NextRequest } from "next/server";
import { recommendationService } from "@/services/recommendation.service";
import { apiSuccess, handleApiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/v1/products/[slug]/recommendations
 * Retrieves similar product recommendations based on category and product attributes.
 * Works with either product slug or product ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(12, Math.max(1, Number(searchParams.get("limit")) || 4));

    const recommendations = await recommendationService.getSimilarProducts(
      slug,
      limit
    );

    return apiSuccess(recommendations);
  } catch (err) {
    return handleApiError(err);
  }
}

