import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuthPayload } from "@/lib/server/auth/auth";

export async function GET(request: NextRequest) {
  const payload = await getAuthPayload(request);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length === 0) {
    return NextResponse.json(
      { error: "Search query required" },
      { status: 400 },
    );
  }

  try {
    const query = q.trim();

    const [files, folders, tags] = await Promise.all([
      prisma.file.findMany({
        where: {
          userId: payload.sub,
          deletedAt: null,
          filename: {
            contains: query,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          filename: true,
          folderId: true,
        },
        take: 20,
      }),

      prisma.folder.findMany({
        where: {
          userId: payload.sub,
          deletedAt: null,
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
          parentId: true,
        },
        take: 20,
      }),

      prisma.tag.findMany({
        where: {
          userId: payload.sub,
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
          color: true,
        },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      files,
      folders,
      tags,
    });
  } catch (error) {
    console.error("Search error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}