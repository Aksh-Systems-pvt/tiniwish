import { apiSuccess, handleApiError } from "@/lib/api-response";
import { validateRequestBody } from "@/lib/validation";
import { resetPasswordSchema } from "@/validators/auth.schema";
import { authService } from "@/services/auth.service";

export async function POST(request: Request) {
  try {
    const input = await validateRequestBody(request, resetPasswordSchema);
    const result = await authService.resetPassword(input.password);

    return apiSuccess(result, "Your password has been successfully updated.");
  } catch (error) {
    return handleApiError(error);
  }
}

