import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";

function hashEmail(email: string): string {
  const pepper = process.env.AUTH_PEPPER || "default-pepper";
  return createHmac("sha256", pepper).update(email.toLowerCase().trim()).digest("hex");
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
      return NextResponse.json({ error: "Kayıtlı kullanıcı bulunamadı" }, { status: 404 });
    }

    // Session cookie set
    const res = NextResponse.json({
      id: credential.user.id,
      nick: credential.user.nick,
      message: "Giriş başarılı",
    });

    res.cookies.set("session", credential.userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 gün
      path: "/",
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
