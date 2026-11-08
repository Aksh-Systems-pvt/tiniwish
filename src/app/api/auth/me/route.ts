import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { validateRequestBody } from "@/lib/validation";
import { updateProfileSchema } from "@/validators/auth.schema";
import { authService } from "@/services/auth.service";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    const profile = await authService.getProfile(user.id);

    return apiSuccess(profile, "Profile retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth(request);
    const input = await validateRequestBody(request, updateProfileSchema);
    const updated = await authService.updateProfile(user.id, input);

    return apiSuccess(updated, "Profile updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

