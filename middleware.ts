import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminSession = request.cookies.get("aurelin_admin_session")?.value;

    if (adminSession !== "authenticated") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // Handle standard customer sessions
  try {
    const { supabase, supabaseResponse } = createClient(request);
    const authClient = supabase.auth as any;
    const authResult = typeof authClient?.getUser === "function" ? await authClient.getUser() : null;
    const user = authResult?.data?.user;

    // Protect customer account routes
    if (pathname.startsWith("/account") || pathname.startsWith("/wishlist") || pathname.startsWith("/checkout")) {
      if (!user) {
        return NextResponse.redirect(
          new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url)
        );
      }
    }

    return supabaseResponse;
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)",
  ],
};
