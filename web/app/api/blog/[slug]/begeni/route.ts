import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Blog okuyucularının çoğu arama motorundan gelir ve giriş yapmamıştır; beğeni
// için giriş zorunlu tutmak etkileşimi bitirirdi. Bu yüzden sayaç anonim:
// tekrar basmayı istemci tarafında localStorage engelliyor, kaba kullanıma karşı
// da middleware'deki IP bazlı istek sınırı devrede.
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const { action } = await req.json().catch(() => ({ action: "like" }));

  if (action !== "like" && action !== "unlike") {
    return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
  }

  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    select: { id: true, published: true, likeCount: true },
  });

  if (!post || !post.published) {
    return NextResponse.json({ error: "Yazı bulunamadı" }, { status: 404 });
  }

  // Sayaç negatife düşmesin.
  if (action === "unlike" && post.likeCount <= 0) {
    return NextResponse.json({ likeCount: 0 });
  }

  const updated = await prisma.blogPost.update({
    where: { id: post.id },
    data: { likeCount: { increment: action === "like" ? 1 : -1 } },
    select: { likeCount: true },
  });

  return NextResponse.json({ likeCount: updated.likeCount });
}
