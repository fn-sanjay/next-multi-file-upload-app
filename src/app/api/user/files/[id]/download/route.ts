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
      .createSignedUrl(file.blob.storageKey, 60 * 5); // 5 minutes

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to generate download URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      url: data.signedUrl,
      filename: file.filename,
    });
  } catch (error) {
    console.error("Download error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
