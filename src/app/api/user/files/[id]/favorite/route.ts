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
    const file = await prisma.file.findFirst({
      where: { id, userId: payload.sub, deletedAt: null },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const updated = await prisma.file.update({
      where: { id },
      data: { isFavorite: true },
    });

    return NextResponse.json({ file: updated });
  } catch (error: any) {
    console.error("Error favoriting file:", error);
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
    const file = await prisma.file.findFirst({
      where: { id, userId: payload.sub, deletedAt: null },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const updated = await prisma.file.update({
      where: { id },
      data: { isFavorite: false },
    });

    return NextResponse.json({ file: updated });
  } catch (error: any) {
    console.error("Error unfavoriting file:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
