import { NextRequest } from "next/server";
import { checkoutService } from "@/services/checkout.service";
import { getAuthUser } from "@/lib/auth";
import { resolveCartContext } from "@/lib/cart-session";
import { createOrderSchema } from "@/lib/checkout-schemas";
import { CreateOrderRequestDTO } from "@/types/checkout";
import { apiSuccess, handleApiError } from "@/lib/api-response";

/**
 * POST /api/v1/checkout/orders
 * Places a new order with atomic database transactions, idempotency handling, and stock validation.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const validated = createOrderSchema.parse(body);
    const authUser = await getAuthUser(request);
    const cartContext = await resolveCartContext(request);

    const order = await checkoutService.createOrder(
      validated as unknown as CreateOrderRequestDTO,
      authUser,
      cartContext
    );

    return apiSuccess(order, {
      status: 201,
      message: `Order ${order.orderNumber} placed successfully`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

