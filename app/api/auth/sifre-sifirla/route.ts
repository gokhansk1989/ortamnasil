import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";
import { generateCode, hashCode, sendVerificationEmail } from "@/lib/email";
import bcrypt from "bcryptjs";

const AUTH_PEPPER = process.env.AUTH_PEPPER!;
if (!process.env.AUTH_PEPPER) throw new Error("AUTH_PEPPER is required");

const CODE_TTL_MS = 15 * 60 * 1000;

function hashEmail(email: string): string {
  return createHmac("sha256", AUTH_PEPPER).update(email.toLowerCase().trim()).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword, step } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "E-posta gerekli" }, { status: 400 });
    }

    const emailHash = hashEmail(email);
    const credential = await prisma.authCredential.findUnique({
      where: { emailHash },
      include: { user: true },
    });

    if (step === "request") {
      if (!credential) {
        await new Promise((r) => setTimeout(r, 800));
        return NextResponse.json({
          message: "Eğer bu e-posta kayıtlıysa, sıfırlama kodu gönderildi.",
        });
      }

      await prisma.emailVerification.deleteMany({
        where: { userId: credential.userId },
      });

      const resetCode = generateCode();

      await prisma.emailVerification.create({
        data: {
          userId: credential.userId,
          codeHash: hashCode(resetCode),
          expiresAt: new Date(Date.now() + CODE_TTL_MS),
        },
      });

      await sendVerificationEmail(email.toLowerCase().trim(), resetCode);

      return NextResponse.json({
        message: "Eğer bu e-posta kayıtlıysa, sıfırlama kodu gönderildi.",
      });
    }

    if (step === "reset") {
      if (!code || !newPassword) {
        return NextResponse.json({ error: "Kod ve yeni şifre gerekli" }, { status: 400 });
      }

      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return NextResponse.json({ error: "Şifre en az 6 karakter olmalı" }, { status: 400 });
      }

      if (!credential) {
        return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
      }

      const verification = await prisma.emailVerification.findUnique({
        where: { userId: credential.userId },
      });

      if (!verification) {
        return NextResponse.json({ error: "Önce sıfırlama kodu iste" }, { status: 400 });
      }

      if (verification.expiresAt < new Date()) {
        await prisma.emailVerification.delete({ where: { id: verification.id } });
        return NextResponse.json({ error: "Kod süresi dolmuş, tekrar dene" }, { status: 410 });
      }

      if (verification.attempts >= 5) {
        await prisma.emailVerification.delete({ where: { id: verification.id } });
        return NextResponse.json({ error: "Çok fazla deneme, tekrar kod iste" }, { status: 429 });
      }

      const codeMatch = hashCode(code) === verification.codeHash;

      if (!codeMatch) {
        await prisma.emailVerification.update({
          where: { id: verification.id },
          data: { attempts: { increment: 1 } },
        });
        return NextResponse.json({ error: "Kod hatalı" }, { status: 401 });
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);

      await prisma.authCredential.update({
        where: { userId: credential.userId },
        data: { passwordHash },
      });

      await prisma.emailVerification.delete({ where: { id: verification.id } });

      return NextResponse.json({ message: "Şifren başarıyla güncellendi" });
    }

    return NextResponse.json({ error: "Geçersiz step" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
