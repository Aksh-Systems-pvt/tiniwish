import { z } from "zod";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { validateQueryParams } from "@/lib/validation";
import { searchService } from "@/services/search.service";

const analyticsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional().default(30),
});

export async function GET(request: Request) {
  try {
    const params = validateQueryParams(request.url, analyticsQuerySchema);
    const summary = await searchService.getAnalyticsSummary(params.days);

    return apiSuccess(summary, "Search analytics reporting retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

