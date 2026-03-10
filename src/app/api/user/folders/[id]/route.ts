import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { getAuthPayload } from "@/lib/server/auth/auth";
import {
  collectDescendantFolderIds,
  deleteFolderTreePermanently,
} from "@/lib/server/trash";

const updateFolderSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  parentId: z.uuid().nullable().optional(),
});

export async function GET(
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
        deletedAt: null,
      },
      include: {
        children: {
          where: { deletedAt: null },
          orderBy: { name: "asc" },
        },
        files: {
          where: { deletedAt: null },
          orderBy: { filename: "asc" },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json({ folder });
  } catch (error: unknown) {
    console.error("Error fetching folder:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const payload = await getAuthPayload(request);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateFolderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.format() },
        { status: 400 },
      );
    }

    // Check if the folder exists and belongs to the user
    const existingFolder = await prisma.folder.findFirst({
      where: { id, userId: payload.sub, deletedAt: null },
    });

    if (!existingFolder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const { name, parentId } = parsed.data;

    // Optional: check parent folder if moving
    if (parentId !== undefined && parentId !== null) {
      if (parentId === id) {
        return NextResponse.json(
          { error: "Cannot move folder into itself" },
          { status: 400 },
        );
      }
      const newParent = await prisma.folder.findFirst({
        where: { id: parentId, userId: payload.sub, deletedAt: null },
      });
      if (!newParent) {
        return NextResponse.json(
          { error: "Parent folder not found" },
          { status: 404 },
        );
      }
    }

    const updatedFolder = await prisma.folder.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(parentId !== undefined && { parentId }),
      },
    });

    return NextResponse.json({ folder: updatedFolder });
  } catch (error: unknown) {
    console.error("Error updating folder:", error);
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
    const existingFolder = await prisma.folder.findFirst({
      where: { id, userId: payload.sub },
    });

    if (!existingFolder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    if (existingFolder.deletedAt) {
      const folderIds = await collectDescendantFolderIds(prisma, id, payload.sub);

      await prisma.$transaction((tx) =>
        deleteFolderTreePermanently(tx, folderIds, payload.sub),
      );

      return NextResponse.json({
        message: "Folder permanently deleted",
      });
    }

    const deletedFolder = await prisma.folder.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      message: "Folder moved to trash",
      folder: deletedFolder,
    });
  } catch (error: unknown) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
