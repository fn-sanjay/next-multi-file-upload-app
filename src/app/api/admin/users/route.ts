import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { requireAdmin } from "@/lib/server/admin/auth";

type AdminUserRow = {
  storageUsed: bigint;
  storageQuota: bigint;
} & Record<string, unknown>;

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const search = request.nextUrl.searchParams.get("search");

  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      ...(search
        ? {
            email: {
              contains: search,
              mode: "insensitive",
            },
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      storageUsed: true,
      storageQuota: true,
      isReadOnly: true,
      isBanned: true,
      createdAt: true,
      lastLoginAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    users: users.map((u: AdminUserRow) => ({
      ...u,
      storageUsed: u.storageUsed.toString(),
      storageQuota: u.storageQuota.toString(),
    })),
    total: users.length,
  });
}
