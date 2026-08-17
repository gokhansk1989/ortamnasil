import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminCookie } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const LIGHT_LABELS: Record<string, string> = {
  GREEN: "Tavsiye ediyor",
  YELLOW: "Ortalama buluyor",
  ORANGE: "Dikkatli ol diyor",
  RED: "Uzak dur diyor",
  GRAY: "Anket doldurdu",
};

export async function GET(req: NextRequest) {
  if (!verifyAdminCookie(req.cookies.get("ortam_admin")?.value)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const surveys = await prisma.survey.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      dorm: { select: { name: true, city: true } },
      user: { select: { nick: true } },
    },
  });

  return NextResponse.json({
    items: surveys.map((s) => ({
      id: s.id,
      nick: s.user.nick,
      dormName: s.dorm.name,
      dormCity: s.dorm.city,
      light: s.light,
      lightLabel: LIGHT_LABELS[s.light] || "Anket doldurdu",
      comment: s.comment,
      period: s.period,
      answers: s.answers,
      ratio: s.ratio,
      helpfulCount: s.helpfulCount,
      sameCount: s.sameCount,
      createdAt: s.createdAt.toISOString(),
    })),
    total: await prisma.survey.count(),
  });
}

export async function DELETE(req: NextRequest) {
  if (!verifyAdminCookie(req.cookies.get("ortam_admin")?.value)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { surveyId } = await req.json();
  if (!surveyId) {
    return NextResponse.json({ error: "surveyId gerekli" }, { status: 400 });
  }

  await prisma.survey.delete({ where: { id: surveyId } });

  return NextResponse.json({ ok: true });
}
