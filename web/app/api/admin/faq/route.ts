import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminCookie } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!verifyAdminCookie(req.cookies.get("ortam_admin")?.value)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const items = await prisma.faqItem.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  if (!verifyAdminCookie(req.cookies.get("ortam_admin")?.value)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await req.json();
  const { question, answer, category, sortOrder } = body;

  if (!question?.trim() || !answer?.trim()) {
    return NextResponse.json({ error: "Soru ve cevap zorunludur" }, { status: 400 });
  }

  const item = await prisma.faqItem.create({
    data: {
      question: question.trim(),
      answer: answer.trim(),
      category: category || "platform",
      sortOrder: sortOrder ?? 0,
      published: true,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
