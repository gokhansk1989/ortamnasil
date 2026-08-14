import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import type { ReportReason } from "@prisma/client";
import { notifyAdmin } from "@/lib/email";

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

    const REASON_LABELS: Record<string, string> = {
      NAME_DISCLOSURE: "İsim ifşası",
      PROFANITY: "Küfür / hakaret",
      SPAM: "Spam / anlamsız",
    };
    notifyAdmin("Yorum bildirildi", [
      { label: "Sebep", value: REASON_LABELS[reason] || reason },
      { label: "Yorum", value: review.text.slice(0, 100) + (review.text.length > 100 ? "…" : "") },
      { label: "Tarih", value: new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }) },
    ]);

    return NextResponse.json({ message: "Bildirim alındı, incelenecek" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
