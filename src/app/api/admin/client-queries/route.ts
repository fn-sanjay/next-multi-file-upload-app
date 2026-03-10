import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { requireAdmin } from "@/lib/server/admin/auth";

const clientQueryParamsSchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["all", "OPEN", "CLOSED"]).optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const parsed = clientQueryParamsSchema.safeParse({
    search: request.nextUrl.searchParams.get("search") ?? undefined,
    status: request.nextUrl.searchParams.get("status") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query params" },
      { status: 400 }
    );
  }

  const { search, status } = parsed.data;

  try {
    const tickets = await prisma.supportTicket.findMany({
      where: {
        ...(status && status !== "all" ? { status } : {}),
        ...(search
          ? {
              subject: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {}),
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        replies: {
          select: {
            id: true,
            message: true,
            createdAt: true,
            userId: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      queries: tickets,
      total: tickets.length,
    });
  } catch (error) {
    console.error("Admin client queries error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
