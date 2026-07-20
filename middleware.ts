import { NextResponse, type NextRequest } from "next/server";
import { createHmac } from "crypto";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const SESSION_SECRET = process.env.SESSION_SECRET;
const ADMIN_COOKIE = "ortam_admin";

function verifyAdminCookie(cookieValue: string | undefined): boolean {
  if (!cookieValue || !ADMIN_TOKEN || !SESSION_SECRET) return false;
  const expected = createHmac("sha256", SESSION_SECRET).update(ADMIN_TOKEN).digest("hex");
  if (cookieValue.length !== expected.length) return false;
  let match = true;
  for (let i = 0; i < cookieValue.length; i++) {
    if (cookieValue[i] !== expected[i]) match = false;
  }
  return match;
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 30;
const ADMIN_RATE_WINDOW_MS = 300_000;
const ADMIN_RATE_MAX = 5;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const adminRateBuckets = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);

  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  bucket.count++;
  return bucket.count > RATE_MAX;
}

function isAdminRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = adminRateBuckets.get(ip);

  if (!bucket || now > bucket.resetAt) {
    adminRateBuckets.set(ip, { count: 1, resetAt: now + ADMIN_RATE_WINDOW_MS });
    return false;
  }

  bucket.count++;
  return bucket.count > ADMIN_RATE_MAX;
}

function cleanBuckets() {
  const now = Date.now();
  for (const [ip, bucket] of rateBuckets) {
    if (now > bucket.resetAt) rateBuckets.delete(ip);
  }
  for (const [ip, bucket] of adminRateBuckets) {
    if (now > bucket.resetAt) adminRateBuckets.delete(ip);
  }
}

setInterval(cleanBuckets, RATE_WINDOW_MS);

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const cookie = request.cookies.get(ADMIN_COOKIE)?.value;

    if (pathname === "/admin/giris") {
      if (request.method === "POST") {
        const ip = getClientIp(request);
        if (isAdminRateLimited(ip)) {
          return new NextResponse(
            JSON.stringify({ error: "Çok fazla deneme. 5 dakika bekle." }),
            { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "300" } },
          );
        }
        return NextResponse.next();
      }
      if (verifyAdminCookie(cookie)) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return addHeaders(NextResponse.next());
    }

    if (!verifyAdminCookie(cookie)) {
      return NextResponse.redirect(new URL("/admin/giris", request.url));
    }
  }

  if (request.method === "POST" && pathname.startsWith("/api/")) {
    const ip = getClientIp(request);

    if (isRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({ error: "Çok fazla istek. Biraz bekle." }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } },
      );
    }
  }

  return addHeaders(NextResponse.next());
}

function addHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
