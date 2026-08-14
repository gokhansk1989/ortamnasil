import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminCookie } from "@/lib/admin-auth";
import type { DormType, DormGender } from "@prisma/client";

export const dynamic = "force-dynamic";

const VALID_TYPES: DormType[] = ["PRIVATE", "KYK", "APART"];
const VALID_GENDERS: DormGender[] = ["MALE", "FEMALE", "MIXED"];

export async function GET(req: NextRequest) {
  if (!verifyAdminCookie(req.cookies.get("ortam_admin")?.value)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const dorms = await prisma.dorm.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { surveys: true, reviews: true } },
      creator: { select: { nick: true } },
    },
  });

  const items = dorms.map((d) => ({
    id: d.id,
    recordNo: d.recordNo,
    name: d.name,
    type: d.type,
    gender: d.gender,
    city: d.city,
    district: d.district,
    light: d.light.toLowerCase(),
    nearCampus: d.nearCampus,
    website: d.website,
    mapsUrl: d.mapsUrl,
    blurb: d.blurb,
    surveyCount: d._count.surveys,
    reviewCount: d._count.reviews,
    creatorNick: d.creator.nick,
    createdAt: d.createdAt.toISOString(),
  }));

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  if (!verifyAdminCookie(req.cookies.get("ortam_admin")?.value)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const { name, type, gender, city, district, website, mapsUrl, blurb, nearCampus } = await req.json();

    if (!name || !type || !city) {
      return NextResponse.json({ error: "Ad, tip ve şehir gerekli" }, { status: 400 });
    }
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Geçersiz tip" }, { status: 400 });
    }
    if (gender && !VALID_GENDERS.includes(gender)) {
      return NextResponse.json({ error: "Geçersiz cinsiyet" }, { status: 400 });
    }

    const slug = name
      .toLocaleLowerCase("tr")
      .replace(/ş/g, "s").replace(/ç/g, "c").replace(/ğ/g, "g")
      .replace(/ü/g, "u").replace(/ö/g, "o").replace(/ı/g, "i")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existing = await prisma.dorm.findUnique({ where: { id: slug } });
    if (existing) {
      return NextResponse.json({ error: "Bu isimde yurt zaten var" }, { status: 409 });
    }

    const adminUser = await prisma.user.findUnique({ where: { nick: "Admin" } });
    if (!adminUser) {
      return NextResponse.json({ error: "Admin kullanıcısı bulunamadı" }, { status: 500 });
    }

    const dorm = await prisma.dorm.create({
      data: {
        id: slug,
        name,
        type: type as DormType,
        gender: (gender as DormGender) || "MIXED",
        city,
        district: district || null,
        website: website || null,
        mapsUrl: mapsUrl || null,
        blurb: blurb || null,
        nearCampus: nearCampus || null,
        creatorId: adminUser.id,
      },
    });

    return NextResponse.json({ id: dorm.id, recordNo: dorm.recordNo }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
