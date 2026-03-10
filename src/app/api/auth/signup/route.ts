import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { assertCsrf } from "@/lib/server/auth/csrf";
import { hashPassword } from "@/lib/server/auth/password";
import { newEmailToken, hashEmailToken } from "@/lib/server/auth/email-token";
import { sendEmailVerification } from "@/lib/server/auth/email";

export async function POST(request: NextRequest) {
  if (!assertCsrf(request)) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  const email = body?.email?.trim()?.toLowerCase();
  const password = body?.password;

  if (!email || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    include: { emailVerificationTokens: true },
  });

  if (existing) {
    if (!existing.emailVerified) {
      const latestToken = existing.emailVerificationTokens[0];
      if (latestToken && latestToken.expiresAt < new Date()) {
        // Delete user and tokens to allow re-signup
        await prisma.user.delete({ where: { id: existing.id } });
      } else {
        return NextResponse.json(
          {
            error:
              "Email already registered but not verified. Please check your email or wait for the link to expire.",
          },
          { status: 409 },
        );
      }
    } else {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }
  }

  const user = await prisma.user.create({
    data: {
      name: name || null,
      email,
      password: hashPassword(password),
      provider: "CREDENTIALS",
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  // create verification token
  const token = newEmailToken();
  const tokenHash = await hashEmailToken(token);

  await prisma.emailVerificationToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes
    },
  });

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  await sendEmailVerification(user.email, verifyUrl);

  return NextResponse.json(
    { message: "User created. Please verify your email." },
    { status: 201 },
  );
}
