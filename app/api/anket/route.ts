import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { ratioOf, lightFromRatio, dormLight } from "@/lib/lights";
import { moderateText } from "@/lib/moderation";
import type { Answer } from "@/lib/lights";
import type { Light } from "@prisma/client";

const PERIOD_RE = /^\d{4}-\d{4} (Güz|Bahar)$/;
const QUESTION_COUNT = 9;

function toLightEnum(key: string): Light {
  return key.toUpperCase() as Light;
}

export async function POST(req: NextRequest) {
  const userId = getSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  try {
    const { dormId, answers, period, comment } = await req.json();

    if (!dormId || !Array.isArray(answers)) {
      return NextResponse.json({ error: "dormId ve answers gerekli" }, { status: 400 });
    }

    if (answers.length > QUESTION_COUNT) {
      return NextResponse.json({ error: "Geçersiz cevap sayısı" }, { status: 400 });
    }

    if (typeof period === "string" && !PERIOD_RE.test(period)) {
      return NextResponse.json({ error: "Geçersiz dönem formatı" }, { status: 400 });
    }

    if (typeof comment === "string" && comment.trim().length > 0) {
      if (comment.trim().length < 15) {
        return NextResponse.json({ error: "Yorum en az 15 karakter olmalı" }, { status: 400 });
      }
      if (comment.length > 500) {
        return NextResponse.json({ error: "Yorum en fazla 500 karakter olabilir" }, { status: 400 });
      }
      const mod = moderateText(comment);
      if (!mod.ok) {
        return NextResponse.json({ error: mod.reason }, { status: 422 });
      }
    }

    const dorm = await prisma.dorm.findUnique({ where: { id: dormId } });
    if (!dorm) {
      return NextResponse.json({ error: "Yurt bulunamadı" }, { status: 404 });
    }

    const existing = await prisma.survey.findUnique({
      where: { dormId_userId: { dormId, userId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Bu yurt için zaten anket doldurmuşsun" }, { status: 409 });
    }

    const typedAnswers: Answer[] = answers.slice(0, QUESTION_COUNT).map((a: number | null) =>
      a === 1 ? 1 : a === 0 ? 0 : null,
    );
    const counted = typedAnswers.filter((v): v is 0 | 1 => v !== null);
    const ratio = ratioOf(typedAnswers);
    const light = lightFromRatio(ratio);

    const survey = await prisma.survey.create({
      data: {
        dormId,
        userId,
        answers: counted,
        ratio,
        light: toLightEnum(light),
        period: typeof period === "string" && PERIOD_RE.test(period) ? period : null,
        comment: typeof comment === "string" && comment.trim().length >= 15 ? comment.trim() : null,
      },
    });

    const allSurveys = await prisma.survey.findMany({
      where: { dormId },
      select: { ratio: true },
    });
    const newLight = dormLight(allSurveys.map((s) => s.ratio));

    await prisma.dorm.update({
      where: { id: dormId },
      data: { light: toLightEnum(newLight) },
    });

    return NextResponse.json({
      surveyId: survey.id,
      light,
      ratio,
      dormLight: newLight,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
