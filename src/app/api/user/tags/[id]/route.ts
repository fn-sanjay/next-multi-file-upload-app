import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuthPayload } from "@/lib/server/auth/auth";
import { updateTagSchema } from "@/lib/validations/tags";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const payload = await getAuthPayload(request);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existingTag = await prisma.tag.findFirst({
    where: { id, userId: payload.sub },
  });

  if (!existingTag) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  const body = await request.json();

  const parsed = updateTagSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.format() },
      { status: 400 },
    );
  }

  const tag = await prisma.tag.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ tag });
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

  const existingTag = await prisma.tag.findFirst({
    where: { id, userId: payload.sub },
  });

  if (!existingTag) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  try {
    await prisma.$transaction([
      prisma.fileTag.deleteMany({ where: { tagId: id } }),
      prisma.folderTag.deleteMany({ where: { tagId: id } }),
      prisma.tag.delete({ where: { id } }),
    ]);

    return NextResponse.json({
      message: "Tag deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Failed to delete tag:", error);
    return NextResponse.json(
      { error: "Failed to delete tag" },
      { status: 500 },
    );
  }
}
