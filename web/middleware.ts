import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE = "ortam_admin";

async function hmacSha256(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyAdminCookie(cookieValue: string | undefined): Promise<boolean> {
  const secret = process.env.SESSION_SECRET;
  if (!cookieValue || !secret) return false;
  const expected = await hmacSha256(secret, "ortamnasil-admin-verified");
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
    // GA4 ve Meta Pikseli harici betikten yüklenir; alan adları izinli olmazsa
    // ölçüm hiçbir hata vermeden sessizce durur.
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://www.google-analytics.com https://*.google-analytics.com https://www.facebook.com",
    "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://www.facebook.com https://connect.facebook.net",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};

const RATE_WINDOW_MS = 60_000;
// Hedef kitle yurt/kampüs ağlarında: yüzlerce öğrenci tek dış IP arkasından
// çıkıyor. Sınır çok dar olursa kampanya anında meşru kullanıcılar birbirini
// engelliyor. Tek bir kötü niyetli betik bunun kat kat üzerine çıkacağı için
// koruma anlamlı kalıyor. Admin girişi ayrıca 5/5dk ile sınırlı.
const RATE_MAX = 100;
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

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

export async function middleware(request: NextRequest) {
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
      if (await verifyAdminCookie(cookie)) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return addHeaders(NextResponse.next());
    }

    if (!(await verifyAdminCookie(cookie))) {
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
