import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";
import { createHmac } from "crypto";

const AUTH_PEPPER = process.env.AUTH_PEPPER!;
if (!process.env.AUTH_PEPPER) throw new Error("AUTH_PEPPER is required");

function hashEmail(email: string): string {
  return createHmac("sha256", AUTH_PEPPER).update(email.toLowerCase().trim()).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "E-posta gerekli" }, { status: 400 });
    }

    const emailHash = hashEmail(email);
    const credential = await prisma.authCredential.findUnique({
      where: { emailHash },
      include: { user: true },
    });

    if (!credential) {
      await new Promise((r) => setTimeout(r, 300));
      return NextResponse.json({ error: "Giriş bilgileri hatalı" }, { status: 401 });
    }

    if (!credential.user.emailVerified) {
      return NextResponse.json({
        error: "E-posta henüz doğrulanmamış",
        needsVerification: true,
        userId: credential.userId,
      }, { status: 403 });
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
