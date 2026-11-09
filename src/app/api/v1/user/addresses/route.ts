import { NextRequest } from "next/server";
import { addressRepository } from "@/repositories/address.repository";
import { getAuthUser } from "@/lib/auth";
import { checkoutAddressSchema } from "@/lib/checkout-schemas";
import { CheckoutAddressDTO } from "@/types/checkout";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { UnauthorizedError } from "@/lib/errors";

/**
 * GET /api/v1/user/addresses
 * Retrieves saved delivery addresses for the authenticated customer.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      throw new UnauthorizedError("You must be logged in to view saved addresses");
    }

    const addresses = await addressRepository.findByUserId(user.id);
    return apiSuccess(addresses, "Addresses retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/v1/user/addresses
 * Saves a new delivery address for the authenticated customer.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      throw new UnauthorizedError("You must be logged in to save an address");
    }

    const body = await request.json().catch(() => ({}));
    const validated = checkoutAddressSchema.parse(body);

    const savedAddress = await addressRepository.createAddress(
      user.id,
      validated as unknown as CheckoutAddressDTO
    );

    return apiSuccess(savedAddress, {
      status: 201,
      message: "Address saved successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

