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
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000);

  const [
    pendingReports,
    pendingReviews,
    dormCount,
    kykCount,
    ozelCount,
    cityCount,
    todayReviews,
    weeklyUsers,
    reviewCount,
    surveyCount,
    redCount,
    lightDist,
    recentReports,
    recentPendingReviews,
    todaySurveys,
    yesterdaySurveys,
    todayUsers,
    yesterdayUsers,
    lastWeekUsers,
    thisWeekSurveys,
    lastWeekSurveys,
    recentSurveyActivity,
    recentUserActivity,
    dailySurveys,
    dailyUsers,
  ] = await Promise.all([
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.dorm.count(),
    prisma.dorm.count({ where: { type: "KYK" } }),
    prisma.dorm.count({ where: { type: "PRIVATE" } }),
    prisma.dorm.groupBy({ by: ["city"], _count: true }).then((r) => r.length),
    prisma.review.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.review.count({ where: { status: "APPROVED" } }),
    prisma.survey.count(),
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
    prisma.review.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        dorm: { select: { name: true, city: true } },
        user: { select: { nick: true } },
      },
    }),
    prisma.survey.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.survey.count({ where: { createdAt: { gte: yesterdayStart, lt: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: yesterdayStart, lt: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
    prisma.survey.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.survey.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
    prisma.survey.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        id: true,
        light: true,
        createdAt: true,
        user: { select: { nick: true } },
        dorm: { select: { name: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      select: { id: true, nick: true, emailVerified: true, createdAt: true },
    }),
    prisma.$queryRaw<{ d: string; c: bigint }[]>`
      SELECT DATE("createdAt") as d, COUNT(*)::bigint as c
      FROM "Survey"
      WHERE "createdAt" >= ${new Date(now.getTime() - 30 * 86400000)}
      GROUP BY DATE("createdAt")
      ORDER BY d`,
    prisma.$queryRaw<{ d: string; c: bigint }[]>`
      SELECT DATE("createdAt") as d, COUNT(*)::bigint as c
      FROM "User"
      WHERE "createdAt" >= ${new Date(now.getTime() - 30 * 86400000)}
      GROUP BY DATE("createdAt")
      ORDER BY d`,
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

  const activity = [
    ...recentSurveyActivity.map((s) => ({
      type: "survey" as const,
      nick: s.user.nick,
      detail: s.dorm.name,
      light: s.light,
      createdAt: s.createdAt.toISOString(),
    })),
    ...recentUserActivity.map((u) => ({
      type: "user" as const,
      nick: u.nick,
      detail: u.emailVerified ? "Doğrulanmış" : "Doğrulanmamış",
      light: null,
      createdAt: u.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  const last30 = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(todayStart.getTime() - (29 - i) * 86400000);
    const key = date.toISOString().slice(0, 10);
    const surveyRow = dailySurveys.find((r) => String(r.d).slice(0, 10) === key);
    const userRow = dailyUsers.find((r) => String(r.d).slice(0, 10) === key);
    return {
      date: key,
      surveys: surveyRow ? Number(surveyRow.c) : 0,
      users: userRow ? Number(userRow.c) : 0,
    };
  });

  return NextResponse.json({
    kpis: {
      pendingReports,
      pendingReviews,
      dormCount,
      kykCount,
      ozelCount,
      cityCount,
      todayReviews,
      weeklyUsers,
      reviewCount,
      surveyCount,
      redCount,
    },
    trends: {
      todaySurveys,
      yesterdaySurveys,
      todayUsers,
      yesterdayUsers,
      thisWeekSurveys,
      lastWeekSurveys,
      thisWeekUsers: weeklyUsers,
      lastWeekUsers,
    },
    distribution,
    queue,
    pendingReviewQueue: recentPendingReviews.map((r) => ({
      id: r.id,
      title: r.title,
      text: r.text,
      light: r.light,
      nick: r.user.nick,
      dormName: r.dorm.name,
      dormCity: r.dorm.city,
      createdAt: r.createdAt.toISOString(),
    })),
    activity,
    chartData: last30,
  });
}
