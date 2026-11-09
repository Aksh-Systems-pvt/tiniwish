import { getAuthUser } from "@/lib/auth";

export const CART_SESSION_COOKIE = "tiniwish_cart_session";

export interface ResolvedCartContext {
  userId: string | null;
  sessionToken: string;
  isNewSession: boolean;
}

/**
 * Resolves current cart context from Request:
 * 1. Checks if authenticated user is present.
 * 2. Checks for sessionToken in cookies or custom header x-cart-session.
 * 3. Generates a new guest session token if none exists.
 */
export async function resolveCartContext(
  request: Request
): Promise<ResolvedCartContext> {
  const user = await getAuthUser(request);

  if (user) {
    return {
      userId: user.id,
      sessionToken: `user_${user.id}`,
      isNewSession: false,
    };
  }

  // Check custom header
  const headerSession = request.headers.get("x-cart-session");
  if (headerSession && headerSession.trim()) {
    return {
      userId: null,
      sessionToken: headerSession.trim(),
      isNewSession: false,
    };
  }

  // Check cookies header
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|; )${CART_SESSION_COOKIE}=([^;]*)`));
  if (match && match[1]) {
    return {
      userId: null,
      sessionToken: decodeURIComponent(match[1]),
      isNewSession: false,
    };
  }

  // Generate new guest session token
  const newSessionToken = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  return {
    userId: null,
    sessionToken: newSessionToken,
    isNewSession: true,
  };
}

/**
 * Attaches the cart session cookie to a Response if it's a new or guest session.
 */
export function attachCartSessionCookie(response: Response, sessionToken: string): void {
  // 30 days max-age
  response.headers.append(
    "Set-Cookie",
    `${CART_SESSION_COOKIE}=${encodeURIComponent(sessionToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
  );
}

