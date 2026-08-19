import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminCookie } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminCookie(req.cookies.get("ortam_admin")?.value)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      nick: true,
      emailVerified: true,
      frozen: true,
      frozenAt: true,
      createdAt: true,
      surveys: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          light: true,
          ratio: true,
          comment: true,
          createdAt: true,
          dorm: { select: { name: true, city: true } },
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          title: true,
          text: true,
          status: true,
          light: true,
          createdAt: true,
          dorm: { select: { name: true, city: true } },
        },
      },
      _count: { select: { surveys: true, reviews: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  return NextResponse.json({
    ...user,
    frozenAt: user.frozenAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    surveys: user.surveys.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
    })),
    reviews: user.reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}
