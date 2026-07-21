import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const dormId = url.searchParams.get("dormId");
  if (!dormId) {
    return NextResponse.json({ error: "dormId gerekli" }, { status: 400 });
  }

  const skip = Math.max(0, parseInt(url.searchParams.get("skip") || "0", 10) || 0);
  const take = Math.min(20, Math.max(1, parseInt(url.searchParams.get("take") || "10", 10) || 10));
  const sort = url.searchParams.get("sort") === "helpful" ? "helpful" : "new";

  const orderBy =
    sort === "helpful"
      ? [{ helpfulCount: "desc" as const }, { createdAt: "desc" as const }]
      : [{ createdAt: "desc" as const }];

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { dormId, status: "APPROVED" },
      orderBy,
      skip,
      take,
      include: { user: { select: { nick: true } } },
    }),
    prisma.review.count({ where: { dormId, status: "APPROVED" } }),
  ]);

  const EMOJIS = ["🦔", "🦉", "🦩", "🐧", "🦊", "🐻", "🦁", "🐸", "🐙", "🦄"];
  const COLORS = ["#e8f3f0", "#fdf3e4", "#fcebe8", "#e8edf3", "#f3e8f1", "#e8f3e8"];
  const RELATION_LABELS: Record<string, string> = {
    CURRENT_RESIDENT: "Şu an kalıyor",
    FORMER_RESIDENT: "Eskiden kaldı",
    SHORT_STAY: "Kısa süre kaldı",
    VISITED: "Gezip gördü",
  };

  const items = reviews.map((r, i) => ({
    id: r.id,
    author: r.user.nick,
    emoji: EMOJIS[(skip + i) % EMOJIS.length],
    avBg: COLORS[(skip + i) % COLORS.length],
    role: RELATION_LABELS[r.relation] || r.relation,
    when: formatTimeAgo(r.createdAt),
    light: r.light.toLowerCase(),
    up: r.helpfulCount,
    same: r.sameCount,
    text: r.text,
  }));

  return NextResponse.json({ items, total, hasMore: skip + take < total });
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
