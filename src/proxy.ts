import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/server/auth/tokens";
import { ROUTES } from "@/routes";

const PUBLIC_API_PATHS = new Set([
  "/api/auth/csrf",
  "/api/auth/signup",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/refresh-token",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/google",
  "/api/auth/google/callback",
  "/api/auth/verify-email",
  "/api/docs",
  "/api/docs/ui",
]);

const AUTH_PAGES = new Set([
  ROUTES.auth.signIn,
  ROUTES.auth.signUp,
  ROUTES.auth.forgotPassword,
  ROUTES.auth.resetPassword,
  ROUTES.auth.verifyEmail,
]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Get Token
  const bearer = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  const token = bearer ?? request.cookies.get("access_token")?.value;
  const payload = token ? await verifyAccessToken(token) : null;

  // 2. API Protection
  if (pathname.startsWith("/api")) {
    if (PUBLIC_API_PATHS.has(pathname)) {
      return NextResponse.next();
    }

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role-based API protection
    if (pathname.startsWith("/api/admin") && payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.next();
  }

  // 3. Frontend Protection
  const isAuthPage = AUTH_PAGES.has(pathname);
  const isAdminPage = pathname.startsWith("/admin");
  const isUserPage = Object.values(ROUTES.pages).includes(pathname);

  const hasRefreshToken = request.cookies.has("refresh_token");
  const isLoggedIn = !!payload || hasRefreshToken;

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isLoggedIn) {
    // If they only have a refresh token, assume they are a user until the client fetches their actual role.
    const redirectUrl =
      payload?.role === "ADMIN" ? ROUTES.admin.dashboard : ROUTES.pages.myFiles;
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Protect admin pages
  if (isAdminPage) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(ROUTES.auth.signIn, request.url));
    }
    // If we have a payload, we can enforce the role immediately.
    // If we ONLY have a refresh token, we let them proceed to the client which will attempt a refresh.
    // If the refresh reveals they are not an admin, the client AuthProvider will likely redirect them anyway (if implemented) or API calls will fail.
    // For stricness, if they have a payload and it's NOT admin, redirect.
    if (payload && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL(ROUTES.pages.myFiles, request.url));
    }
  }

  // Protect user pages
  if (isUserPage) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(ROUTES.auth.signIn, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin/:path*",
    "/my-files",
    "/folders/:path*",
    "/favorites",
    "/archive",
    "/tags",
    "/profile",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ],
};
