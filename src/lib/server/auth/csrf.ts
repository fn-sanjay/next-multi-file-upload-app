import { randomBytes, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const secure = process.env.NODE_ENV === "production";

export function createCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

export function withCsrfCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set("csrf_token", token, {
    httpOnly: false,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  return response;
}

export function assertCsrf(request: NextRequest): boolean {
  const cookieToken = request.cookies.get("csrf_token")?.value;
  const headerToken = request.headers.get("x-csrf-token");

  if (!cookieToken || !headerToken) return false;

  const a = Buffer.from(cookieToken);
  const b = Buffer.from(headerToken);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}
