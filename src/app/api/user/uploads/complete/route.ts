import { NextRequest, NextResponse } from "next/server";
import { prisma, type TransactionClient } from "@/lib/server/prisma";
import { getAuthPayload } from "@/lib/server/auth/auth";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import mime from "mime";

import crypto from "crypto";
import path from "path";

type UploadChunkRow = {
  partNumber: number;
};

export async function POST(req: NextRequest) {
  const payload = await getAuthPayload(req);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let uploadId: string;

  try {
    const body = await req.json();
    uploadId = body.uploadId;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!uploadId) {
    return NextResponse.json(
      { error: "uploadId is required" },
      { status: 400 },
    );
  }

  const session = await prisma.uploadSession.findFirst({
    where: {
      id: uploadId,
      userId: payload.sub,
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Upload not found" }, { status: 404 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        isReadOnly: true,
        isBanned: true,
        storageUsed: true,
        storageQuota: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.isBanned) {
      return NextResponse.json(
        { error: "Your account has been banned." },
        { status: 403 },
      );
    }

    if (user.isReadOnly) {
      return NextResponse.json(
        { error: "Your account is read-only." },
        { status: 403 },
      );
    }

    const usedBytes = BigInt(user.storageUsed ?? 0);
    const quotaBytes = BigInt(user.storageQuota ?? 0);
    const sessionBytes = BigInt(session.size ?? 0);

    if (usedBytes + sessionBytes > quotaBytes) {
      const chunks: UploadChunkRow[] = await prisma.uploadChunk.findMany({
        where: { uploadId },
        select: { partNumber: true },
      });

      const paths = chunks.map(
        (c) => `chunks/${uploadId}/${c.partNumber}`,
      );

      if (paths.length > 0) {
        await supabaseAdmin.storage.from("uploads").remove(paths);
      }

      await prisma.uploadChunk.deleteMany({ where: { uploadId } });
      await prisma.uploadSession.delete({ where: { id: uploadId } });

      return NextResponse.json(
        { error: "Storage limit exceeded." },
        { status: 403 },
      );
    }

    /* ------------------------- */
    /* 1️⃣ Fetch chunks */
    /* ------------------------- */

    const chunks: UploadChunkRow[] = await prisma.uploadChunk.findMany({
      where: { uploadId },
      orderBy: { partNumber: "asc" },
    });

    if (!chunks.length) {
      return NextResponse.json({ error: "No chunks found" }, { status: 400 });
    }

    /* ------------------------- */
    /* 2️⃣ Download chunks */
    /* ------------------------- */

    const buffers: Buffer[] = [];

    for (const chunk of chunks) {
      const chunkPath = `chunks/${uploadId}/${chunk.partNumber}`;

      const { data, error } = await supabaseAdmin.storage
        .from("uploads")
        .download(chunkPath);

      if (error || !data) {
        console.error("Chunk download failed:", chunkPath, error);
        return NextResponse.json(
          { error: "Failed to download chunk" },
          { status: 500 },
        );
      }

      const buffer = Buffer.from(await data.arrayBuffer());
      buffers.push(buffer);
    }

    /* ------------------------- */
    /* 3️⃣ Merge chunks */
    /* ------------------------- */

    const finalBuffer = Buffer.concat(buffers);

    /* ------------------------- */
    /* 4️⃣ Detect extension + mime */
    /* ------------------------- */

    const extension = path.extname(session.filename).replace(".", "");

    const mimeType =
      mime.getType(extension || "") || "application/octet-stream";

    /* ------------------------- */
    /* 5️⃣ Generate storage key */
    /* ------------------------- */

    const blobId = crypto.randomUUID();

    const storageKey = `files/${payload.sub}/${blobId}.${extension}`;

    /* ------------------------- */
    /* 6️⃣ Upload final file */
    /* ------------------------- */

    const { error: uploadError } = await supabaseAdmin.storage
      .from("uploads")
      .upload(storageKey, finalBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error(uploadError);
      return NextResponse.json(
        { error: "Failed to upload final file" },
        { status: 500 },
      );
    }

    /* ------------------------- */
    /* 7️⃣ Save DB records */
    /* ------------------------- */

    const file = await prisma.$transaction(async (tx: TransactionClient) => {
      const blob = await tx.fileBlob.create({
        data: {
          id: blobId,
          hash: session.hash,
          size: Number(session.size),
          mimeType: mimeType,
          extension,
          storageKey,
        },
      });

      const file = await tx.file.create({
        data: {
          filename: session.filename,
          blobId: blob.id,
          userId: payload.sub,
          folderId: session.folderId ?? null,
        },
      });

      await tx.user.update({
        where: { id: payload.sub },
        data: {
          storageUsed: { increment: Number(session.size) },
        },
      });

      return file;
    });

    /* ------------------------- */
    /* 8️⃣ Delete chunk files */
    /* ------------------------- */

    const paths = chunks.map((c) => `chunks/${uploadId}/${c.partNumber}`);

    await supabaseAdmin.storage.from("uploads").remove(paths);

    /* ------------------------- */
    /* 9️⃣ Cleanup DB */
    /* ------------------------- */

    await prisma.uploadChunk.deleteMany({
      where: { uploadId },
    });

    await prisma.uploadSession.delete({
      where: { id: uploadId },
    });

    return NextResponse.json({ file });

  } catch (err) {
    console.error("Upload completion failed:", err);

    return NextResponse.json({ error: "Finalization failed" }, { status: 500 });
  }
}
