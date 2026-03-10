import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuthPayload } from "@/lib/server/auth/auth";

export async function POST(request: NextRequest) {
  const payload = await getAuthPayload(request);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { folderId, tagId } = await request.json();

    if (!folderId || !tagId) {
      return NextResponse.json(
        { error: "folderId and tagId required" },
        { status: 400 },
      );
    }

    const existing = await prisma.folderTag.findUnique({
      where: {
        folderId_tagId: {
          folderId,
          tagId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Tag already attached" },
        { status: 409 },
      );
    }

    const tagCount = await prisma.folderTag.count({
      where: { folderId },
    });

    if (tagCount >= 3) {
      return NextResponse.json(
        { error: "Maximum 3 tags per folder" },
        { status: 400 },
      );
    }

    const folderTag = await prisma.folderTag.create({
      data: {
        folderId,
        tagId,
      },
    });

    return NextResponse.json({ folderTag });
  } catch (error: unknown) {
    console.error("Failed to attach folder tag:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {

  const payload = await getAuthPayload(request);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { folderId, tagId } = await request.json();

    await prisma.folderTag.delete({
      where: {
        folderId_tagId: {
          folderId,
          tagId,
        },
      },
    });

    return NextResponse.json({ message: "Tag removed" });
  } catch (error: unknown) {
    console.error("Failed to remove folder tag:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
