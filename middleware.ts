import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE = "ortam_admin";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "degistir-beni-gizli-anahtar";

const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 30;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

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

function cleanBuckets() {
  const now = Date.now();
  for (const [ip, bucket] of rateBuckets) {
    if (now > bucket.resetAt) rateBuckets.delete(ip);
  }
}

setInterval(cleanBuckets, RATE_WINDOW_MS);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Admin auth gate ---
  if (pathname.startsWith("/admin")) {
    const cookie = request.cookies.get(ADMIN_COOKIE)?.value;

    if (pathname === "/admin/giris") {
      if (request.method === "POST") {
        return NextResponse.next();
      }
      if (cookie === ADMIN_TOKEN) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return addHeaders(NextResponse.next(), request);
    }

    if (cookie !== ADMIN_TOKEN) {
      return NextResponse.redirect(new URL("/admin/giris", request.url));
    }
  }

  // --- Rate limiting for form submissions ---
  if (request.method === "POST" && pathname.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";

    if (isRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({ error: "Çok fazla istek. Biraz bekle." }),
        { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } },
      );
    }
  }

  return addHeaders(NextResponse.next(), request);
}

function addHeaders(response: NextResponse, _request: NextRequest): NextResponse {
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
