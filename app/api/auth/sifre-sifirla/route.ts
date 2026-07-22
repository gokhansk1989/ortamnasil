import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";
import { generateTempPassword, sendTempPasswordEmail } from "@/lib/email";
import bcrypt from "bcryptjs";

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
    });

    if (!credential) {
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json({
        message: "Eğer bu e-posta kayıtlıysa, geçici şifre gönderildi.",
      });
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    await prisma.authCredential.update({
      where: { id: credential.id },
      data: { passwordHash, mustChangePassword: true },
    });

    await sendTempPasswordEmail(email.toLowerCase().trim(), tempPassword);

    return NextResponse.json({
      message: "Eğer bu e-posta kayıtlıysa, geçici şifre gönderildi.",
    });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
