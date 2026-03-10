import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuthPayload } from "@/lib/server/auth/auth";

export async function POST(request: NextRequest) {
  const payload = await getAuthPayload(request);

  if (!payload) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { fileId, tagId } = body;

    if (!fileId || !tagId) {
      return NextResponse.json(
        { error: "fileId and tagId required" },
        { status: 400 }
      );
    }

    /* check duplicate */

    const existing = await prisma.fileTag.findUnique({
      where: {
        fileId_tagId: {
          fileId,
          tagId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Tag already attached" },
        { status: 409 }
      );
    }

    /* max tag limit */

    const tagCount = await prisma.fileTag.count({
      where: { fileId },
    });

    if (tagCount >= 3) {
      return NextResponse.json(
        { error: "Maximum 3 tags per file" },
        { status: 400 }
      );
    }

    const fileTag = await prisma.fileTag.create({
      data: {
        fileId,
        tagId,
      },
    });

    return NextResponse.json({ fileTag }, { status: 201 });
  } catch (error: unknown) {
    console.error("Failed to attach file tag:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const payload = await getAuthPayload(request);

  if (!payload) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { fileId, tagId } = body;

    await prisma.fileTag.delete({
      where: {
        fileId_tagId: {
          fileId,
          tagId,
        },
      },
    });

    return NextResponse.json({
      message: "Tag removed",
    });
  } catch (error: unknown) {
    console.error("Failed to remove file tag:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
