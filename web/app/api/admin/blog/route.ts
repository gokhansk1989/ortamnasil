import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminCookie } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!verifyAdminCookie(req.cookies.get("ortam_admin")?.value)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items: posts });
}

export async function POST(req: NextRequest) {
  if (!verifyAdminCookie(req.cookies.get("ortam_admin")?.value)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await req.json();
  const { title, slug, excerpt, content, category, readTime, published } = body;

  if (!title?.trim() || !slug?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Başlık, slug ve içerik zorunludur" }, { status: 400 });
  }

  const safeSlug = slug
    .trim()
    .toLocaleLowerCase("tr")
    .replace(/[^a-z0-9ğüşıöç-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const existing = await prisma.blogPost.findUnique({ where: { slug: safeSlug } });
  if (existing) {
    return NextResponse.json({ error: "Bu slug zaten kullanımda" }, { status: 409 });
  }

  const post = await prisma.blogPost.create({
    data: {
      title: title.trim(),
      slug: safeSlug,
      excerpt: (excerpt || "").trim(),
      content: content.trim(),
      category: category || "rehber",
      readTime: readTime || "5 dk",
      published: !!published,
      publishedAt: published ? new Date() : null,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
