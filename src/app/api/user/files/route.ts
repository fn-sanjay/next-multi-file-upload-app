import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { getAuthPayload } from "@/lib/server/auth/auth";
import { purgeExpiredTrashForUser } from "@/lib/server/trash";

const listFilesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(["recent", "oldest"]).default("recent"),
});

function hasErrorCode(
  error: unknown,
): error is {
  code?: string;
} {
  return typeof error === "object" && error !== null && "code" in error;
}

export async function GET(request: NextRequest) {
  const payload = await getAuthPayload(request);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const folderId = searchParams.get("folderId");
  const search = searchParams.get("search");
  const isFavorite = searchParams.get("isFavorite") === "true";
  const isArchived = searchParams.get("isArchived") === "true";
  const tagId = searchParams.get("tagId");
  const shouldPaginate =
    searchParams.has("page") || searchParams.has("limit");

  const parsedQuery = listFilesQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsedQuery.error.format() },
      { status: 400 },
    );
  }

  const { page, limit, sort } = parsedQuery.data;
  const where = {
    userId: payload.sub,
    ...(isArchived ? { deletedAt: { not: null } } : { deletedAt: null }),
    ...(isFavorite ? { isFavorite: true } : {}),
    ...(search
      ? { filename: { contains: search, mode: "insensitive" as const } }
      : {}),
    ...(folderId !== null && folderId !== undefined
      ? {
          folderId: folderId === "null" || folderId === "" ? null : folderId,
        }
      : {}),
    ...(tagId ? { tags: { some: { tagId } } } : {}),
  };
  const orderBy = { createdAt: sort === "oldest" ? "asc" : "desc" } as const;

  try {
    if (isArchived) {
      await purgeExpiredTrashForUser(payload.sub);
    }

    const [files, total] = await prisma.$transaction([
      prisma.file.findMany({
        where,
        include: {
          blob: true, // Includes size, mimeType, etc.
          tags: {
            include: { tag: true },
          },
        },
        orderBy,
        ...(shouldPaginate
          ? {
              skip: (page - 1) * limit,
              take: limit,
            }
          : {}),
      }),
      prisma.file.count({ where }),
    ]);

    return NextResponse.json({
      files,
      ...(shouldPaginate
        ? {
            pagination: {
              page,
              limit,
              total,
              totalPages: Math.max(1, Math.ceil(total / limit)),
            },
          }
        : {}),
    });
  } catch (error: unknown) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST is typically handled via an upload session later, but we can allow creating a file record if the user already has a blobId
const createFileSchema = z.object({
  filename: z.string().min(1).max(255),
  folderId: z.string().uuid().nullable().optional(),
  blobId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const payload = await getAuthPayload(request);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createFileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { filename, folderId, blobId } = parsed.data;

    // Verify blob exists
    const blob = await prisma.fileBlob.findUnique({ where: { id: blobId } });
    if (!blob) {
      return NextResponse.json(
        { error: "File blob not found" },
        { status: 404 },
      );
    }

    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId: payload.sub, deletedAt: null },
      });
      if (!folder) {
        return NextResponse.json(
          { error: "Folder not found" },
          { status: 404 },
        );
      }
    }

    const file = await prisma.file.create({
      data: {
        filename,
        folderId,
        blobId,
        userId: payload.sub,
      },
      include: {
        blob: true,
      },
    });

    return NextResponse.json({ file }, { status: 201 });
  } catch (error: unknown) {
    if (hasErrorCode(error) && error.code === "P2002") {
      return NextResponse.json(
        {
          error:
            "A file with this name already exists in the destination folder",
        },
        { status: 409 },
      );
    }
    console.error("Error creating file record:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
