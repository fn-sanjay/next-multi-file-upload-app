import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { assertCsrf } from "@/lib/server/auth/csrf";
import {
  newRefreshToken,
  hashOpaqueToken,
  signAccessToken,
} from "@/lib/server/auth/tokens";
import { setAuthCookies, clearAuthCookies } from "@/lib/server/auth/cookies";

export async function POST(request: NextRequest) {
  if (!assertCsrf(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const currentRefreshToken = request.cookies.get("refresh_token")?.value;
  if (!currentRefreshToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tokenRow = await prisma.refreshToken.findUnique({
    where: { tokenHash: await hashOpaqueToken(currentRefreshToken) },
    include: { user: true },
  });

  if (!tokenRow || tokenRow.revokedAt || tokenRow.expiresAt <= new Date()) {
    const response = NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
    clearAuthCookies(response);
    return response;
  }

  const nextRefreshToken = newRefreshToken();
  const accessToken = await signAccessToken({
    sub: tokenRow.user.id,
    email: tokenRow.user.email,
    role: tokenRow.user.role,
  });

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: tokenRow.id },
      data: { revokedAt: new Date() },
    }),
    prisma.refreshToken.create({
      data: {
        tokenHash: await hashOpaqueToken(nextRefreshToken),
        userId: tokenRow.userId,
        userAgent: request.headers.get("user-agent"),
        ipAddress: request.headers.get("x-forwarded-for") ?? null,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  const response = NextResponse.json({ success: true });
  setAuthCookies(response, accessToken, nextRefreshToken);
  return response;
}
