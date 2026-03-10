import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { assertCsrf } from "@/lib/server/auth/csrf";
import { clearAuthCookies } from "@/lib/server/auth/cookies";
import { hashOpaqueToken } from "@/lib/server/auth/tokens";

export async function POST(request: NextRequest) {
  if (!assertCsrf(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const refreshToken = request.cookies.get("refresh_token")?.value;
  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: {
        tokenHash: await hashOpaqueToken(refreshToken),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
