import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";
import bcrypt from "bcryptjs";
import { generateCode, hashCode, sendVerificationEmail } from "@/lib/email";

const AUTH_PEPPER = process.env.AUTH_PEPPER!;
if (!process.env.AUTH_PEPPER) throw new Error("AUTH_PEPPER is required");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
if (!process.env.ADMIN_EMAIL) throw new Error("ADMIN_EMAIL is required");

const CODE_TTL_MS = 10 * 60 * 1000;

function hashEmail(email: string): string {
  return createHmac("sha256", AUTH_PEPPER).update(email.toLowerCase().trim()).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "E-posta ve şifre gerekli" }, { status: 400 });
    }

    if (password.length > 200) {
      return NextResponse.json({ error: "Geçersiz giriş bilgileri" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailHash = hashEmail(normalizedEmail);

    const credential = await prisma.authCredential.findUnique({
      where: { emailHash },
    });

    if (!credential) {
      await bcrypt.hash("dummy", 12);
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ error: "E-posta veya şifre hatalı" }, { status: 401 });
    }

    const passwordValid = await bcrypt.compare(password, credential.passwordHash);
    if (!passwordValid) {
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ error: "E-posta veya şifre hatalı" }, { status: 401 });
    }

    const adminEmailHash = hashEmail(ADMIN_EMAIL);
    if (emailHash !== adminEmailHash) {
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json({ error: "Bu hesap admin yetkisine sahip değil" }, { status: 403 });
    }

    await prisma.adminOtp.deleteMany({});

    const code = generateCode();

    const otp = await prisma.adminOtp.create({
      data: {
        codeHash: hashCode(code),
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
      },
    });

    await sendVerificationEmail(normalizedEmail, code);

    return NextResponse.json({
      needsOtp: true,
      otpId: otp.id,
      message: "Doğrulama kodu e-postana gönderildi",
    });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
