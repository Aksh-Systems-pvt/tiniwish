import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const healthData = {
      status: "healthy",
      service: "TiniWish E-Commerce Core API",
      version: "v1",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    };

    return apiSuccess(healthData, "Service is healthy and operational");
  } catch (error) {
    return handleApiError(error);
  }
}

