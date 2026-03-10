import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { requireAdmin } from "@/lib/server/admin/auth";

const categorize = (
  mime: string | null | undefined,
): "images" | "video" | "docs" | "audio" | "others" => {
  if (!mime) return "others";
  if (mime.startsWith("image/")) return "images";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";

  const docMimes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
  ];

  if (docMimes.includes(mime)) return "docs";
  return "others";
};

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const [users, files] = await Promise.all([
      prisma.user.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          email: true,
          storageQuota: true,
        },
      }),
      prisma.file.findMany({
        select: {
          userId: true,
          deletedAt: true,
          blob: {
            select: { size: true, mimeType: true },
          },
        },
      }),
    ]);

    const usage = {
      images: { bytes: 0, count: 0 },
      docs: { bytes: 0, count: 0 },
      video: { bytes: 0, count: 0 },
      audio: { bytes: 0, count: 0 },
      others: { bytes: 0, count: 0 },
      trash: { bytes: 0, count: 0 },
    };

    const perUser: Record<
      string,
      { bytes: number; count: number; deletedBytes: number }
    > = {};

    for (const file of files) {
      const size = file.blob?.size ?? 0;
      const userBucket =
        perUser[file.userId] ||
        (perUser[file.userId] = { bytes: 0, count: 0, deletedBytes: 0 });

      if (file.deletedAt) {
        usage.trash.bytes += size;
        usage.trash.count += 1;
        userBucket.deletedBytes += size;
        continue;
      }

      const bucket = categorize(file.blob?.mimeType);
      usage[bucket].bytes += size;
      usage[bucket].count += 1;

      userBucket.bytes += size;
      userBucket.count += 1;
    }

    const totalUsedBytes =
      usage.images.bytes +
      usage.docs.bytes +
      usage.video.bytes +
      usage.audio.bytes +
      usage.others.bytes;

    const totalLimitBytes = users.reduce(
      (acc, u) => acc + Number(u.storageQuota ?? 0),
      0,
    );

    const usersWithUsage = users.map((u) => {
      const agg = perUser[u.id] || { bytes: 0, count: 0, deletedBytes: 0 };
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        storageQuota: u.storageQuota.toString(),
        usedBytes: agg.bytes,
        usedCount: agg.count,
        trashBytes: agg.deletedBytes,
      };
    });

    return NextResponse.json({
      totalUsers: users.length,
      totalLimitBytes,
      totalUsedBytes,
      usage,
      users: usersWithUsage,
    });
  } catch (error) {
    console.error("admin storage stats error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
