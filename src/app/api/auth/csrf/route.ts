import { NextResponse } from "next/server";
import { createCsrfToken, withCsrfCookie } from "@/lib/server/auth/csrf";

export async function GET() {
  const token = createCsrfToken();
  const response = NextResponse.json({ csrfToken: token });
  return withCsrfCookie(response, token);
}
