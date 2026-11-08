import { apiSuccess, handleApiError } from "@/lib/api-response";
import { validateRequestBody } from "@/lib/validation";
import { forgotPasswordSchema } from "@/validators/auth.schema";
import { authService } from "@/services/auth.service";

export async function POST(request: Request) {
  try {
    const input = await validateRequestBody(request, forgotPasswordSchema);
    const result = await authService.forgotPassword(input.email);

    return apiSuccess(result, result.message);
  } catch (error) {
    return handleApiError(error);
  }
}

