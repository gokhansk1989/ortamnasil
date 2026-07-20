import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import type { ReportReason } from "@prisma/client";

const VALID_REASONS: ReportReason[] = ["NAME_DISCLOSURE", "PROFANITY", "SPAM"];

export async function POST(req: NextRequest) {
  const userId = getSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  try {
    const { reviewId, reason } = await req.json();

    if (!reviewId || !reason) {
      return NextResponse.json({ error: "reviewId ve reason gerekli" }, { status: 400 });
    }

    if (typeof reviewId !== "string" || typeof reason !== "string") {
      return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
    }

    if (!VALID_REASONS.includes(reason as ReportReason)) {
      return NextResponse.json({ error: "Geçersiz bildirim sebebi" }, { status: 400 });
    }

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return NextResponse.json({ error: "İtiraf bulunamadı" }, { status: 404 });
    }

    const existing = await prisma.report.findUnique({
      where: { reviewId_reporterId: { reviewId, reporterId: userId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Bu itirafı zaten bildirmişsin" }, { status: 409 });
    }

    await prisma.report.create({
      data: {
        reviewId,
        reporterId: userId,
        reason: reason as ReportReason,
      },
    });

    return NextResponse.json({ message: "Bildirim alındı, incelenecek" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
