import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: { slug: string } },
) {
  await prisma.blogPost.updateMany({
    where: { slug: params.slug, published: true },
    data: { viewCount: { increment: 1 } },
  });

  return NextResponse.json({ ok: true });
}
