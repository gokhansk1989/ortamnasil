import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createHmac } from "crypto";
import { verifyAdminCookie } from "@/lib/admin-auth";
import { generateTempPassword, sendTempPasswordEmail } from "@/lib/email";

const AUTH_PEPPER = process.env.AUTH_PEPPER!;

export async function POST(req: NextRequest) {
  if (!verifyAdminCookie(req.cookies.get("ortam_admin")?.value)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const { userId, email } = await req.json();

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId gerekli" }, { status: 400 });
    }

    const credential = await prisma.authCredential.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!credential) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    const tempPassword = generateTempPassword();
    const hash = await bcrypt.hash(tempPassword, 12);

    await prisma.authCredential.update({
      where: { userId },
      data: { passwordHash: hash, mustChangePassword: true },
    });

    let emailSent = false;

    if (email && typeof email === "string") {
      const normalizedEmail = email.toLowerCase().trim();
      const emailHash = createHmac("sha256", AUTH_PEPPER)
        .update(normalizedEmail)
        .digest("hex");

      if (emailHash === credential.emailHash) {
        await sendTempPasswordEmail(normalizedEmail, tempPassword);
        emailSent = true;
      } else {
        return NextResponse.json({
          error: "Girilen e-posta bu kullanıcıyla eşleşmiyor",
        }, { status: 400 });
      }
    }

    return NextResponse.json({
      message: emailSent ? "Şifre sıfırlandı ve e-posta gönderildi" : "Şifre sıfırlandı",
      nick: credential.user.nick,
      tempPassword,
      emailSent,
    });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
