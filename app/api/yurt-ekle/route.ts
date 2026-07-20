import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { moderateText } from "@/lib/moderation";
import type { DormType, DormGender } from "@prisma/client";

const VALID_TYPES: DormType[] = ["PRIVATE", "KYK", "APART"];
const VALID_GENDERS: DormGender[] = ["MALE", "FEMALE", "MIXED"];

export async function POST(req: NextRequest) {
  const userId = getSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  try {
    const { name, type, city, district, gender, blurb, website, mapsUrl } = await req.json();

    if (!name || !type || !city) {
      return NextResponse.json({ error: "Yurt adı, tipi ve şehri gerekli" }, { status: 400 });
    }

    if (typeof name !== "string" || name.length < 3 || name.length > 100) {
      return NextResponse.json({ error: "Yurt adı 3-100 karakter olmalı" }, { status: 400 });
    }

    if (!VALID_TYPES.includes(type as DormType)) {
      return NextResponse.json({ error: "Geçersiz yurt tipi" }, { status: 400 });
    }

    if (gender && !VALID_GENDERS.includes(gender as DormGender)) {
      return NextResponse.json({ error: "Geçersiz cinsiyet tipi" }, { status: 400 });
    }

    const nameMod = moderateText(name);
    if (!nameMod.ok) {
      return NextResponse.json({ error: `Yurt adı: ${nameMod.reason}` }, { status: 422 });
    }

    if (typeof blurb === "string" && blurb.trim().length > 0) {
      if (blurb.length > 300) {
        return NextResponse.json({ error: "Açıklama en fazla 300 karakter olabilir" }, { status: 400 });
      }
      const blurbMod = moderateText(blurb);
      if (!blurbMod.ok) {
        return NextResponse.json({ error: `Açıklama: ${blurbMod.reason}` }, { status: 422 });
      }
    }

    if (typeof website === "string" && website.trim().length > 0) {
      if (!website.startsWith("https://")) {
        return NextResponse.json({ error: "Website URL'si https:// ile başlamalı" }, { status: 400 });
      }
    }

    if (typeof mapsUrl === "string" && mapsUrl.trim().length > 0) {
      if (!mapsUrl.startsWith("https://")) {
        return NextResponse.json({ error: "Harita URL'si https:// ile başlamalı" }, { status: 400 });
      }
    }

    const slug = name
      .toLocaleLowerCase("tr")
      .replace(/ş/g, "s").replace(/ç/g, "c").replace(/ğ/g, "g")
      .replace(/ü/g, "u").replace(/ö/g, "o").replace(/ı/g, "i")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existing = await prisma.dorm.findUnique({ where: { id: slug } });
    if (existing) {
      return NextResponse.json({ error: "Benzer isimli yurt zaten var" }, { status: 409 });
    }

    const dorm = await prisma.dorm.create({
      data: {
        id: slug,
        name,
        type: type as DormType,
        gender: (gender as DormGender) || "MIXED",
        city,
        district: typeof district === "string" ? district : null,
        blurb: typeof blurb === "string" && blurb.trim().length > 0 ? blurb.trim() : null,
        website: typeof website === "string" && website.startsWith("https://") ? website : null,
        mapsUrl: typeof mapsUrl === "string" && mapsUrl.startsWith("https://") ? mapsUrl : null,
        creatorId: userId,
      },
    });

    const badge = await prisma.badge.findUnique({ where: { slug: "kurdele-kesen" } });
    if (badge) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId, badgeId: badge.id } },
        update: { count: { increment: 1 } },
        create: { userId, badgeId: badge.id },
      });
    }

    return NextResponse.json({
      id: dorm.id,
      recordNo: dorm.recordNo,
      message: "Yurt eklendi, kurdeleyi kestin!",
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
