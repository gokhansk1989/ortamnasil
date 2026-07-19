import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { DormType, DormGender } from "@prisma/client";

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("session")?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  try {
    const { name, type, city, gender, blurb, website, mapsUrl } = await req.json();

    if (!name || !type || !city) {
      return NextResponse.json({ error: "Yurt adı, tipi ve şehri gerekli" }, { status: 400 });
    }

    if (name.length < 3 || name.length > 100) {
      return NextResponse.json({ error: "Yurt adı 3-100 karakter olmalı" }, { status: 400 });
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
        type: (type as DormType) || "PRIVATE",
        gender: (gender as DormGender) || "MIXED",
        city,
        blurb: blurb || null,
        website: website || null,
        mapsUrl: mapsUrl || null,
        creatorId: sessionId,
      },
    });

    const badge = await prisma.badge.findUnique({ where: { slug: "kurdele-kesen" } });
    if (badge) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: sessionId, badgeId: badge.id } },
        update: { count: { increment: 1 } },
        create: { userId: sessionId, badgeId: badge.id },
      });
    }

    return NextResponse.json({
      id: dorm.id,
      recordNo: dorm.recordNo,
      message: "Yurt eklendi, kurdeleyi kestin! 🎀",
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
