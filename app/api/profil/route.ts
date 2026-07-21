import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function GET(req: NextRequest) {
  const userId = getSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      badges: { include: { badge: true } },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        include: { dorm: { select: { name: true, id: true } } },
      },
      surveys: {
        where: { light: "RED" },
        select: { id: true },
      },
      _count: { select: { dorms: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  const totalHelpful = user.reviews.reduce((sum, r) => sum + r.helpfulCount, 0);

  return NextResponse.json({
    nick: user.nick,
    badges: user.badges.map((ub) => ({
      slug: ub.badge.slug,
      label: ub.badge.label,
      emoji: ub.badge.emoji,
      count: ub.count,
    })),
    stats: {
      reviews: user.reviews.length,
      dormsAdded: user._count.dorms,
      totalHelpful,
      redLights: user.surveys.length,
    },
    reviews: user.reviews.map((r) => ({
      id: r.id,
      dormName: r.dorm.name,
      dormId: r.dorm.id,
      light: r.light.toLowerCase(),
      createdAt: r.createdAt.toISOString(),
      helpfulCount: r.helpfulCount,
    })),
  });
}
