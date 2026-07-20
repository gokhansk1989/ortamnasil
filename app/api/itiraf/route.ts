import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { moderateText } from "@/lib/moderation";
import type { Light, Relation } from "@prisma/client";

const VALID_RELATIONS: Relation[] = ["CURRENT_RESIDENT", "FORMER_RESIDENT", "SHORT_STAY", "VISITED"];
const PERIOD_RE = /^\d{4}-\d{4} (Güz|Bahar)$/;

export async function POST(req: NextRequest) {
  const userId = getSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  try {
    const { dormId, title, text, relation, period } = await req.json();

    if (!dormId || !title || !text || !relation) {
      return NextResponse.json({ error: "Tüm alanlar gerekli" }, { status: 400 });
    }

    if (title.length < 5 || title.length > 100) {
      return NextResponse.json({ error: "Başlık 5-100 karakter olmalı" }, { status: 400 });
    }

    if (text.length < 40 || text.length > 600) {
      return NextResponse.json({ error: "İtiraf 40-600 karakter olmalı" }, { status: 400 });
    }

    const titleMod = moderateText(title);
    if (!titleMod.ok) {
      return NextResponse.json({ error: `Başlık: ${titleMod.reason}` }, { status: 422 });
    }
    const textMod = moderateText(text);
    if (!textMod.ok) {
      return NextResponse.json({ error: textMod.reason }, { status: 422 });
    }

    if (!VALID_RELATIONS.includes(relation)) {
      return NextResponse.json({ error: "Geçersiz ilişki tipi" }, { status: 400 });
    }

    const dorm = await prisma.dorm.findUnique({ where: { id: dormId } });
    if (!dorm) {
      return NextResponse.json({ error: "Yurt bulunamadı" }, { status: 404 });
    }

    const survey = await prisma.survey.findUnique({
      where: { dormId_userId: { dormId, userId } },
    });

    const review = await prisma.review.create({
      data: {
        dormId,
        userId,
        title,
        text,
        relation: relation as Relation,
        light: survey?.light || ("GRAY" as Light),
        period: typeof period === "string" && PERIOD_RE.test(period) ? period : null,
      },
    });

    return NextResponse.json({
      reviewId: review.id,
      recordNo: review.recordNo,
      message: "İtiraf kaydedildi",
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
