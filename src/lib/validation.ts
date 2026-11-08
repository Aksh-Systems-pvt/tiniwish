import { ZodSchema } from "zod";
import { ValidationError } from "@/lib/errors";

/**
 * Validates and extracts JSON body from an incoming HTTP Request.
 * Throws ValidationError if JSON is malformed or schema validation fails.
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<T> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new ValidationError("Invalid JSON in request body");
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw result.error;
  }

  return result.data;
}

/**
 * Validates query search parameters from a URL or URLSearchParams against a Zod schema.
 */
export function validateQueryParams<T>(
  urlOrParams: URL | URLSearchParams | string,
  schema: ZodSchema<T>
): T {
  let params: URLSearchParams;

  if (typeof urlOrParams === "string") {
    const url = new URL(urlOrParams, "http://localhost");
    params = url.searchParams;
  } else if (urlOrParams instanceof URL) {
    params = urlOrParams.searchParams;
  } else {
    params = urlOrParams;
  }

  const rawObject: Record<string, unknown> = {};
  params.forEach((value, key) => {
    // If param is a numeric string and looks like a number, or boolean
    if (rawObject[key] !== undefined) {
      if (Array.isArray(rawObject[key])) {
        (rawObject[key] as unknown[]).push(value);
      } else {
        rawObject[key] = [rawObject[key], value];
      }
    } else {
      rawObject[key] = value;
    }
  });

  const result = schema.safeParse(rawObject);
  if (!result.success) {
    throw result.error;
  }

  return result.data;
}

