import { NextResponse, type NextRequest } from "next/server";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "degistir-beni-gizli-anahtar";
const COOKIE_NAME = "ortam_admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Şifre gerekli" }, { status: 400 });
    }

    if (password !== ADMIN_TOKEN) {
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ error: "Şifre yanlış" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, ADMIN_TOKEN, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }
}
