import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const dorm = await prisma.dorm.findUnique({
    where: { id: params.id },
    include: {
      _count: { select: { surveys: true, reviews: true } },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { helpfulCount: "desc" },
        take: 20,
        include: {
          user: { select: { nick: true } },
          _count: { select: { votes: true } },
        },
      },
      surveys: {
        select: { ratio: true, light: true },
      },
    },
  });

  if (!dorm) {
    return NextResponse.json({ error: "Yurt bulunamadı" }, { status: 404 });
  }

  const validRatios = dorm.surveys.filter((s) => s.ratio !== null).map((s) => s.ratio!);
  const avgRatio = validRatios.length > 0
    ? validRatios.reduce((a, b) => a + b, 0) / validRatios.length
    : null;

  return NextResponse.json({
    id: dorm.id,
    name: dorm.name,
    city: dorm.city,
    district: dorm.district,
    type: dorm.type,
    gender: dorm.gender,
    light: dorm.light.toLowerCase(),
    blurb: dorm.blurb,
    mapsUrl: dorm.mapsUrl,
    website: dorm.website,
    recordNo: dorm.recordNo,
    surveyCount: dorm._count.surveys,
    reviewCount: dorm._count.reviews,
    avgRatio,
    reviews: dorm.reviews.map((r) => ({
      id: r.id,
      title: r.title,
      text: r.text,
      relation: r.relation,
      light: r.light.toLowerCase(),
      helpfulCount: r.helpfulCount,
      nick: r.user.nick,
      createdAt: r.createdAt,
    })),
  });
}
