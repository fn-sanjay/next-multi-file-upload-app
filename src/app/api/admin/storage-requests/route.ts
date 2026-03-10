import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { requireAdmin } from "@/lib/server/admin/auth";

const querySchema = z.object({
  status: z.enum(["all", "PENDING", "APPROVED", "REJECTED"]).optional(),
});

type StorageRequestWithUser = {
  requestedQuota: bigint;
  user: {
    storageQuota: bigint;
  } & Record<string, unknown>;
} & Record<string, unknown>;

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const parsed = querySchema.safeParse({
    status: request.nextUrl.searchParams.get("status") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query params" }, { status: 400 });
  }

  const { status } = parsed.data;

  try {
    const requests = await prisma.storageRequest.findMany({
      where: {
        ...(status && status !== "all" ? { status } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            storageQuota: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = requests.map((r: StorageRequestWithUser) => ({
      ...r,
      requestedQuota: r.requestedQuota.toString(),
      user: {
        ...r.user,
        storageQuota: r.user.storageQuota.toString(),
      },
    }));

    return NextResponse.json({
      requests: formatted,
      total: formatted.length,
    });
  } catch (error) {
    console.error("Admin storage requests error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
