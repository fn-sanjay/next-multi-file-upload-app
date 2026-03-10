import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuthPayload } from "@/lib/server/auth/auth";
import { uploadInitSchema } from "@/lib/validations/upload";

export async function POST(req: NextRequest) {
  const payload = await getAuthPayload(req);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = uploadInitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(parsed.error, { status: 400 });
  }

  const { filename, size, hash, folderId, relativePath } = parsed.data;

  let actualFolderId = folderId || null;

  if (relativePath) {
    const parts = relativePath.split("/");
    if (parts.length > 1) {
      parts.pop(); // remove filename
      for (const part of parts) {
        if (!part) continue;

        let folder = await prisma.folder.findFirst({
          where: {
            name: part,
            parentId: actualFolderId,
            userId: payload.sub,
            deletedAt: null,
          },
        });

        if (!folder) {
          folder = await prisma.folder.create({
            data: {
              name: part,
              parentId: actualFolderId,
              userId: payload.sub,
            },
          });
        }
        actualFolderId = folder.id;
      }
    }
  }

  // 1. Check for filename conflict in the same folder (only if different content)
  const existingFile = await prisma.file.findFirst({
    where: {
      userId: payload.sub,
      folderId: actualFolderId,
      filename: filename,
    },
    include: { blob: true },
  });

  if (existingFile) {
    // If a file with the same name exists, treat as deduplicated
    return NextResponse.json({
      deduplicated: true,
      blobId: existingFile.blob.id,
      file: existingFile,
    });
  }

  // check dedup
  const existingBlob = await prisma.fileBlob.findUnique({
    where: { hash },
  });

  if (existingBlob) {
    // If deduplicated, skip chunking. We must actively create the file record and increment the reference.
    const fileRecord = await prisma.$transaction(async (tx) => {
      const newFile = await tx.file.create({
        data: {
          filename,
          blobId: existingBlob.id,
          userId: payload.sub,
          folderId: actualFolderId,
        },
      });

      await tx.fileBlob.update({
        where: { id: existingBlob.id },
        data: { refCount: { increment: 1 } },
      });

      return newFile;
    });

    return NextResponse.json({
      deduplicated: true,
      blobId: existingBlob.id,
      file: fileRecord,
    });
  }

  const session = await prisma.uploadSession.create({
    data: {
      filename,
      size,
      hash,
      userId: payload.sub,
      folderId: actualFolderId,
    },
  });

  return NextResponse.json({
    uploadId: session.id,
    chunkSize: 1 * 1024 * 1024, // 1MB
  });
}
