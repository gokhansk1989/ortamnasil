import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

const EMOJIS = ["🦔", "🦉", "🦩", "🐧", "🦊", "🐻", "🦁", "🐸", "🐙", "🦄"];
const COLORS = ["#e8f3f0", "#fdf3e4", "#fcebe8", "#e8edf3", "#f3e8f1", "#e8f3e8"];
const RELATION_LABELS: Record<string, string> = {
  CURRENT_RESIDENT: "Şu an kalıyor",
  FORMER_RESIDENT: "Eskiden kaldı",
  SHORT_STAY: "Kısa süre kaldı",
  VISITED: "Gezip gördü",
};

const LIGHT_LABELS: Record<string, string> = {
  GREEN: "Tavsiye ediyor",
  YELLOW: "Ortalama buluyor",
  ORANGE: "Dikkatli ol diyor",
  RED: "Uzak dur diyor",
  GRAY: "Anket doldurdu",
};

const LIGHT_FALLBACK_TEXT: Record<string, string> = {
  GREEN: "Bu yurdu tavsiye ediyor.",
  YELLOW: "Bu yurdu ortalama buluyor.",
  ORANGE: "Bu yurt için dikkatli ol diyor.",
  RED: "Bu yurttan uzak dur diyor.",
  GRAY: "Anket doldurdu.",
};

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const dormId = url.searchParams.get("dormId");
  if (!dormId) {
    return NextResponse.json({ error: "dormId gerekli" }, { status: 400 });
  }

  const skip = Math.max(0, parseInt(url.searchParams.get("skip") || "0", 10) || 0);
  const take = Math.min(20, Math.max(1, parseInt(url.searchParams.get("take") || "10", 10) || 10));
  const sort = url.searchParams.get("sort") === "helpful" ? "helpful" : "new";

  const userId = getSessionUserId(req);

  const maxFetch = skip + take + 20;
  const [reviews, surveys, reviewTotal, surveyTotal] = await Promise.all([
    prisma.review.findMany({
      where: { dormId, status: "APPROVED" },
      orderBy: sort === "helpful"
        ? [{ helpfulCount: "desc" as const }, { createdAt: "desc" as const }]
        : [{ createdAt: "desc" as const }],
      take: maxFetch,
      include: { user: { select: { nick: true } } },
    }),
    prisma.survey.findMany({
      where: { dormId },
      orderBy: sort === "helpful"
        ? [{ helpfulCount: "desc" as const }, { createdAt: "desc" as const }]
        : [{ createdAt: "desc" as const }],
      take: maxFetch,
      include: { user: { select: { nick: true } } },
    }),
    prisma.review.count({ where: { dormId, status: "APPROVED" } }),
    prisma.survey.count({ where: { dormId } }),
  ]);

  const reviewIds = reviews.map((r) => r.id);
  const surveyIds = surveys.map((s) => s.id);
  let votedReviewIds = new Set<string>();
  let agreedReviewIds = new Set<string>();
  let votedSurveyIds = new Set<string>();
  let agreedSurveyIds = new Set<string>();
  if (userId) {
    const queries: Promise<any>[] = [];
    if (reviewIds.length > 0) {
      queries.push(
        prisma.vote.findMany({ where: { userId, reviewId: { in: reviewIds } }, select: { reviewId: true } }),
        prisma.agree.findMany({ where: { userId, reviewId: { in: reviewIds } }, select: { reviewId: true } }),
      );
    } else {
      queries.push(Promise.resolve([]), Promise.resolve([]));
    }
    if (surveyIds.length > 0) {
      queries.push(
        prisma.vote.findMany({ where: { userId, surveyId: { in: surveyIds } }, select: { surveyId: true } }),
        prisma.agree.findMany({ where: { userId, surveyId: { in: surveyIds } }, select: { surveyId: true } }),
      );
    } else {
      queries.push(Promise.resolve([]), Promise.resolve([]));
    }
    const [rVotes, rAgrees, sVotes, sAgrees] = await Promise.all(queries);
    votedReviewIds = new Set(rVotes.map((v: any) => v.reviewId));
    agreedReviewIds = new Set(rAgrees.map((a: any) => a.reviewId));
    votedSurveyIds = new Set(sVotes.map((v: any) => v.surveyId));
    agreedSurveyIds = new Set(sAgrees.map((a: any) => a.surveyId));
  }

  type UnifiedItem = {
    id: string;
    author: string;
    emoji: string;
    avBg: string;
    role: string;
    when: string;
    light: string;
    up: number;
    same: number;
    text: string;
    type: "review" | "survey";
    voted: boolean;
    agreed: boolean;
  };

  const reviewItems: UnifiedItem[] = reviews.map((r) => ({
    id: r.id,
    author: r.user.nick,
    emoji: "",
    avBg: "",
    role: RELATION_LABELS[r.relation] || r.relation,
    when: formatTimeAgo(r.createdAt),
    light: r.light.toLowerCase(),
    up: r.helpfulCount,
    same: r.sameCount,
    text: r.text,
    type: "review" as const,
    voted: votedReviewIds.has(r.id),
    agreed: agreedReviewIds.has(r.id),
    _date: r.createdAt,
  }));

  const surveyItems: UnifiedItem[] = surveys.map((s) => ({
    id: s.id,
    author: s.user.nick,
    emoji: "",
    avBg: "",
    role: LIGHT_LABELS[s.light] || "Anket doldurdu",
    when: formatTimeAgo(s.createdAt),
    light: s.light.toLowerCase(),
    up: s.helpfulCount,
    same: s.sameCount,
    text: s.comment || LIGHT_FALLBACK_TEXT[s.light] || "Anket doldurdu.",
    type: "survey" as const,
    voted: votedSurveyIds.has(s.id),
    agreed: agreedSurveyIds.has(s.id),
    _date: s.createdAt,
  }));

  const all = [...reviewItems, ...surveyItems];

  if (sort === "helpful") {
    all.sort((a, b) => b.up - a.up || (b as any)._date - (a as any)._date);
  } else {
    all.sort((a, b) => (b as any)._date - (a as any)._date);
  }

  const total = reviewTotal + surveyTotal;
  const paged = all.slice(skip, skip + take).map((item, i) => ({
    ...item,
    emoji: EMOJIS[(skip + i) % EMOJIS.length],
    avBg: COLORS[(skip + i) % COLORS.length],
    _date: undefined,
  }));

  return NextResponse.json({ items: paged, total, hasMore: skip + take < total });
}

function formatTimeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "az önce";
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "dün";
  if (days < 7) return `${days} gün önce`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} hafta önce`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ay önce`;
  return `${Math.floor(months / 12)} yıl önce`;
}
