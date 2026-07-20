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
      _count: { select: { reviews: true, surveys: true, dorms: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    nick: user.nick,
    badges: user.badges.map((ub) => ({
      slug: ub.badge.slug,
      label: ub.badge.label,
      emoji: ub.badge.emoji,
      count: ub.count,
    })),
    stats: {
      reviews: user._count.reviews,
      surveys: user._count.surveys,
      dormsAdded: user._count.dorms,
    },
    createdAt: user.createdAt,
  });
}
