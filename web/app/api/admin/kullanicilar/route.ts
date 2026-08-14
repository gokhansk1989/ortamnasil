import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminCookie } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!verifyAdminCookie(req.cookies.get("ortam_admin")?.value)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { surveys: true, reviews: true } },
      credential: { select: { mustChangePassword: true } },
    },
  });

  const items = users.map((u) => ({
    id: u.id,
    nick: u.nick,
    emailVerified: u.emailVerified,
    frozen: u.frozen,
    frozenAt: u.frozenAt?.toISOString() || null,
    surveyCount: u._count.surveys,
    reviewCount: u._count.reviews,
    mustChangePassword: u.credential?.mustChangePassword || false,
    createdAt: u.createdAt.toISOString(),
  }));

  return NextResponse.json({ items });
}
