import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const ADMIN_SESSION_NAME = "admin_session";

export async function POST(req: NextRequest) {
  const adminSession = req.cookies.get(ADMIN_SESSION_NAME)?.value;
  if (!adminSession) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const { userId } = await req.json();

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

    const tempPassword = randomBytes(4).toString("hex");
    const hash = await bcrypt.hash(tempPassword, 12);

    await prisma.authCredential.update({
      where: { userId },
      data: { passwordHash: hash },
    });

    return NextResponse.json({
      message: "Şifre sıfırlandı",
      nick: credential.user.nick,
      tempPassword,
    });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
