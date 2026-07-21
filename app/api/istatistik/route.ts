import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 300;

export async function GET() {
  const [reviewCount, redCount, recentActivity] = await Promise.all([
    prisma.review.count({ where: { status: "APPROVED" } }),
    prisma.survey.count({ where: { light: "RED" } }),
    prisma.survey.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
  ]);

  return NextResponse.json({
    reviewCount,
    redCount,
    recentActivity,
  });
}
