import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashCode } from "@/lib/email";
import { signAdmin } from "@/lib/admin-auth";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN!;
if (!process.env.ADMIN_TOKEN) throw new Error("ADMIN_TOKEN environment variable is required");

const COOKIE_NAME = "ortam_admin";
const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  try {
    const { otpId, code } = await request.json();

    if (!otpId || !code || typeof code !== "string") {
      return NextResponse.json({ error: "OTP ID ve kod gerekli" }, { status: 400 });
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Kod 6 haneli olmalı" }, { status: 400 });
    }

    const otp = await prisma.adminOtp.findUnique({ where: { id: otpId } });

    if (!otp) {
      return NextResponse.json({ error: "Doğrulama kaydı bulunamadı" }, { status: 404 });
    }

    if (otp.attempts >= MAX_ATTEMPTS) {
      await prisma.adminOtp.delete({ where: { id: otpId } });
      return NextResponse.json({ error: "Çok fazla deneme. Tekrar giriş yap." }, { status: 429 });
    }

    if (new Date() > otp.expiresAt) {
      await prisma.adminOtp.delete({ where: { id: otpId } });
      return NextResponse.json({ error: "Kodun süresi dolmuş. Tekrar giriş yap." }, { status: 410 });
    }

    if (hashCode(code) !== otp.codeHash) {
      await prisma.adminOtp.update({
        where: { id: otpId },
        data: { attempts: { increment: 1 } },
      });
      const remaining = MAX_ATTEMPTS - otp.attempts - 1;
      return NextResponse.json({
        error: `Kod hatalı. ${remaining} deneme hakkın kaldı.`,
      }, { status: 401 });
    }

    await prisma.adminOtp.delete({ where: { id: otpId } });

    const response = NextResponse.json({ ok: true, message: "Admin girişi başarılı" });
    response.cookies.set(COOKIE_NAME, signAdmin(ADMIN_TOKEN), {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
