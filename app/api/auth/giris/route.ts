import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";
import { createHmac } from "crypto";
import bcrypt from "bcryptjs";

const AUTH_PEPPER = process.env.AUTH_PEPPER!;
if (!process.env.AUTH_PEPPER) throw new Error("AUTH_PEPPER is required");

function hashEmail(email: string): string {
  return createHmac("sha256", AUTH_PEPPER).update(email.toLowerCase().trim()).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-posta ve şifre gerekli" }, { status: 400 });
    }

    const emailHash = hashEmail(email);
    const credential = await prisma.authCredential.findUnique({
      where: { emailHash },
      include: { user: true },
    });

    if (!credential) {
      await bcrypt.hash("dummy", 12);
      return NextResponse.json({ error: "E-posta veya şifre hatalı" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, credential.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "E-posta veya şifre hatalı" }, { status: 401 });
    }

    if (!credential.user.emailVerified) {
      return NextResponse.json({
        error: "E-posta henüz doğrulanmamış",
        needsVerification: true,
        userId: credential.userId,
      }, { status: 403 });
    }

    if (credential.mustChangePassword) {
      return NextResponse.json({
        mustChangePassword: true,
        message: "Geçici şifreyle giriş yapıldı. Yeni şifreni belirle.",
      });
    }

    const res = NextResponse.json({
      id: credential.user.id,
      nick: credential.user.nick,
      message: "Giriş başarılı",
    });

    setSessionCookie(res, credential.userId);
    return res;
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
