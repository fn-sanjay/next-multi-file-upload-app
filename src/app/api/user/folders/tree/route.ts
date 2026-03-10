import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuthPayload } from "@/lib/server/auth/auth";

type FolderNode = {
  id: string;
  name: string;
  parentId: string | null;
  children: FolderNode[];
};

export async function GET(request: NextRequest) {
  const payload = await getAuthPayload(request);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const folders = await prisma.folder.findMany({
      where: {
        userId: payload.sub,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
      orderBy: { name: "asc" },
    });

    const map: Record<string, FolderNode> = {};

    folders.forEach((f) => {
      map[f.id] = { ...f, children: [] };
    });

    const tree: FolderNode[] = [];

    folders.forEach((f) => {
      if (f.parentId && map[f.parentId]) {
        map[f.parentId].children.push(map[f.id]);
      } else {
        tree.push(map[f.id]);
      }
    });

    return NextResponse.json({ folders: tree });
  } catch (error) {
    console.error("Folder tree error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
