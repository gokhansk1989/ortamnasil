import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function GET(req: NextRequest) {
  const userId = getSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ hasSurvey: false });
  }

  const dormId = req.nextUrl.searchParams.get("dormId");
  if (!dormId) {
    return NextResponse.json({ hasSurvey: false });
  }

  const survey = await prisma.survey.findUnique({
    where: { dormId_userId: { dormId, userId } },
    select: { id: true, light: true },
  });

  return NextResponse.json({ hasSurvey: !!survey, light: survey?.light || null });
}
