import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma, type TransactionClient } from "@/lib/server/prisma";
import { getAuthPayload } from "@/lib/server/auth/auth";
import { deleteFilePermanently } from "@/lib/server/trash";

const updateFileSchema = z.object({
  filename: z.string().min(1).max(255).optional(),
  folderId: z.string().uuid().nullable().optional(),
});

function hasErrorCode(
  error: unknown,
): error is {
  code?: string;
} {
  return typeof error === "object" && error !== null && "code" in error;
}

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
    const file = await prisma.file.findFirst({
      where: {
        id,
        userId: payload.sub,
      },
      include: {
        blob: true,
        folder: true,
        tags: { include: { tag: true } },
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return NextResponse.json({ file });
  } catch (error: unknown) {
    console.error("Error fetching file:", error);
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
    const existingFile = await prisma.file.findFirst({
      where: { id, userId: payload.sub, deletedAt: null },
    });

    if (!existingFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateFileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { filename, folderId } = parsed.data;

    // Check new folder if moving
    if (folderId !== undefined && folderId !== null) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId: payload.sub, deletedAt: null },
      });
      if (!folder) {
        return NextResponse.json(
          { error: "Destination folder not found" },
          { status: 404 },
        );
      }
    }

    const updatedFile = await prisma.file.update({
      where: { id },
      data: {
        ...(filename && { filename }),
        ...(folderId !== undefined && { folderId }),
      },
      include: { blob: true },
    });

    return NextResponse.json({ file: updatedFile });
  } catch (error: unknown) {
    if (hasErrorCode(error) && error.code === "P2002") {
      return NextResponse.json(
        {
          error:
            "A file with this name already exists in the destination folder",
        },
        { status: 409 },
      );
    }
    console.error("Error updating file:", error);
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
    const existingFile = await prisma.file.findFirst({
      where: { id, userId: payload.sub },
    });

    if (!existingFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (existingFile.deletedAt) {
      await prisma.$transaction((tx: TransactionClient) =>
        deleteFilePermanently(tx, {
          id,
          blobId: existingFile.blobId,
        }),
      );

      return NextResponse.json({ message: "File permanently deleted" });
    } else {
      // Soft delete -> move to trash
      const trashed = await prisma.file.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return NextResponse.json({
        message: "File moved to trash",
        file: trashed,
      });
    }
  } catch (error: unknown) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
