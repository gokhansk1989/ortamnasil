import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCode, hashCode, sendVerificationEmail } from "@/lib/email";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN!;
if (!process.env.ADMIN_TOKEN) throw new Error("ADMIN_TOKEN environment variable is required");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
if (!process.env.ADMIN_EMAIL) throw new Error("ADMIN_EMAIL environment variable is required");

const CODE_TTL_MS = 10 * 60 * 1000;

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

    await prisma.adminOtp.deleteMany({});

    const code = generateCode();

    const otp = await prisma.adminOtp.create({
      data: {
        codeHash: hashCode(code),
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
      },
    });

    await sendVerificationEmail(ADMIN_EMAIL, code);

    return NextResponse.json({
      needsOtp: true,
      otpId: otp.id,
      message: "Doğrulama kodu admin e-postaya gönderildi",
    });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
