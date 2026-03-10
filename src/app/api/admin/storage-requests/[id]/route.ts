import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma, type TransactionClient } from "@/lib/server/prisma";
import { requireAdmin } from "@/lib/server/admin/auth";

const updateRequestSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = updateRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const { action } = parsed.data;

  try {
    const requestRecord = await prisma.storageRequest.findUnique({
      where: { id },
    });

    if (!requestRecord) {
      return NextResponse.json(
        { error: "Storage request not found" },
        { status: 404 },
      );
    }

    if (requestRecord.status !== "PENDING") {
      return NextResponse.json(
        { error: "Request already processed" },
        { status: 400 },
      );
    }

    if (action === "REJECT") {
      const rejected = await prisma.storageRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          approvedAt: new Date(),
        },
      });

      return NextResponse.json({
        request: {
          ...rejected,
          requestedQuota: rejected.requestedQuota.toString(),
        },
      });
    }

    // APPROVE request
    const result = await prisma.$transaction(async (tx: TransactionClient) => {
      const updatedRequest = await tx.storageRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: requestRecord.userId },
        data: {
          storageQuota: requestRecord.requestedQuota,
        },
      });

      return updatedRequest;
    });

    return NextResponse.json({
      request: {
        ...result,
        requestedQuota: result.requestedQuota.toString(),
      },
    });
  } catch (error) {
    console.error("Admin storage request update error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
