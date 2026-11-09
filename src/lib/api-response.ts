import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  ApiErrorCode,
  PaginationMeta,
  PaginatedData,
} from "@/types/api";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

export interface ApiSuccessOptions {
  message?: string;
  status?: number;
}

/**
 * Creates a standard JSON success response conforming to:
 * {
 *   "success": true,
 *   "message": "Operation successful",
 *   "data": {}
 * }
 */
export function apiSuccess<T>(
  data: T,
  messageOrOptions: string | ApiSuccessOptions = "Operation successful",
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  let message = "Operation successful";
  let resolvedStatus = status;

  if (typeof messageOrOptions === "object" && messageOrOptions !== null) {
    if (messageOrOptions.message) message = messageOrOptions.message;
    if (typeof messageOrOptions.status === "number") resolvedStatus = messageOrOptions.status;
  } else if (typeof messageOrOptions === "string") {
    message = messageOrOptions;
  }

  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status: resolvedStatus }
  );
}

/**
 * Creates a paginated standard JSON success response.
 */
export function apiPaginated<T>(
  items: T[],
  pagination: PaginationMeta,
  message: string = "Items retrieved successfully",
  status: number = 200
): NextResponse<ApiSuccessResponse<PaginatedData<T>>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data: {
        items,
        pagination,
      },
    },
    { status }
  );
}

/**
 * Creates a standard JSON error response conforming to:
 * {
 *   "success": false,
 *   "message": "Operation failed",
 *   "error": {
 *     "code": "VALIDATION_ERROR"
 *   }
 * }
 */
export function apiError(
  message: string,
  code: ApiErrorCode | string = "INTERNAL_SERVER_ERROR",
  status: number = 500,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const errorPayload: ApiErrorResponse["error"] = {
    code,
  };

  if (details !== undefined) {
    errorPayload.details = details;
  }

  return NextResponse.json(
    {
      success: false,
      message,
      error: errorPayload,
    },
    { status }
  );
}

/**
 * Centralized error handler for Next.js Route Handlers.
 * Catches AppError, Zod validation errors, Prisma errors, and uncaught exceptions.
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  // Rethrow Next.js internal control flow errors (prerender bailouts, dynamic redirect/notFound)
  if (
    error instanceof Error &&
    (error.message.includes("bail out of prerendering") ||
      error.message === "NEXT_REDIRECT" ||
      error.message === "NEXT_NOT_FOUND")
  ) {
    throw error;
  }

  // 1. Known Domain / Application Errors
  if (error instanceof AppError) {
    logger.warn(`AppError [${error.errorCode}]: ${error.message}`, {
      statusCode: error.statusCode,
      details: error.details,
    });
    return apiError(error.message, error.errorCode, error.statusCode, error.details);
  }

  // 2. Zod Schema Validation Errors
  if (error instanceof ZodError) {
    const formattedErrors = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }));

    logger.warn("Zod Validation Error", { issues: formattedErrors });
    return apiError("Validation failed", "VALIDATION_ERROR", 400, formattedErrors);
  }

  // 3. Prisma Database Errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error(`Prisma Error [${error.code}]: ${error.message}`, error);

    switch (error.code) {
      case "P2002": {
        const target = (error.meta?.target as string[])?.join(", ") || "field";
        return apiError(`Unique constraint violated for: ${target}`, "CONFLICT", 409);
      }
      case "P2025":
        return apiError("Requested record not found in database", "NOT_FOUND", 404);
      default:
        return apiError("Database transaction error", "BAD_REQUEST", 400);
    }
  }

  // 4. Uncaught / Generic Server Errors
  logger.error("Unhandled API Exception", error);
  const isDevelopment = process.env.NODE_ENV === "development";
  const message = isDevelopment && error instanceof Error ? error.message : "Internal server error";

  return apiError(message, "INTERNAL_SERVER_ERROR", 500);
}

