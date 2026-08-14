import { createHmac } from "crypto";

const ADMIN_MARKER = "ortamnasil-admin-verified";

export function signAdmin(): string {
  const secret = process.env.SESSION_SECRET!;
  return createHmac("sha256", secret).update(ADMIN_MARKER).digest("hex");
}

export function verifyAdminCookie(cookieValue: string | undefined): boolean {
  const secret = process.env.SESSION_SECRET;
  if (!cookieValue || !secret) return false;
  const expected = createHmac("sha256", secret).update(ADMIN_MARKER).digest("hex");
  if (cookieValue.length !== expected.length) return false;
  let match = true;
  for (let i = 0; i < cookieValue.length; i++) {
    if (cookieValue[i] !== expected[i]) match = false;
  }
  return match;
}
