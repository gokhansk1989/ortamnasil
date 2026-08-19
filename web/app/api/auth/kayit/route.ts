import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { moderateText } from "@/lib/moderation";
import { createHmac } from "crypto";
import bcrypt from "bcryptjs";
import { generateCode, hashCode, sendVerificationEmail, notifyAdmin } from "@/lib/email";

const AUTH_PEPPER = process.env.AUTH_PEPPER!;
if (!process.env.AUTH_PEPPER) throw new Error("AUTH_PEPPER is required");

function hashEmail(email: string): string {
  return createHmac("sha256", AUTH_PEPPER).update(email.toLowerCase().trim()).digest("hex");
}

const HTML_RE = /<[^>]*>/;
const CODE_TTL_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { nick, email, password } = await req.json();

    if (!nick || !email || !password) {
      return NextResponse.json({ error: "Nick, e-posta ve şifre gerekli" }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Şifre en az 6 karakter olmalı" }, { status: 400 });
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

    const passwordHash = await bcrypt.hash(password, 12);
    const code = generateCode();

    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          nick: trimmedNick,
          isAdult: true,
          emailVerified: false,
        },
      });

      await tx.authCredential.create({
        data: {
          emailHash,
          passwordHash,
          userId: u.id,
        },
      });

      await tx.emailVerification.create({
        data: {
          userId: u.id,
          codeHash: hashCode(code),
          expiresAt: new Date(Date.now() + CODE_TTL_MS),
        },
      });

      return u;
    });

    let emailSent = true;
    try {
      await sendVerificationEmail(email.toLowerCase().trim(), code);
    } catch (emailErr) {
      emailSent = false;
      console.error("[kayit] E-posta gönderilemedi:", emailErr);
    }

    notifyAdmin("Yeni üye kaydoldu", [
      { label: "Nick", value: trimmedNick },
      { label: "Tarih", value: new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }) },
    ]);

    return NextResponse.json({
      id: user.id,
      nick: user.nick,
      needsVerification: true,
      emailSent,
      message: emailSent
        ? "Doğrulama kodu e-postana gönderildi"
        : "Hesap oluşturuldu ama doğrulama e-postası gönderilemedi. Lütfen tekrar dene.",
    }, { status: 201 });
  } catch (err) {
    console.error("[kayit] Kayıt hatası:", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
