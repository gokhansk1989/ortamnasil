import { NextResponse, type NextRequest } from "next/server";
import { createHmac } from "crypto";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN!;
if (!process.env.ADMIN_TOKEN) throw new Error("ADMIN_TOKEN environment variable is required");

const ADMIN_SECRET = process.env.SESSION_SECRET!;
if (!process.env.SESSION_SECRET) throw new Error("SESSION_SECRET environment variable is required");

const COOKIE_NAME = "ortam_admin";

function signAdmin(token: string): string {
  return createHmac("sha256", ADMIN_SECRET).update(token).digest("hex");
}

export function verifyAdminCookie(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  const expected = signAdmin(ADMIN_TOKEN);
  if (cookieValue.length !== expected.length) return false;
  let match = true;
  for (let i = 0; i < cookieValue.length; i++) {
    if (cookieValue[i] !== expected[i]) match = false;
  }
  return match;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Şifre gerekli" }, { status: 400 });
    }

    if (password.length > 200) {
      return NextResponse.json({ error: "Geçersiz şifre" }, { status: 400 });
    }

    if (password !== ADMIN_TOKEN) {
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ error: "Şifre yanlış" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, signAdmin(ADMIN_TOKEN), {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }
}
