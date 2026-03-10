import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import {
  newRefreshToken,
  hashOpaqueToken,
  signAccessToken,
} from "@/lib/server/auth/tokens";
import { setAuthCookies } from "@/lib/server/auth/cookies";

function getBaseUrl(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  const host = req.headers.get("host");
  return `https://${host}`;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  const stateCookie = request.cookies.get("google_oauth_state")?.value;
  const pkceVerifier = request.cookies.get("google_pkce_verifier")?.value;

  if (!code || !state || !stateCookie || state !== stateCookie) {
    return NextResponse.json({ error: "Invalid OAuth state" }, { status: 400 });
  }

  if (!pkceVerifier) {
    return NextResponse.json(
      { error: "Missing PKCE verifier" },
      { status: 400 },
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Missing Google OAuth env vars" },
      { status: 500 },
    );
  }

  const redirectUri = `${getBaseUrl(request)}/api/auth/google/callback`;

  // Exchange authorization code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      code_verifier: pkceVerifier, // PKCE protection
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.json(
      { error: "Google token exchange failed" },
      { status: 400 },
    );
  }

  const tokens = await tokenRes.json();
  const googleAccessToken = tokens.access_token;

  if (!googleAccessToken) {
    return NextResponse.json(
      { error: "Google access token missing" },
      { status: 400 },
    );
  }

  // Fetch user profile
  const profileRes = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        authorization: `Bearer ${googleAccessToken}`,
      },
    },
  );

  if (!profileRes.ok) {
    return NextResponse.json(
      { error: "Google profile fetch failed" },
      { status: 400 },
    );
  }

  const profile = await profileRes.json();

  const email: string | undefined = profile.email;

  if (!email || !profile.email_verified) {
    return NextResponse.json(
      { error: "Google email not verified" },
      { status: 400 },
    );
  }

  const emailLower = email.toLowerCase();

  let user = await prisma.user.findUnique({
    where: { email: emailLower },
  });

  if (!user) {
    // New Google user
    user = await prisma.user.create({
      data: {
        email: emailLower,
        name: profile.name ?? null,
        profileImage: profile.picture ?? null,
        provider: "GOOGLE",
        emailVerified: new Date(),
        password: null,
      },
    });
  } else if (user.provider === "CREDENTIALS") {
    // Link Google to existing credentials account
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        provider: "GOOGLE",
        name: user.name ?? profile.name,
        profileImage: profile.picture ?? user.profileImage,
        emailVerified: new Date(),
      },
    });
  }

  // if provider === GOOGLE → do nothing, just login

  // Create access token
  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  // Create refresh token
  const refreshToken = newRefreshToken();

  await prisma.refreshToken.create({
    data: {
      tokenHash: await hashOpaqueToken(refreshToken),
      userId: user.id,
      userAgent: request.headers.get("user-agent"),
      ipAddress: request.headers.get("x-forwarded-for") ?? null,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  const redirectTo = new URL("/", getBaseUrl(request));
  const response = NextResponse.redirect(redirectTo);

  // cleanup cookies
  response.cookies.delete("google_oauth_state");
  response.cookies.delete("google_pkce_verifier");

  // set auth cookies
  setAuthCookies(response, accessToken, refreshToken);

  return response;
}
