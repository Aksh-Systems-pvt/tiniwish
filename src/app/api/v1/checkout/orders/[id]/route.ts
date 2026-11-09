import { NextRequest } from "next/server";
import { checkoutService } from "@/services/checkout.service";
import { getAuthUser } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/checkout/orders/[id]
 * Retrieves order details and fulfillment status.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser(request);

    const order = await checkoutService.getOrder(id, authUser);

    return apiSuccess(order, "Order details retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

