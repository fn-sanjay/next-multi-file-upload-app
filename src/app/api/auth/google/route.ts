import { randomBytes, createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const secure = process.env.NODE_ENV === "production";

function getBaseUrl(req: NextRequest): string {
  return process.env.NEXT_PUBLIC_APP_URL ??
    `${req.nextUrl.protocol}//${req.headers.get("host")}`;
}

function base64url(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function createPKCE() {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(
    createHash("sha256").update(verifier).digest()
  );

  return { verifier, challenge };
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "Missing GOOGLE_CLIENT_ID" },
      { status: 500 }
    );
  }

  const state = randomBytes(16).toString("hex");

  const { verifier, challenge } = createPKCE();

  const redirectUri = `${getBaseUrl(request)}/api/auth/google/callback`;

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  // PKCE
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authUrl);

  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  response.cookies.set("google_pkce_verifier", verifier, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}