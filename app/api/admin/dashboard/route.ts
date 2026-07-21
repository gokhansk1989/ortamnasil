import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminCookie } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!verifyAdminCookie(req.cookies.get("ortam_admin")?.value)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    pendingReports,
    dormCount,
    kykCount,
    ozelCount,
    cityCount,
    todayReviews,
    weeklyUsers,
    reviewCount,
    redCount,
    lightDist,
    recentReports,
  ] = await Promise.all([
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.dorm.count(),
    prisma.dorm.count({ where: { type: "KYK" } }),
    prisma.dorm.count({ where: { type: "PRIVATE" } }),
    prisma.dorm.groupBy({ by: ["city"], _count: true }).then((r) => r.length),
    prisma.review.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.review.count({ where: { status: "APPROVED" } }),
    prisma.survey.count({ where: { light: "RED" } }),
    prisma.survey.groupBy({ by: ["light"], _count: true }),
    prisma.report.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        review: { include: { dorm: { select: { name: true } } } },
        reporter: { select: { nick: true } },
      },
    }),
  ]);

  const totalSurveys = lightDist.reduce((s, d) => s + d._count, 0);
  const distribution = ["GREEN", "YELLOW", "ORANGE", "RED", "GRAY"].map((light) => {
    const found = lightDist.find((d) => d.light === light);
    const count = found?._count ?? 0;
    const pct = totalSurveys > 0 ? Math.round((count / totalSurveys) * 100) : 0;
    return { light: light.toLowerCase(), count, pct };
  });

  const queue = recentReports.map((r) => ({
    id: r.id,
    reason: r.reason,
    reviewText: r.review.text,
    dormName: r.review.dorm.name,
    reporterNick: r.reporter.nick,
    reviewAuthorId: r.review.userId,
    reviewId: r.reviewId,
    createdAt: r.createdAt.toISOString(),
  }));

  return NextResponse.json({
    kpis: {
      pendingReports,
      dormCount,
      kykCount,
      ozelCount,
      cityCount,
      todayReviews,
      weeklyUsers,
      reviewCount,
      redCount,
    },
    distribution,
    queue,
  });
}
