import { createHmac } from "crypto";

export function signAdmin(token: string): string {
  const secret = process.env.SESSION_SECRET!;
  return createHmac("sha256", secret).update(token).digest("hex");
}

export function verifyAdminCookie(cookieValue: string | undefined): boolean {
  const token = process.env.ADMIN_TOKEN;
  const secret = process.env.SESSION_SECRET;
  if (!cookieValue || !token || !secret) return false;
  const expected = createHmac("sha256", secret).update(token).digest("hex");
  if (cookieValue.length !== expected.length) return false;
  let match = true;
  for (let i = 0; i < cookieValue.length; i++) {
    if (cookieValue[i] !== expected[i]) match = false;
  }
  return match;
}
