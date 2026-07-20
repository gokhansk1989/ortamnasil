import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";
import { hashCode } from "@/lib/email";

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const { userId, code } = await req.json();

    if (!userId || !code || typeof code !== "string") {
      return NextResponse.json({ error: "Kullanıcı ID ve kod gerekli" }, { status: 400 });
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Kod 6 haneli olmalı" }, { status: 400 });
    }

    const verification = await prisma.emailVerification.findUnique({
      where: { userId },
    });

    if (!verification) {
      return NextResponse.json({ error: "Doğrulama kaydı bulunamadı" }, { status: 404 });
    }

    if (verification.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Çok fazla deneme. Yeni kod iste." }, { status: 429 });
    }

    if (new Date() > verification.expiresAt) {
      return NextResponse.json({ error: "Kodun süresi dolmuş. Yeni kod iste." }, { status: 410 });
    }

    const codeMatches = hashCode(code) === verification.codeHash;

    if (!codeMatches) {
      await prisma.emailVerification.update({
        where: { userId },
        data: { attempts: { increment: 1 } },
      });
      const remaining = MAX_ATTEMPTS - verification.attempts - 1;
      return NextResponse.json({
        error: `Kod hatalı. ${remaining} deneme hakkın kaldı.`,
      }, { status: 401 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true },
      }),
      prisma.emailVerification.delete({
        where: { userId },
      }),
    ]);

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const res = NextResponse.json({
      id: userId,
      nick: user?.nick,
      message: "E-posta doğrulandı!",
    });

    setSessionCookie(res, userId);
    return res;
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
