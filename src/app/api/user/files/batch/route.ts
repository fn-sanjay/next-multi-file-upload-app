import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuthPayload } from "@/lib/server/auth/auth";
import { batchSchema } from "@/lib/validations/batch";

export async function POST(request: NextRequest) {
  const payload = await getAuthPayload(request);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = batchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { action, files = [], folders = [], destinationFolderId } = parsed.data;

    const validateDestinationFolder = async () => {
      if (destinationFolderId === undefined) {
        return NextResponse.json(
          { error: "destinationFolderId required" },
          { status: 400 },
        );
      }

      if (destinationFolderId) {
        const folder = await prisma.folder.findFirst({
          where: {
            id: destinationFolderId,
            userId: payload.sub,
            deletedAt: null,
          },
        });

        if (!folder) {
          return NextResponse.json(
            { error: "Destination folder not found" },
            { status: 404 },
          );
        }
      }

      return null;
    };

    if (action === "move") {
      const validationError = await validateDestinationFolder();
      if (validationError) return validationError;

      await prisma.$transaction([
        prisma.file.updateMany({
          where: {
            id: { in: files },
            userId: payload.sub,
            deletedAt: null,
          },
          data: {
            folderId: destinationFolderId,
          },
        }),

        prisma.folder.updateMany({
          where: {
            id: { in: folders },
            userId: payload.sub,
            deletedAt: null,
          },
          data: {
            parentId: destinationFolderId,
          },
        }),
      ]);

      return NextResponse.json({ message: "Items moved successfully" });
    }

    if (action === "copy") {
      const validationError = await validateDestinationFolder();
      if (validationError) return validationError;

      const destination = destinationFolderId ?? null;

      const existingNames: { filename: string }[] = await prisma.file.findMany({
        where: {
          userId: payload.sub,
          folderId: destination,
        },
        select: { filename: true },
      });

      const nameSet = new Set(existingNames.map((f) => f.filename));

      const splitName = (filename: string) => {
        const lastDot = filename.lastIndexOf(".");
        if (lastDot <= 0) return { base: filename, ext: "" };
        return {
          base: filename.slice(0, lastDot),
          ext: filename.slice(lastDot),
        };
      };

      const getCopyName = (original: string) => {
        if (!nameSet.has(original)) {
          nameSet.add(original);
          return original;
        }

        const { base, ext } = splitName(original);
        let counter = 1;
        let candidate = `${base} (copy)${ext}`;

        while (nameSet.has(candidate)) {
          counter++;
          candidate = `${base} (copy ${counter})${ext}`;
        }

        nameSet.add(candidate);
        return candidate;
      };

      const sourceFiles = await prisma.file.findMany({
        where: {
          id: { in: files },
          userId: payload.sub,
          deletedAt: null,
        },
        include: {
          tags: true,
        },
      });

      type SourceFile = (typeof sourceFiles)[number];

      await prisma.$transaction(
        sourceFiles.map((file: SourceFile) =>
          prisma.file.create({
            data: {
              filename: getCopyName(file.filename),
              blobId: file.blobId,
              folderId: destination,
              userId: payload.sub,
              tags: {
                createMany: {
                  data: file.tags.map((tag: (typeof file.tags)[number]) => ({
                    tagId: tag.tagId,
                  })),
                  skipDuplicates: true,
                },
              },
            },
          }),
        ),
      );

      const folderNameCache = new Map<string | null, Set<string>>();

      const getFolderNameSet = async (parentId: string | null) => {
        if (folderNameCache.has(parentId)) {
          return folderNameCache.get(parentId)!;
        }

        const foldersAtDest: { name: string }[] = await prisma.folder.findMany({
          where: {
            userId: payload.sub,
            parentId,
            deletedAt: null,
          },
          select: { name: true },
        });

        const set = new Set(foldersAtDest.map((f) => f.name));

        folderNameCache.set(parentId, set);

        return set;
      };

      const splitFolderName = (folderName: string) => {
        const match = folderName.match(/^(.*?)(\s*\(copy(?:\s\d+)?\))?$/i);
        if (!match) return { base: folderName.trim() };
        const base = match[1].trim() || folderName;
        return { base };
      };

      const getFolderCopyName = async (
        parentId: string | null,
        original: string,
      ) => {
        const set = await getFolderNameSet(parentId);

        if (!set.has(original)) {
          set.add(original);
          return original;
        }

        const { base } = splitFolderName(original);

        let counter = 1;
        let candidate = `${base} (copy)`;

        while (set.has(candidate)) {
          counter++;
          candidate = `${base} (copy ${counter})`;
        }

        set.add(candidate);

        return candidate;
      };

      const copyFolderTree = async (
        sourceFolderId: string,
        targetParentId: string | null,
      ) => {
        const sourceFolder = await prisma.folder.findFirst({
          where: {
            id: sourceFolderId,
            userId: payload.sub,
            deletedAt: null,
          },
          include: {
            tags: true,
          },
        });

        if (!sourceFolder) return;

        const newFolderName = await getFolderCopyName(
          targetParentId,
          sourceFolder.name,
        );

        const createdFolder = await prisma.folder.create({
          data: {
            name: newFolderName,
            parentId: targetParentId,
            userId: payload.sub,
            tags: {
              createMany: {
                data: sourceFolder.tags.map(
                  (t: (typeof sourceFolder.tags)[number]) => ({
                    tagId: t.tagId,
                  }),
                ),
                skipDuplicates: true,
              },
            },
          },
        });

        const filesInFolder = await prisma.file.findMany({
          where: {
            folderId: sourceFolder.id,
            userId: payload.sub,
            deletedAt: null,
          },
          include: {
            tags: true,
          },
        });

        type FolderFile = (typeof filesInFolder)[number];

        await prisma.$transaction(
          filesInFolder.map((file: FolderFile) =>
            prisma.file.create({
              data: {
                filename: file.filename,
                blobId: file.blobId,
                folderId: createdFolder.id,
                userId: payload.sub,
                tags: {
                  createMany: {
                    data: file.tags.map((tag: (typeof file.tags)[number]) => ({
                      tagId: tag.tagId,
                    })),
                    skipDuplicates: true,
                  },
                },
              },
            }),
          ),
        );

        const childFolders = await prisma.folder.findMany({
          where: {
            parentId: sourceFolder.id,
            userId: payload.sub,
            deletedAt: null,
          },
          select: { id: true },
        });

        for (const child of childFolders) {
          await copyFolderTree(child.id, createdFolder.id);
        }
      };

      for (const folderId of folders) {
        await copyFolderTree(folderId, destination);
      }

      return NextResponse.json({
        message: "Items copied successfully",
      });
    }

    return NextResponse.json({ message: "Batch operation completed" });
  } catch (error) {
    console.error("Batch operation error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}