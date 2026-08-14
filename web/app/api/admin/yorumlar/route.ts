import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminCookie } from "@/lib/admin-auth";
import { flagText } from "@/lib/moderation";
import type { ModerationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const VALID_STATUSES: ModerationStatus[] = ["PENDING", "APPROVED", "REMOVED"];

export async function GET(req: NextRequest) {
  if (!verifyAdminCookie(req.cookies.get("ortam_admin")?.value)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const statusParam = req.nextUrl.searchParams.get("status") || "PENDING";
  const status = VALID_STATUSES.includes(statusParam as ModerationStatus)
    ? (statusParam as ModerationStatus)
    : "PENDING";

  const reviews = await prisma.review.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      dorm: { select: { name: true, city: true } },
      user: { select: { nick: true } },
    },
  });

  const pendingCount = await prisma.review.count({ where: { status: "PENDING" } });

  return NextResponse.json({
    items: reviews.map((r) => ({
      id: r.id,
      recordNo: r.recordNo,
      title: r.title,
      text: r.text,
      light: r.light,
      relation: r.relation,
      period: r.period,
      status: r.status,
      dormName: r.dorm.name,
      dormCity: r.dorm.city,
      nick: r.user.nick,
      createdAt: r.createdAt.toISOString(),
      flags: flagText(`${r.title} ${r.text}`),
    })),
    pendingCount,
  });
}

export async function PATCH(req: NextRequest) {
  if (!verifyAdminCookie(req.cookies.get("ortam_admin")?.value)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { reviewId, action } = await req.json();

  if (!reviewId || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const newStatus: ModerationStatus = action === "approve" ? "APPROVED" : "REMOVED";

  await prisma.review.update({
    where: { id: reviewId },
    data: { status: newStatus },
  });

  return NextResponse.json({ ok: true, status: newStatus });
}
