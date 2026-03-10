import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { assertCsrf } from "@/lib/server/auth/csrf";
import { hashPassword } from "@/lib/server/auth/password";
import { hashOpaqueToken } from "@/lib/server/auth/tokens";

export async function POST(request: NextRequest) {
  if (!assertCsrf(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const token = body?.token;
  const newPassword = body?.newPassword;

  if (!token || !newPassword || newPassword.length < 8) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const tokenHash = await hashOpaqueToken(token);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!resetToken) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 },
    );
  }

  if (resetToken.usedAt) {
    return NextResponse.json({ error: "Token already used" }, { status: 400 });
  }

  if (resetToken.expiresAt <= new Date()) {
    return NextResponse.json({ error: "Token expired" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        password: hashPassword(newPassword),
        provider: "CREDENTIALS",
      },
    }),

    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),

    // revoke all sessions
    prisma.refreshToken.updateMany({
      where: {
        userId: resetToken.userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
