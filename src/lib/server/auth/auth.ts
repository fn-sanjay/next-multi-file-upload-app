import { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/server/auth/tokens";

export async function getAuthPayload(request: NextRequest) {
  const bearer = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  const cookieToken = request.cookies.get("access_token")?.value;
  const token = bearer ?? cookieToken;

  if (!token) return null;
  return await verifyAccessToken(token);
}
