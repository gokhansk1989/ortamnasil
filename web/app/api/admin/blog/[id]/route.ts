import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminCookie } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminCookie(req.cookies.get("ortam_admin")?.value)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await req.json();
  const { title, slug, excerpt, content, category, readTime, published } = body;

  const existing = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Yazı bulunamadı" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title.trim();
  if (excerpt !== undefined) data.excerpt = excerpt.trim();
  if (content !== undefined) data.content = content.trim();
  if (category !== undefined) data.category = category;
  if (readTime !== undefined) data.readTime = readTime;

  if (slug !== undefined && slug !== existing.slug) {
    const safeSlug = slug
      .trim()
      .toLocaleLowerCase("tr")
      .replace(/[^a-z0-9ğüşıöç-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const conflict = await prisma.blogPost.findUnique({ where: { slug: safeSlug } });
    if (conflict && conflict.id !== params.id) {
      return NextResponse.json({ error: "Bu slug zaten kullanımda" }, { status: 409 });
    }
    data.slug = safeSlug;
  }

  if (published !== undefined) {
    data.published = !!published;
    if (published && !existing.publishedAt) {
      data.publishedAt = new Date();
    }
    if (!published) {
      data.publishedAt = null;
    }
  }

  const updated = await prisma.blogPost.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminCookie(req.cookies.get("ortam_admin")?.value)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  await prisma.blogPost.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
