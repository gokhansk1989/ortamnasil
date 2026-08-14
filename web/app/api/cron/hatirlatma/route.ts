import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import webpush from "web-push";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY!;

const MESSAGES = [
  {
    day: 7,
    title: "Yurdunu nasıl buldun?",
    body: "9 soruluk anonim anketimiz 2 dakikanı alır. Bir sonraki öğrenciye yol göster!",
  },
  {
    day: 14,
    title: "9 soru, 2 dakika, tamamen anonim",
    body: "Sadece evet/hayır de, biz ışığı yakacağız. Kimliğin asla paylaşılmaz.",
  },
];

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return NextResponse.json({ error: "VAPID keys missing" }, { status: 500 });
  }

  webpush.setVapidDetails(
    "mailto:noreply@ortamnasil.com",
    VAPID_PUBLIC,
    VAPID_PRIVATE,
  );

  const now = new Date();
  let totalSent = 0;

  for (const msg of MESSAGES) {
    const reminderIndex = msg.day === 7 ? 0 : 1;
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - msg.day);
    const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: dayStart, lt: dayEnd },
        remindersSent: reminderIndex,
        surveys: { none: {} },
      },
      include: {
        pushSubscriptions: true,
      },
    });

    for (const user of users) {
      for (const sub of user.pushSubscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            JSON.stringify({
              title: msg.title,
              body: msg.body,
              url: "https://www.ortamnasil.com/anket",
            }),
          );
          totalSent++;
        } catch (err: any) {
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
          }
        }
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { remindersSent: reminderIndex + 1 },
      });
    }
  }

  return NextResponse.json({ sent: totalSent });
}
