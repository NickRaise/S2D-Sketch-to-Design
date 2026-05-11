import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/dashboard"];
const AUTH_ONLY = ["/auth"];

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  if (PROTECTED.some((p) => pathname.startsWith(p)) && !token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (AUTH_ONLY.some((p) => pathname.startsWith(p)) && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth"],
};
