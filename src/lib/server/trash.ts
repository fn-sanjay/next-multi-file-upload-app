import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";

export const TRASH_RETENTION_DAYS = 30;

type DbClient = PrismaClient | Prisma.TransactionClient;

export function getTrashExpiryCutoff() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - TRASH_RETENTION_DAYS);
  return cutoff;
}

export async function collectDescendantFolderIds(
  db: DbClient,
  rootFolderId: string,
  userId: string,
): Promise<string[]> {
  const folderIds: string[] = [rootFolderId];
  let frontier: string[] = [rootFolderId];

  while (frontier.length > 0) {
    const children = await db.folder.findMany({
      where: {
        userId,
        parentId: { in: frontier },
      },
      select: {
        id: true,
      },
    });

    const childIds = children.map((folder) => folder.id);

    if (childIds.length === 0) {
      break;
    }

    folderIds.push(...childIds);
    frontier = childIds;
  }

  return folderIds;
}

export async function deleteFilePermanently(
  tx: Prisma.TransactionClient,
  file: { id: string; blobId: string },
) {
  await tx.fileTag.deleteMany({
    where: { fileId: file.id },
  });

  await tx.share.deleteMany({
    where: { fileId: file.id },
  });

  await tx.recentAccess.deleteMany({
    where: { fileId: file.id },
  });

  await tx.file.delete({
    where: { id: file.id },
  });

  await tx.fileBlob.update({
    where: { id: file.blobId },
    data: {
      refCount: {
        decrement: 1,
      },
    },
  });
}

export async function deleteFolderTreePermanently(
  tx: Prisma.TransactionClient,
  folderIds: string[],
  userId: string,
) {
  const files = await tx.file.findMany({
    where: {
      userId,
      folderId: { in: folderIds },
    },
    select: {
      id: true,
      blobId: true,
    },
  });

  const fileIds = files.map((file) => file.id);

  if (fileIds.length > 0) {
    await tx.fileTag.deleteMany({
      where: {
        fileId: { in: fileIds },
      },
    });

    await tx.share.deleteMany({
      where: {
        fileId: { in: fileIds },
      },
    });

    await tx.recentAccess.deleteMany({
      where: {
        fileId: { in: fileIds },
      },
    });
  }

  await tx.share.deleteMany({
    where: {
      folderId: { in: folderIds },
    },
  });

  await tx.recentAccess.deleteMany({
    where: {
      folderId: { in: folderIds },
    },
  });

  await tx.folderTag.deleteMany({
    where: {
      folderId: { in: folderIds },
    },
  });

  if (fileIds.length > 0) {
    await tx.file.deleteMany({
      where: {
        id: { in: fileIds },
      },
    });

    const blobCounts = new Map<string, number>();

    for (const file of files) {
      blobCounts.set(file.blobId, (blobCounts.get(file.blobId) ?? 0) + 1);
    }

    for (const [blobId, count] of blobCounts) {
      await tx.fileBlob.update({
        where: { id: blobId },
        data: {
          refCount: {
            decrement: count,
          },
        },
      });
    }
  }

  await tx.folder.deleteMany({
    where: {
      id: { in: folderIds },
    },
  });
}

export async function purgeExpiredTrashForUser(userId: string) {
  const cutoff = getTrashExpiryCutoff();

  const expiredFolders = await prisma.folder.findMany({
    where: {
      userId,
      deletedAt: { lte: cutoff },
    },
    select: {
      id: true,
      parentId: true,
    },
  });

  const expiredFolderIdSet = new Set(expiredFolders.map((folder) => folder.id));
  const rootExpiredFolderIds = expiredFolders
    .filter((folder) => !folder.parentId || !expiredFolderIdSet.has(folder.parentId))
    .map((folder) => folder.id);

  const purgedFolderIds = new Set<string>();

  for (const folderId of rootExpiredFolderIds) {
    const folderIds = await collectDescendantFolderIds(prisma, folderId, userId);

    for (const currentId of folderIds) {
      purgedFolderIds.add(currentId);
    }

    await prisma.$transaction((tx) =>
      deleteFolderTreePermanently(tx, folderIds, userId),
    );
  }

  const expiredFiles = await prisma.file.findMany({
    where: {
      userId,
      deletedAt: { lte: cutoff },
      ...(purgedFolderIds.size > 0
        ? {
            OR: [
              { folderId: null },
              { folderId: { notIn: Array.from(purgedFolderIds) } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      blobId: true,
    },
  });

  for (const file of expiredFiles) {
    await prisma.$transaction((tx) => deleteFilePermanently(tx, file));
  }
}
