import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminCookie } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  if (!verifyAdminCookie(req.cookies.get("ortam_admin")?.value)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const { userId, freeze } = await req.json();

    if (!userId || typeof freeze !== "boolean") {
      return NextResponse.json({ error: "userId ve freeze gerekli" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        frozen: freeze,
        frozenAt: freeze ? new Date() : null,
      },
    });

    return NextResponse.json({
      message: freeze ? "Hesap donduruldu" : "Hesap aktifleştirildi",
      frozen: freeze,
    });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
