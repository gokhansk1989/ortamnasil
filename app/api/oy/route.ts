import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function POST(req: NextRequest) {
  const userId = getSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  try {
    const { reviewId } = await req.json();

    if (!reviewId || typeof reviewId !== "string") {
      return NextResponse.json({ error: "reviewId gerekli" }, { status: 400 });
    }

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return NextResponse.json({ error: "İtiraf bulunamadı" }, { status: 404 });
    }

    const existing = await prisma.vote.findUnique({
      where: { userId_reviewId: { userId, reviewId } },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.vote.delete({ where: { userId_reviewId: { userId, reviewId } } }),
        prisma.review.update({ where: { id: reviewId }, data: { helpfulCount: { decrement: 1 } } }),
      ]);
      return NextResponse.json({ voted: false, message: "Oy geri alındı" });
    }

    await prisma.$transaction([
      prisma.vote.create({ data: { userId, reviewId } }),
      prisma.review.update({ where: { id: reviewId }, data: { helpfulCount: { increment: 1 } } }),
    ]);

    return NextResponse.json({ voted: true, message: "Oy verildi" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
