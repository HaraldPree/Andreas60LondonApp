import { NextResponse, type NextRequest } from "next/server";

/**
 * Paths that are always accessible (no PIN required).
 * - /login: PIN entry page itself
 * - /api/login + /api/logout: PIN management endpoints
 * - /_next, /favicon, static assets, manifest, icons: framework + browser needs
 * - /images: public hero/avatar images (no sensitive data)
 */
const PUBLIC_PATH_PREFIXES = [
  "/login",
  "/datenschutz", // privacy policy must be accessible without auth
  "/anleitung", // user guide should be accessible without PIN (link share-able)
  "/api/login",
  "/api/logout",
  "/_next",
  "/favicon",
  "/manifest",
  "/icon",
  "/apple-icon",
  "/images",
  "/api/version", // version checks don't need auth
];

const COOKIE_NAME = "app_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths
  if (PUBLIC_PATH_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Trim env var defensively — Vercel paste can add trailing whitespace
  // that silently breaks the comparison.
  const requiredPin = process.env.APP_PIN?.trim();

  // If no PIN configured (dev mode), skip auth
  if (!requiredPin) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;
  if (sessionCookie === requiredPin) {
    return NextResponse.next();
  }

  // Block unauthenticated API requests
  if (pathname.startsWith("/api/")) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized – PIN required" }),
      {
        status: 401,
        headers: { "content-type": "application/json" },
      },
    );
  }

  // Redirect page requests to /login (preserve target)
  const loginUrl = new URL("/login", request.url);
  if (pathname !== "/") {
    loginUrl.searchParams.set("redirect", pathname);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones listed above.
     * Keeping the matcher broad so middleware always runs;
     * fine-grained allow-list is handled inside the function.
     */
    "/((?!_next/static|_next/image).*)",
  ],
};
