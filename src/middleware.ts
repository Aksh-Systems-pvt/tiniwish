import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ADMIN_ROLES = ["ADMIN", "STORE_MANAGER", "INVENTORY_MANAGER", "ORDER_MANAGER"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 1. Admin route protection (/admin/*)
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = (user.app_metadata?.role as string) || "CUSTOMER";
    if (!ADMIN_ROLES.includes(userRole)) {
      // Forbidden: customer attempting to access administrative portal
      const unauthorizedUrl = new URL("/account", request.url);
      unauthorizedUrl.searchParams.set("error", "unauthorized_admin_access");
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  // 2. Customer account route protection (/account/*)
  if (pathname.startsWith("/account")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Guest routes redirect if already logged in (/login, /register)
  if (pathname === "/login" || pathname === "/register") {
    if (user) {
      const userRole = (user.app_metadata?.role as string) || "CUSTOMER";
      if (ADMIN_ROLES.includes(userRole)) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      const redirectTo = request.nextUrl.searchParams.get("redirectTo");
      return NextResponse.redirect(new URL(redirectTo || "/account", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static assets (.png, .jpg, .svg, etc.)
     * - api routes (api routes handle their own auth & errors)
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|icons/|api/).*)",
  ],
};

