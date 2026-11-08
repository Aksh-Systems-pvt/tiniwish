import { z } from "zod";
import { apiSuccess, handleApiError, apiError } from "@/lib/api-response";
import { validateQueryParams } from "@/lib/validation";
import { pincodeService } from "@/features/shipping/pincode.service";

const pincodeQuerySchema = z.object({
  pincode: z.string().min(1, "PIN code is required"),
});

export async function GET(request: Request) {
  try {
    const { pincode } = validateQueryParams(request.url, pincodeQuerySchema);

    if (!pincodeService.isValidPincode(pincode)) {
      return apiError(
        "Please provide a valid 6-digit Indian PIN code",
        "VALIDATION_ERROR",
        400
      );
    }

    const result = pincodeService.checkServiceability(pincode);

    return apiSuccess(result, "PIN code serviceability checked successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

