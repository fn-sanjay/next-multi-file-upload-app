import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuthPayload } from "@/lib/server/auth/auth";
import { createStorageRequestSchema } from "@/lib/validations/storage-requests";

export async function GET(request: NextRequest) {
  const payload = await getAuthPayload(request);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requests = await prisma.storageRequest.findMany({
      where: {
        userId: payload.sub,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = requests.map((r) => ({
      ...r,
      requestedQuota: r.requestedQuota.toString(),
    }));

    return NextResponse.json({ requests: formatted });
  } catch (error) {
    console.error("Error fetching storage requests:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const payload = await getAuthPayload(request);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pendingRequest = await prisma.storageRequest.findFirst({
      where: {
        userId: payload.sub,
        status: "PENDING",
      },
    });

    if (pendingRequest) {
      return NextResponse.json(
        { error: "You already have a pending request" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const parsed = createStorageRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { requestedQuota, reason } = parsed.data;

    const requestRecord = await prisma.storageRequest.create({
      data: {
        userId: payload.sub,
        requestedQuota,
        reason,
      },
    });

    return NextResponse.json(
      {
        request: {
          ...requestRecord,
          requestedQuota: requestRecord.requestedQuota.toString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating storage request:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}