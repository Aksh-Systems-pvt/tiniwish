import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { authService } from "@/services/auth.service";
import { logger } from "@/lib/logger";

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  const fallbackRedirect = `${origin}/login?error=google_auth_failed`;

  if (errorParam || !code || !state) {
    logger.warn("Google OAuth callback returned error or missing code/state", { error: errorParam });
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorParam || "cancelled")}`);
  }

  // 1. Verify CSRF State
  let nextUrl = "/account";
  try {
    const cookieStore = await cookies();
    const storedToken = cookieStore.get("google_oauth_state")?.value;
    cookieStore.delete("google_oauth_state");

    const decodedState = JSON.parse(Buffer.from(state, "base64url").toString("utf-8"));
    if (!storedToken || storedToken !== decodedState.token) {
      logger.error("Google OAuth CSRF state verification mismatch");
      return NextResponse.redirect(`${origin}/login?error=invalid_oauth_state`);
    }

    if (decodedState.next && typeof decodedState.next === "string" && decodedState.next.startsWith("/")) {
      nextUrl = decodedState.next;
    }
  } catch (err) {
    logger.error("Failed to decode Google OAuth state payload", err);
    return NextResponse.redirect(fallbackRedirect);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    logger.error("Missing Google OAuth credentials in environment");
    return NextResponse.redirect(`${origin}/login?error=google_oauth_not_configured`);
  }

  try {
    // 2. Direct token exchange with Google OAuth token endpoint
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      logger.error("Google token exchange failed", { tokenData });
      return NextResponse.redirect(fallbackRedirect);
    }

    // 3. Fetch user profile directly from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = (await userRes.json()) as GoogleUserInfo;
    if (!userRes.ok || !googleUser.email) {
      logger.error("Failed to retrieve Google user profile", { googleUser });
      return NextResponse.redirect(fallbackRedirect);
    }

    if (!googleUser.email_verified) {
      logger.warn("Google user email is not verified", { email: googleUser.email });
      return NextResponse.redirect(`${origin}/login?error=email_not_verified`);
    }

    // 4. Authenticate user into application session via Supabase Admin OTP bridge
    const admin = createAdminClient();
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: googleUser.email,
      options: {
        data: {
          first_name: googleUser.given_name || googleUser.name?.split(" ")[0] || "Customer",
          last_name: googleUser.family_name || googleUser.name?.split(" ").slice(1).join(" ") || "",
          full_name: googleUser.name || "Customer",
          avatar_url: googleUser.picture || null,
        },
      },
    });

    if (linkError || !linkData?.properties?.hashed_token) {
      logger.error("Failed to generate application session link", linkError);
      return NextResponse.redirect(fallbackRedirect);
    }

    // 5. Establish secure session cookies on the response
    const supabaseServer = await createServerSupabaseClient();
    const verificationType =
      (linkData.properties.verification_type as
        | "magiclink"
        | "signup"
        | "recovery"
        | "invite"
        | "email_change") || "magiclink";

    const { data: verifyData, error: verifyError } = await supabaseServer.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: verificationType,
    });

    if (verifyError || !verifyData?.user) {
      logger.error("Failed to establish session via verifyOtp", verifyError);
      return NextResponse.redirect(fallbackRedirect);
    }

    // 6. Sync user into application database with Role.CUSTOMER
    await authService.syncOAuthUser({
      id: verifyData.user.id,
      email: googleUser.email,
      user_metadata: {
        first_name: googleUser.given_name || googleUser.name?.split(" ")[0] || "Customer",
        last_name: googleUser.family_name || googleUser.name?.split(" ").slice(1).join(" ") || "",
        avatar_url: googleUser.picture || null,
      },
    });

    logger.info(`Direct Google OAuth completed successfully for user: ${googleUser.email}`);

    // Direct redirect to destination (e.g. /account or /checkout)
    return NextResponse.redirect(`${origin}${nextUrl}`);
  } catch (err) {
    logger.error("Exception handling Google OAuth callback", err);
    return NextResponse.redirect(fallbackRedirect);
  }
}
