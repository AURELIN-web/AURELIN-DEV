import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email;
    const password = body?.password;

    const envEmail = process.env.ADMIN_EMAIL || "admin@aurelinco.com";
    const envPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (
      email?.trim().toLowerCase() === envEmail.trim().toLowerCase() &&
      password === envPassword
    ) {
      const response = NextResponse.json({ success: true });
      response.cookies.set("aurelin_admin_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "Invalid admin email or password" },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
