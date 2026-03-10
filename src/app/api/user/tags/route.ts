import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuthPayload } from "@/lib/server/auth/auth";
import { createTagSchema } from "@/lib/validations/tags";

const hasErrorCode = (err: unknown): err is { code?: string } =>
  typeof err === "object" && err !== null && "code" in err;

export async function GET(request: NextRequest) {
  const payload = await getAuthPayload(request);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tags = await prisma.tag.findMany({
    where: { userId: payload.sub },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ tags });
}

export async function POST(request: NextRequest) {
  const payload = await getAuthPayload(request);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const parsed = createTagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const tagCount = await prisma.tag.count({
      where: { userId: payload.sub },
    });

    if (tagCount >= 10) {
      return NextResponse.json(
        { error: "Maximum 10 tags allowed per user" },
        { status: 400 },
      );
    }

    const tag = await prisma.tag.create({
      data: {
        ...parsed.data,
        userId: payload.sub,
      },
    });

    return NextResponse.json({ tag }, { status: 201 });
  } catch (error: unknown) {
    if (hasErrorCode(error) && error.code === "P2002") {
      return NextResponse.json(
        { error: "Tag with this name already exists" },
        { status: 409 },
      );
    }

    console.error(error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
