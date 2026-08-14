import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminCookie } from "@/lib/admin-auth";
import type { DormType, DormGender } from "@prisma/client";

const VALID_TYPES: DormType[] = ["PRIVATE", "KYK", "APART"];
const VALID_GENDERS: DormGender[] = ["MALE", "FEMALE", "MIXED"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!verifyAdminCookie(req.cookies.get("ortam_admin")?.value)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, type, gender, city, district, website, mapsUrl, blurb, nearCampus } = body;

    const dorm = await prisma.dorm.findUnique({ where: { id: params.id } });
    if (!dorm) {
      return NextResponse.json({ error: "Yurt bulunamadı" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (type !== undefined) {
      if (!VALID_TYPES.includes(type)) {
        return NextResponse.json({ error: "Geçersiz tip" }, { status: 400 });
      }
      data.type = type;
    }
    if (gender !== undefined) {
      if (!VALID_GENDERS.includes(gender)) {
        return NextResponse.json({ error: "Geçersiz cinsiyet" }, { status: 400 });
      }
      data.gender = gender;
    }
    if (city !== undefined) data.city = city;
    if (district !== undefined) data.district = district || null;
    if (website !== undefined) data.website = website || null;
    if (mapsUrl !== undefined) data.mapsUrl = mapsUrl || null;
    if (blurb !== undefined) data.blurb = blurb || null;
    if (nearCampus !== undefined) data.nearCampus = nearCampus || null;

    const updated = await prisma.dorm.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ id: updated.id, name: updated.name });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!verifyAdminCookie(req.cookies.get("ortam_admin")?.value)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const dorm = await prisma.dorm.findUnique({ where: { id: params.id } });
    if (!dorm) {
      return NextResponse.json({ error: "Yurt bulunamadı" }, { status: 404 });
    }

    await prisma.dorm.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Yurt silindi" });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
