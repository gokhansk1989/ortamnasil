import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function POST(req: NextRequest) {
  const userId = getSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  try {
    const { reviewId, surveyId } = await req.json();
    const targetId = reviewId || surveyId;
    const isSurvey = !!surveyId && !reviewId;

    if (!targetId || typeof targetId !== "string") {
      return NextResponse.json({ error: "reviewId veya surveyId gerekli" }, { status: 400 });
    }

    if (isSurvey) {
      const survey = await prisma.survey.findUnique({ where: { id: surveyId } });
      if (!survey) {
        return NextResponse.json({ error: "Anket bulunamadı" }, { status: 404 });
      }

      const existing = await prisma.agree.findUnique({
        where: { userId_surveyId: { userId, surveyId } },
      });

      if (existing) {
        await prisma.$transaction([
          prisma.agree.delete({ where: { id: existing.id } }),
          prisma.survey.update({ where: { id: surveyId }, data: { sameCount: { decrement: 1 } } }),
        ]);
        return NextResponse.json({ agreed: false, message: "Geri alındı" });
      }

      await prisma.$transaction([
        prisma.agree.create({ data: { userId, surveyId } }),
        prisma.survey.update({ where: { id: surveyId }, data: { sameCount: { increment: 1 } } }),
      ]);
      return NextResponse.json({ agreed: true, message: "Kaydedildi" }, { status: 201 });
    }

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return NextResponse.json({ error: "İtiraf bulunamadı" }, { status: 404 });
    }

    const existing = await prisma.agree.findUnique({
      where: { userId_reviewId: { userId, reviewId } },
    });

    if (existing) {
      await prisma.$transaction([
        prisma.agree.delete({ where: { id: existing.id } }),
        prisma.review.update({ where: { id: reviewId }, data: { sameCount: { decrement: 1 } } }),
      ]);
      return NextResponse.json({ agreed: false, message: "Geri alındı" });
    }

    await prisma.$transaction([
      prisma.agree.create({ data: { userId, reviewId } }),
      prisma.review.update({ where: { id: reviewId }, data: { sameCount: { increment: 1 } } }),
    ]);

    return NextResponse.json({ agreed: true, message: "Kaydedildi" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
