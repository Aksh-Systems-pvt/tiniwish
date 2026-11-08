import { apiSuccess, handleApiError } from "@/lib/api-response";
import { validateRequestBody } from "@/lib/validation";
import { loginSchema } from "@/validators/auth.schema";
import { authService } from "@/services/auth.service";

export async function POST(request: Request) {
  try {
    const input = await validateRequestBody(request, loginSchema);
    const result = await authService.login(input);

    return apiSuccess(result, "Welcome back to TiniWish.");
  } catch (error) {
    return handleApiError(error);
  }
}

