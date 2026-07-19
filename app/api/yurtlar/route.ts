import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || undefined;
  const city = searchParams.get("city") || undefined;
  const gender = searchParams.get("gender") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  const where: Record<string, unknown> = {};
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { city: { contains: query, mode: "insensitive" } },
    ];
  }
  if (type) where.type = type;
  if (city) where.city = city;
  if (gender) where.gender = gender;

  const [dorms, total] = await Promise.all([
    prisma.dorm.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: "asc" },
      include: {
        _count: { select: { surveys: true, reviews: true } },
      },
    }),
    prisma.dorm.count({ where }),
  ]);

  return NextResponse.json({
    dorms: dorms.map((d) => ({
      id: d.id,
      name: d.name,
      city: d.city,
      district: d.district,
      type: d.type,
      gender: d.gender,
      light: d.light.toLowerCase(),
      blurb: d.blurb,
      surveyCount: d._count.surveys,
      reviewCount: d._count.reviews,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
