import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuthPayload } from "@/lib/server/auth/auth";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";

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
        deletedAt: null,
      },
      include: {
        blob: true,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin.storage
      .from("uploads")
      .createSignedUrl(file.blob.storageKey, 60 * 5, {
        download: false,
      });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to generate preview URL" },
        { status: 500 },
      );
    }

    /* fix mime type */
    let mimeType = file.blob.mimeType;

    if (mimeType === "application/octet-stream") {
      const ext = file.blob.extension?.toLowerCase();

      if (ext === "json") mimeType = "application/json";
      if (ext === "pdf") mimeType = "application/pdf";
      if (ext === "png") mimeType = "image/png";
      if (ext === "jpg" || ext === "jpeg") mimeType = "image/jpeg";
      if (ext === "mp4") mimeType = "video/mp4";
      if (ext === "txt") mimeType = "text/plain";
    }

    return NextResponse.json({
      previewUrl: data.signedUrl,
      mimeType,
    });
  } catch (error) {
    console.error("Preview error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
