import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuthPayload } from "@/lib/server/auth/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const payload = await getAuthPayload(request);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const folder = await prisma.folder.findFirst({
      where: {
        id,
        userId: payload.sub,
        deletedAt: { not: null },
      },
    });

    if (!folder) {
      return NextResponse.json(
        { error: "Trashed folder not found" },
        { status: 404 },
      );
    }

    const restored = await prisma.folder.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });

    return NextResponse.json({
      message: "Folder restored",
      folder: restored,
    });
  } catch (error) {
    console.error("Restore folder error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}   