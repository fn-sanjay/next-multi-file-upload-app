import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { getAuthPayload } from "@/lib/server/auth/auth";
import { createFolderSchema } from "@/lib/validations/folders";
import { purgeExpiredTrashForUser } from "@/lib/server/trash";

const listFoldersQuerySchema = z.object({
  sort: z.enum(["name", "recent", "oldest"]).default("name"),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

/* ------------------------------------------------ */
/* GET - LIST FOLDERS */
/* ------------------------------------------------ */

export async function GET(request: NextRequest) {
  const payload = await getAuthPayload(request);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;

  const parentIdParam = searchParams.get("parentId");
  const search = searchParams.get("search");
  const tagId = searchParams.get("tagId");
  const isFavorite = searchParams.get("isFavorite") === "true";
  const isArchived = searchParams.get("isArchived") === "true";
  const parsedQuery = listFoldersQuerySchema.safeParse({
    sort: searchParams.get("sort") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsedQuery.error.format() },
      { status: 400 },
    );
  }

  const { sort, limit } = parsedQuery.data;

  // normalize parentId
  const normalizedParentId =
    parentIdParam === "null" || parentIdParam === "" ? null : parentIdParam;

  try {
    if (isArchived) {
      await purgeExpiredTrashForUser(payload.sub);
    }

    const folders = await prisma.folder.findMany({
      where: {
        userId: payload.sub,
        ...(isArchived ? { deletedAt: { not: null } } : { deletedAt: null }),

        // root / nested folders
        ...(parentIdParam !== null
          ? { parentId: normalizedParentId }
          : {}),

        // search filter
        ...(search
          ? {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {}),

        // tag filter
        ...(tagId
          ? {
              tags: {
                some: { tagId },
              },
            }
          : {}),
        ...(isFavorite ? { isFavorite: true } : {}),
      },

      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            files: true,
            children: true,
          },
        },
      },

      orderBy:
        sort === "recent"
          ? { [isArchived ? "deletedAt" : "createdAt"]: "desc" }
          : sort === "oldest"
            ? { [isArchived ? "deletedAt" : "createdAt"]: "asc" }
            : { name: "asc" },
      ...(limit ? { take: limit } : {}),
    });

    return NextResponse.json({ folders });

  } catch (error) {
    console.error("Fetch folders error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------ */
/* POST - CREATE FOLDER */
/* ------------------------------------------------ */

export async function POST(request: NextRequest) {
  const payload = await getAuthPayload(request);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const parsed = createFolderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const { name, parentId, tagIds = [] } = parsed.data;
    const uniqueTagIds = [...new Set(tagIds)];

    /* Validate parent folder */
    if (parentId) {
      const parent = await prisma.folder.findFirst({
        where: {
          id: parentId,
          userId: payload.sub,
          deletedAt: null,
        },
      });

      if (!parent) {
        return NextResponse.json(
          { error: "Parent folder not found" },
          { status: 404 },
        );
      }
    }

    if (uniqueTagIds.length > 0) {
      const userTags = await prisma.tag.findMany({
        where: {
          userId: payload.sub,
          id: { in: uniqueTagIds },
        },
        select: { id: true },
      });

      if (userTags.length !== uniqueTagIds.length) {
        return NextResponse.json(
          { error: "One or more selected tags are invalid" },
          { status: 400 },
        );
      }
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        parentId,
        userId: payload.sub,
        ...(uniqueTagIds.length > 0
          ? {
              tags: {
                create: uniqueTagIds.map((tagId) => ({ tagId })),
              },
            }
          : {}),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json({ folder }, { status: 201 });

  } catch (error) {
    console.error("Create folder error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
