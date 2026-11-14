import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") || "/account";

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    const errorUrl = new URL("/login", origin);
    errorUrl.searchParams.set("error", "google_oauth_not_configured");
    return NextResponse.redirect(errorUrl);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  // Cryptographically secure CSRF state token
  const stateToken = crypto.randomBytes(32).toString("hex");
  const statePayload = Buffer.from(JSON.stringify({ token: stateToken, next })).toString("base64url");

  // Store in secure httpOnly cookie for CSRF verification
  const cookieStore = await cookies();
  cookieStore.set("google_oauth_state", stateToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });

  // Direct redirection to Google OAuth 2.0 Authorization Server
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("state", statePayload);
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(googleAuthUrl.toString());
}
