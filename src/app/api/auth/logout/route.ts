import { apiSuccess, handleApiError } from "@/lib/api-response";
import { authService } from "@/services/auth.service";

export async function POST() {
  try {
    await authService.logout();
    return apiSuccess(null, "Logged out successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}

