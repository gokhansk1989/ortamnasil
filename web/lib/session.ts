import { createHmac, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.SESSION_SECRET!;
if (!process.env.SESSION_SECRET) throw new Error("SESSION_SECRET environment variable is required");

function sign(userId: string): string {
  const sig = createHmac("sha256", SECRET).update(userId).digest("hex");
  return `${userId}.${sig}`;
}

function verify(token: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const userId = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", SECRET).update(userId).digest("hex");
  if (sig.length !== expected.length) return null;
  let match = true;
  for (let i = 0; i < sig.length; i++) {
    if (sig[i] !== expected[i]) match = false;
  }
  return match ? userId : null;
}

export function setSessionCookie(res: NextResponse, userId: string): void {
  res.cookies.set("session", sign(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export function getSessionUserId(req: NextRequest): string | null {
  const cookie = req.cookies.get("session")?.value;
  if (!cookie) return null;
  return verify(cookie);
}

export function generateAdminSession(): string {
  return randomBytes(32).toString("hex");
}
