import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";

function hashEmail(email: string): string {
  const pepper = process.env.AUTH_PEPPER || "default-pepper";
  return createHmac("sha256", pepper).update(email.toLowerCase().trim()).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { nick, email } = await req.json();

    if (!nick || !email) {
      return NextResponse.json({ error: "Nick ve e-posta gerekli" }, { status: 400 });
    }

    const trimmedNick = nick.trim();
    if (trimmedNick.length < 3 || trimmedNick.length > 30) {
      return NextResponse.json({ error: "Nick 3-30 karakter olmalı" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Geçersiz e-posta" }, { status: 400 });
    }

    const existingNick = await prisma.user.findUnique({ where: { nick: trimmedNick } });
    if (existingNick) {
      return NextResponse.json({ error: "Bu takma ad zaten alınmış" }, { status: 409 });
    }

    const emailHash = hashEmail(email);
    const existingEmail = await prisma.authCredential.findUnique({ where: { emailHash } });
    if (existingEmail) {
      return NextResponse.json({ error: "Bu e-posta zaten kayıtlı" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        nick: trimmedNick,
        isAdult: true,
      },
    });

    await prisma.authCredential.create({
      data: {
        emailHash,
        userId: user.id,
      },
    });

    return NextResponse.json({
      id: user.id,
      nick: user.nick,
      message: "Kayıt başarılı",
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
