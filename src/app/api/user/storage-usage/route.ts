import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuthPayload } from "@/lib/server/auth/auth";

// Helper to bucket mime types
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
  const payload = await getAuthPayload(request);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [user, files] = await Promise.all([
      prisma.user.findUnique({
        where: { id: payload.sub },
        select: { storageQuota: true },
      }),
      prisma.file.findMany({
        where: { userId: payload.sub },
        select: {
          deletedAt: true,
          blob: {
            select: { size: true, mimeType: true },
          },
        },
      }),
    ]);

    const totalLimitBytes =
      Number(user?.storageQuota ?? 0) || 10 * 1024 * 1024 * 1024;

    const usage = {
      images: { bytes: 0, count: 0 },
      docs: { bytes: 0, count: 0 },
      video: { bytes: 0, count: 0 },
      audio: { bytes: 0, count: 0 },
      others: { bytes: 0, count: 0 },
      trash: { bytes: 0, count: 0 },
    };

    for (const file of files) {
      const size = file.blob?.size ?? 0;

      if (file.deletedAt) {
        usage.trash.bytes += size;
        usage.trash.count += 1;
        continue;
      }

      const bucket = categorize(file.blob?.mimeType);
      usage[bucket].bytes += size;
      usage[bucket].count += 1;
    }

    const totalUsedBytes =
      usage.images.bytes +
      usage.docs.bytes +
      usage.video.bytes +
      usage.audio.bytes +
      usage.others.bytes;

    return NextResponse.json({
      totalLimitBytes,
      totalUsedBytes,
      usage,
    });
  } catch (error) {
    console.error("storage usage error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
