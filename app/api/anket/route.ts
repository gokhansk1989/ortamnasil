import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ratioOf, lightFromRatio, dormLight } from "@/lib/lights";
import type { Answer } from "@/lib/lights";
import type { Light } from "@prisma/client";

function toLightEnum(key: string): Light {
  return key.toUpperCase() as Light;
}

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("session")?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  try {
    const { dormId, answers } = await req.json();

    if (!dormId || !Array.isArray(answers)) {
      return NextResponse.json({ error: "dormId ve answers gerekli" }, { status: 400 });
    }

    const dorm = await prisma.dorm.findUnique({ where: { id: dormId } });
    if (!dorm) {
      return NextResponse.json({ error: "Yurt bulunamadı" }, { status: 404 });
    }

    const existing = await prisma.survey.findUnique({
      where: { dormId_userId: { dormId, userId: sessionId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Bu yurt için zaten anket doldurmuşsun" }, { status: 409 });
    }

    const typedAnswers: Answer[] = answers.map((a: number | null) =>
      a === 1 ? 1 : a === 0 ? 0 : null,
    );
    const counted = typedAnswers.filter((v): v is 0 | 1 => v !== null);
    const ratio = ratioOf(typedAnswers);
    const light = lightFromRatio(ratio);

    const survey = await prisma.survey.create({
      data: {
        dormId,
        userId: sessionId,
        answers: counted,
        ratio,
        light: toLightEnum(light),
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
