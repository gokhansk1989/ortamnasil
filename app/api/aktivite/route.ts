import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET() {
  const [recentReviews, recentSurveys] = await Promise.all([
    prisma.review.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        user: { select: { nick: true } },
        dorm: { select: { name: true, id: true, type: true } },
      },
    }),
    prisma.survey.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        user: { select: { nick: true } },
        dorm: { select: { name: true, id: true, type: true } },
      },
    }),
  ]);

  const ticker = [
    ...recentSurveys.map((s) => ({
      type: "survey" as const,
      nick: s.user.nick,
      dormName: s.dorm.name,
      dormId: s.dorm.id,
      light: s.light.toLowerCase(),
      createdAt: s.createdAt.toISOString(),
    })),
    ...recentReviews.map((r) => ({
      type: "review" as const,
      nick: r.user.nick,
      dormName: r.dorm.name,
      dormId: r.dorm.id,
      light: r.light.toLowerCase(),
      createdAt: r.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const featured = recentReviews.map((r) => ({
    id: r.dorm.id,
    dormName: r.dorm.name,
    dormType: r.dorm.type,
    light: r.light.toLowerCase(),
    quote: r.text.length > 60 ? r.text.slice(0, 57) + "..." : r.text,
    author: r.user.nick,
    createdAt: r.createdAt.toISOString(),
  }));

  return NextResponse.json({ ticker, featured });
}
