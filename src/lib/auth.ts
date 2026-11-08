import { Role } from "@prisma/client";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { userRepository } from "@/repositories/user.repository";
import { logger } from "@/lib/logger";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  firstName?: string | null;
  lastName?: string | null;
}

/**
 * Extracts and verifies the current session user from request headers or auth cookie.
 * Supports development mock headers for automated test suites.
 */
export async function getAuthUser(request?: Request): Promise<AuthUser | null> {
  const isDevOrTest = process.env.NODE_ENV !== "production";

  // Development & Test harness mock injection
  if (request && isDevOrTest) {
    const mockRole = request.headers.get("x-mock-user-role") as Role | null;
    const mockId = request.headers.get("x-mock-user-id");
    const mockEmail = request.headers.get("x-mock-user-email");

    if (mockId && mockEmail && mockRole) {
      return {
        id: mockId,
        email: mockEmail,
        role: mockRole,
        firstName: "Test",
        lastName: "User",
      };
    }
  }

  // 1. Check Authorization Bearer header if present
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      if (token) {
        try {
          const supabase = await createServerSupabaseClient();
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (!error && user) {
            const dbUser = await userRepository.findBySupabaseUid(user.id);
            if (dbUser && dbUser.isActive && !dbUser.deletedAt) {
              return {
                id: dbUser.id,
                email: dbUser.email,
                role: dbUser.role,
                firstName: dbUser.firstName,
                lastName: dbUser.lastName,
              };
            }
          }
        } catch (err) {
          logger.warn("Failed to authenticate user via Bearer token", { error: String(err) });
        }
      }
    }
  }

  // 2. Check Supabase session cookies
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!error && user) {
      const dbUser = await userRepository.findBySupabaseUid(user.id);
      if (dbUser && dbUser.isActive && !dbUser.deletedAt) {
        return {
          id: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
        };
      }
    }
  } catch (err) {
    logger.warn("Failed to authenticate user via Supabase cookie", { error: String(err) });
  }

  return null;
}

/**
 * Ensures the incoming request is from an authenticated user.
 * Throws UnauthorizedError if not authenticated.
 */
export async function requireAuth(request?: Request): Promise<AuthUser> {
  const user = await getAuthUser(request);
  if (!user) {
    throw new UnauthorizedError("You must be logged in to perform this operation");
  }
  return user;
}

/**
 * Ensures the authenticated user possesses one of the authorized roles.
 * Throws ForbiddenError if user does not have sufficient permissions.
 */
export async function requireRole(
  request: Request,
  allowedRoles: Role[]
): Promise<AuthUser> {
  const user = await requireAuth(request);

  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(
      `Permission denied. Required role(s): ${allowedRoles.join(", ")}`
    );
  }

  return user;
}

