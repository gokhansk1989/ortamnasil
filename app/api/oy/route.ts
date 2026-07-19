import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("session")?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  try {
    const { reviewId } = await req.json();

    if (!reviewId) {
      return NextResponse.json({ error: "reviewId gerekli" }, { status: 400 });
    }

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return NextResponse.json({ error: "İtiraf bulunamadı" }, { status: 404 });
    }

    const existing = await prisma.vote.findUnique({
      where: { userId_reviewId: { userId: sessionId, reviewId } },
    });

    if (existing) {
      await prisma.vote.delete({
        where: { userId_reviewId: { userId: sessionId, reviewId } },
      });
      await prisma.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { decrement: 1 } },
      });
      return NextResponse.json({ voted: false, message: "Oy geri alındı" });
    }

    await prisma.vote.create({
      data: { userId: sessionId, reviewId },
    });
    await prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount: { increment: 1 } },
    });

    return NextResponse.json({ voted: true, message: "Oy verildi" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
