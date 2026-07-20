import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { moderateText } from "@/lib/moderation";
import { createHmac } from "crypto";
import { generateCode, hashCode, sendVerificationEmail } from "@/lib/email";

const AUTH_PEPPER = process.env.AUTH_PEPPER!;
if (!process.env.AUTH_PEPPER) throw new Error("AUTH_PEPPER is required");

function hashEmail(email: string): string {
  return createHmac("sha256", AUTH_PEPPER).update(email.toLowerCase().trim()).digest("hex");
}

const HTML_RE = /<[^>]*>/;
const CODE_TTL_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { nick, email } = await req.json();

    if (!nick || !email) {
      return NextResponse.json({ error: "Nick ve e-posta gerekli" }, { status: 400 });
    }

    const trimmedNick = nick.trim();
    if (trimmedNick.length < 3 || trimmedNick.length > 30) {
      return NextResponse.json({ error: "Nick 3-30 karakter olmalı" }, { status: 400 });
    }

    if (HTML_RE.test(trimmedNick)) {
      return NextResponse.json({ error: "Nick'te HTML kullanılamaz" }, { status: 400 });
    }

    const nickMod = moderateText(trimmedNick);
    if (!nickMod.ok) {
      return NextResponse.json({ error: `Nick: ${nickMod.reason}` }, { status: 422 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Geçersiz e-posta" }, { status: 400 });
    }

    const existingNick = await prisma.user.findUnique({ where: { nick: trimmedNick } });
    if (existingNick) {
      return NextResponse.json({ error: "Bu takma ad zaten alınmış" }, { status: 409 });
    }

    const emailHash = hashEmail(email);
    const existingEmail = await prisma.authCredential.findUnique({ where: { emailHash } });
    if (existingEmail) {
      return NextResponse.json({ error: "Bu bilgilerle işlem yapılamadı" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        nick: trimmedNick,
        isAdult: true,
        emailVerified: false,
      },
    });

    await prisma.authCredential.create({
      data: {
        emailHash,
        userId: user.id,
      },
    });

    const code = generateCode();

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        codeHash: hashCode(code),
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
      },
    });

    await sendVerificationEmail(email.toLowerCase().trim(), code);

    return NextResponse.json({
      id: user.id,
      nick: user.nick,
      needsVerification: true,
      message: "Doğrulama kodu e-postana gönderildi",
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
