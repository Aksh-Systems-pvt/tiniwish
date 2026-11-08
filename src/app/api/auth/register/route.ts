import { apiSuccess, handleApiError } from "@/lib/api-response";
import { validateRequestBody } from "@/lib/validation";
import { registerSchema } from "@/validators/auth.schema";
import { authService } from "@/services/auth.service";

export async function POST(request: Request) {
  try {
    const input = await validateRequestBody(request, registerSchema);
    const result = await authService.register(input);

    return apiSuccess(
      result,
      result.requiresEmailVerification
        ? "Account created. Please check your email to verify your account."
        : "Welcome to TiniWish. Your account has been created successfully.",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}

