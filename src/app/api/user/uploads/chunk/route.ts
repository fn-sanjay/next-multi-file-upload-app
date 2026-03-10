import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuthPayload } from "@/lib/server/auth/auth";
import { supabaseAdmin as supabase } from "@/lib/supabase/supabase-admin";

const hasErrorCode = (err: unknown): err is { code?: string } =>
  typeof err === "object" && err !== null && "code" in err;

export async function POST(req: NextRequest) {
  const payload = await getAuthPayload(req);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();

  const uploadId = formData.get("uploadId") as string;
  const partNumber = Number(formData.get("partNumber"));
  const chunk = formData.get("chunk") as File;

  if (!uploadId || !chunk) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const arrayBuffer = await chunk.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const storageKey = `chunks/${uploadId}/${partNumber}`;

  try {
    const { error } = await supabase.storage
      .from("uploads")
      .upload(storageKey, buffer, { upsert: true });

    if (error) {
      console.error("[Chunk API] Supabase storage error:", error);
      return NextResponse.json(
        { error: "Chunk upload failed (Storage)", details: error },
        { status: 500 },
      );
    }

    await prisma.uploadChunk.create({
      data: {
        uploadId,
        partNumber,
        size: buffer.length,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (hasErrorCode(err) && err.code === "P2002") {
      // Unique constraint failed, chunk probably already exists
      console.warn(`[Chunk API] Chunk already exists: ${storageKey}`);
      return NextResponse.json({
        success: true,
        warning: "Chunk already existed",
      });
    }
    console.error(`[Chunk API] Unexpected Error:`, err);
    return NextResponse.json(
      {
        error: "Chunk upload failed (Internal)",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
