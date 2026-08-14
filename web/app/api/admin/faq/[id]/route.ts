import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminCookie } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminCookie(req.cookies.get("ortam_admin")?.value)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await req.json();
  const { question, answer, category, sortOrder, published } = body;

  const data: Record<string, unknown> = {};
  if (question !== undefined) data.question = question.trim();
  if (answer !== undefined) data.answer = answer.trim();
  if (category !== undefined) data.category = category;
  if (sortOrder !== undefined) data.sortOrder = sortOrder;
  if (published !== undefined) data.published = !!published;

  const updated = await prisma.faqItem.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminCookie(req.cookies.get("ortam_admin")?.value)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  await prisma.faqItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
