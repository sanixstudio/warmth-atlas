import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Baseline security headers for all HTML/API responses (Mapbox remains script/style connect).
 */
export function middleware(request: NextRequest) {
  void request.nextUrl;
  const res = NextResponse.next();
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
