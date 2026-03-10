import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { hashEmailToken } from "@/lib/server/auth/email-token";

export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const tokenHash = await hashEmailToken(token);

  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.expiresAt < new Date()) {
    if (record) {
      // Logic: if token expired and user not verified, delete user
      const user = await prisma.user.findUnique({
        where: { id: record.userId },
        select: { emailVerified: true },
      });

      if (user && !user.emailVerified) {
        await prisma.$transaction([
          prisma.user.delete({ where: { id: record.userId } }),
          prisma.emailVerificationToken.delete({ where: { tokenHash } }),
        ]);
        return NextResponse.json(
          {
            error:
              "Verification link expired and account deleted. Please sign up again.",
          },
          { status: 400 },
        );
      }
    }
    return NextResponse.json(
      { error: "Token expired or invalid" },
      { status: 400 },
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerificationToken.delete({
      where: { tokenHash },
    }),
  ]);

  return NextResponse.json({
    message: "Email verified successfully",
  });
}
