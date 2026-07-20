import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";
import { generateCode, hashCode, sendVerificationEmail } from "@/lib/email";

const AUTH_PEPPER = process.env.AUTH_PEPPER!;
if (!process.env.AUTH_PEPPER) throw new Error("AUTH_PEPPER is required");

function hashEmail(email: string): string {
  return createHmac("sha256", AUTH_PEPPER).update(email.toLowerCase().trim()).digest("hex");
}

const CODE_TTL_MS = 15 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "E-posta gerekli" }, { status: 400 });
    }

    const emailHash = hashEmail(email);
    const credential = await prisma.authCredential.findUnique({
      where: { emailHash },
      include: { user: true },
    });

    if (!credential || credential.user.emailVerified) {
      await new Promise((r) => setTimeout(r, 300));
      return NextResponse.json({ message: "Kod gönderildi" });
    }

    const existing = await prisma.emailVerification.findUnique({
      where: { userId: credential.userId },
    });

    if (existing && Date.now() - existing.createdAt.getTime() < RESEND_COOLDOWN_MS) {
      return NextResponse.json({ error: "Çok sık istek. 1 dakika bekle." }, { status: 429 });
    }

    const code = generateCode();

    await prisma.emailVerification.upsert({
      where: { userId: credential.userId },
      update: {
        codeHash: hashCode(code),
        attempts: 0,
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
        createdAt: new Date(),
      },
      create: {
        userId: credential.userId,
        codeHash: hashCode(code),
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
      },
    });

    await sendVerificationEmail(email.toLowerCase().trim(), code);

    return NextResponse.json({
      userId: credential.userId,
      message: "Kod gönderildi",
    });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
