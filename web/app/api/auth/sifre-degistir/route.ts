import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";
import bcrypt from "bcryptjs";

const AUTH_PEPPER = process.env.AUTH_PEPPER!;
if (!process.env.AUTH_PEPPER) throw new Error("AUTH_PEPPER is required");

function hashEmail(email: string): string {
  return createHmac("sha256", AUTH_PEPPER).update(email.toLowerCase().trim()).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { email, currentPassword, newPassword } = await req.json();

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json({ error: "Tüm alanlar gerekli" }, { status: 400 });
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json({ error: "Yeni şifre en az 6 karakter olmalı" }, { status: 400 });
    }

    const emailHash = hashEmail(email);
    const credential = await prisma.authCredential.findUnique({
      where: { emailHash },
    });

    if (!credential) {
      await bcrypt.hash("dummy", 12);
      return NextResponse.json({ error: "Geçersiz istek" }, { status: 401 });
    }

    const valid = await bcrypt.compare(currentPassword, credential.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Mevcut şifre hatalı" }, { status: 401 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.authCredential.update({
      where: { id: credential.id },
      data: { passwordHash, mustChangePassword: false },
    });

    return NextResponse.json({ message: "Şifren başarıyla güncellendi" });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
