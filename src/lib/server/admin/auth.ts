import { NextRequest, NextResponse } from "next/server";
import { getAuthPayload } from "@/lib/server/auth/auth";

export type AdminAuthResult =
  | { ok: true; adminId: string; adminEmail: string }
  | { ok: false; response: NextResponse };

export async function requireAdmin(
  request: NextRequest,
): Promise<AdminAuthResult> {
  const payload = await getAuthPayload(request);

  if (!payload) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (payload.role !== "ADMIN") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    ok: true,
    adminId: payload.sub,
    adminEmail: payload.email,
  };
}
