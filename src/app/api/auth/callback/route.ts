import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { authService } from "@/services/auth.service";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/account";

  if (code) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        logger.error("OAuth code exchange failed", error);
        return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
      }

      if (data?.user) {
        // Sync or register user in Prisma database
        await authService.syncOAuthUser(data.user);
      }

      return NextResponse.redirect(`${origin}${next}`);
    } catch (err) {
      logger.error("Exception during auth callback handling", err);
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=no_auth_code`);
}

