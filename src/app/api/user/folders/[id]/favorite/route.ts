import { Prisma } from "@prisma/client";
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
      where: { id, userId: payload.sub, deletedAt: null },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const data: Prisma.FolderUpdateInput = { isFavorite: true };

    const updated = await prisma.folder.update({
      where: { id },
      data,
    });

    return NextResponse.json({ folder: updated });
  } catch (error: unknown) {
    console.error("Error adding folder to favorites:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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
      where: { id, userId: payload.sub, deletedAt: null },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const data: Prisma.FolderUpdateInput = { isFavorite: false };

    const updated = await prisma.folder.update({
      where: { id },
      data,
    });

    return NextResponse.json({ folder: updated });
  } catch (error: unknown) {
    console.error("Error removing folder from favorites:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
