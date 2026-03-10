import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuthPayload } from "@/lib/server/auth/auth";
import { createRecentAccessSchema } from "@/lib/validations/recent";

export async function GET(request: NextRequest) {
  const payload = await getAuthPayload(request);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const recent = await prisma.recentAccess.findMany({
      where: {
        userId: payload.sub,
      },
      include: {
        file: {
          include: {
            blob: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
        folder: {
          include: {
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
      orderBy: {
        accessedAt: "desc",
      },
      take: 20,
    });

    const validRecent = recent.filter(
      (r) =>
        (r.file && r.file.deletedAt === null) ||
        (r.folder && r.folder.deletedAt === null),
    );

    return NextResponse.json({
      recent: validRecent,
    });
  } catch (error) {
    console.error("Error fetching recent access:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const payload = await getAuthPayload(request);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const parsed = createRecentAccessSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const { fileId, folderId } = parsed.data;

    if (fileId) {
      const file = await prisma.file.findFirst({
        where: {
          id: fileId,
          userId: payload.sub,
          deletedAt: null,
        },
      });

      if (!file) {
        return NextResponse.json(
          { error: "File not found" },
          { status: 404 },
        );
      }
    }

    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId: payload.sub,
          deletedAt: null,
        },
      });

      if (!folder) {
        return NextResponse.json(
          { error: "Folder not found" },
          { status: 404 },
        );
      }
    }

    const recent = await prisma.recentAccess.upsert({
      where: fileId
        ? {
            userId_fileId: {
              userId: payload.sub,
              fileId,
            },
          }
        : {
            userId_folderId: {
              userId: payload.sub,
              folderId: folderId!,
            },
          },

      update: {
        accessedAt: new Date(),
      },

      create: {
        userId: payload.sub,
        fileId: fileId ?? null,
        folderId: folderId ?? null,
      },
    });

    return NextResponse.json({ recent });
  } catch (error) {
    console.error("Error creating/updating recent access:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}