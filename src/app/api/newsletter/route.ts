import { NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

const newsletterSchema = z.object({
  email: z.string().email("Please provide a valid email address").max(255),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = newsletterSchema.safeParse(body);

    if (!result.success) {
      return apiError("Please enter a valid email address.", "VALIDATION_ERROR", 400);
    }

    const { email } = result.data;

    logger.info("Newsletter subscription request received", { email });

    return apiSuccess(
      {
        email,
        subscribed: true,
        discountCode: "TINIWISH10",
      },
      "Welcome to the TiniWish Circle! Your 10% welcome treat has been reserved.",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
