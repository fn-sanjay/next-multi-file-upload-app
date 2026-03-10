import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { assertCsrf } from "@/lib/server/auth/csrf";
import { verifyPassword } from "@/lib/server/auth/password";
import {
  newRefreshToken,
  hashOpaqueToken,
  signAccessToken,
} from "@/lib/server/auth/tokens";
import { setAuthCookies } from "@/lib/server/auth/cookies";

export async function POST(request: NextRequest) {
  // CSRF protection
  if (!assertCsrf(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const email = body?.email?.trim()?.toLowerCase();
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 🚫 Block password login for Google users
  if (user.provider === "GOOGLE") {
    return NextResponse.json(
      { error: "Use Google login for this account" },
      { status: 400 },
    );
  }

  // 🚫 Require email verification
  if (!user.emailVerified) {
    const verificationToken = await prisma.emailVerificationToken.findFirst({
      where: { userId: user.id },
      orderBy: { expiresAt: "desc" },
    });

    if (verificationToken && verificationToken.expiresAt < new Date()) {
      await prisma.user.delete({ where: { id: user.id } });
      return NextResponse.json(
        {
          error:
            "Verification period expired and account deleted. Please sign up again.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({ error: "Email not verified" }, { status: 403 });
  }

  // Password check
  if (!user.password || !verifyPassword(password, user.password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Create tokens
  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = newRefreshToken();

  await prisma.refreshToken.create({
    data: {
      tokenHash: await hashOpaqueToken(refreshToken),
      userId: user.id,
      userAgent: request.headers.get("user-agent"),
      ipAddress: request.headers.get("x-forwarded-for") ?? null,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  const response = NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

  setAuthCookies(response, accessToken, refreshToken);

  return response;
}
