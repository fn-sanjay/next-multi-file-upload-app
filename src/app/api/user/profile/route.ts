import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { getAuthPayload } from "@/lib/server/auth/auth";

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100),
  bio: z.string().max(500).optional().default(""),
  avatarUrl: z.string().url().or(z.string().startsWith("data:image/")).optional(),
});

export async function PATCH(request: NextRequest) {
  const payload = await getAuthPayload(request);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateProfileSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: payload.sub },
      data: {
        name: parsed.name,
        bio: parsed.bio,
        profileImage: parsed.avatarUrl ?? undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        role: true,
        profileImage: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Profile update error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
