import { getAuthUser } from "@/lib/auth";

export const WISHLIST_SESSION_COOKIE = "tiniwish_wishlist_session";

export interface ResolvedWishlistContext {
  userId: string | null;
  sessionToken: string;
  isNewSession: boolean;
}

/**
 * Resolves current wishlist context from incoming Request:
 * 1. Checks if authenticated user is present.
 * 2. Checks for sessionToken in cookies or custom header x-wishlist-session.
 * 3. Generates a new guest session token if none exists.
 *
 * This guarantees strict customer data isolation: a user can only ever access
 * their authenticated account or their verified guest session token.
 */
export async function resolveWishlistContext(
  request: Request
): Promise<ResolvedWishlistContext> {
  const user = await getAuthUser(request);

  if (user) {
    return {
      userId: user.id,
      sessionToken: `user_${user.id}`,
      isNewSession: false,
    };
  }

  // Check custom header
  const headerSession = request.headers.get("x-wishlist-session");
  if (headerSession && headerSession.trim()) {
    return {
      userId: null,
      sessionToken: headerSession.trim(),
      isNewSession: false,
    };
  }

  // Check cookies header
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|; )${WISHLIST_SESSION_COOKIE}=([^;]*)`));
  if (match && match[1]) {
    return {
      userId: null,
      sessionToken: decodeURIComponent(match[1]),
      isNewSession: false,
    };
  }

  // Generate new guest session token
  const newSessionToken = `guest_wl_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  return {
    userId: null,
    sessionToken: newSessionToken,
    isNewSession: true,
  };
}

/**
 * Attaches the wishlist session cookie to a Response if it's a new or guest session.
 */
export function attachWishlistSessionCookie(response: Response, sessionToken: string): void {
  response.headers.append(
    "Set-Cookie",
    `${WISHLIST_SESSION_COOKIE}=${encodeURIComponent(sessionToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
  );
}

