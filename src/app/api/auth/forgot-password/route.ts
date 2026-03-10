import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { assertCsrf } from "@/lib/server/auth/csrf";
import {
  newPasswordResetToken,
  hashOpaqueToken,
} from "@/lib/server/auth/tokens";
import { sendPasswordResetEmail } from "@/lib/server/auth/mail";

export async function POST(request: NextRequest) {
  try {
    if (!assertCsrf(request)) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 },
      );
    }

    const body = await request.json().catch(() => null);
    const email = body?.email?.trim()?.toLowerCase();

    if (!email) {
      return NextResponse.json({ success: true });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // prevent enumeration
      return NextResponse.json({ success: true });
    }

    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    const rawToken = newPasswordResetToken();
    const tokenHash = await hashOpaqueToken(rawToken);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    await sendPasswordResetEmail(user.email, rawToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);

    // never leak server errors
    return NextResponse.json({ success: true });
  }
}
