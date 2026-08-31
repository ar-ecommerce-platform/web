import { NextRequest, NextResponse } from "next/server";

// Bounces unauthenticated users away from the app pages that need a session
// (see `matcher` below). Cheap check only - presence + non-expired exp claim;
// the gateway still does real validation on every API call. Runs on the Edge
// runtime, so no Buffer - use atob.
const COOKIE = process.env.SESSION_COOKIE ?? "ecom_session";

function looksValid(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(b64));
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  if (looksValid(req.cookies.get(COOKIE)?.value)) return NextResponse.next();

  const login = new URL("/login", req.url);
  login.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/cart/:path*", "/checkout/:path*", "/orders/:path*"],
};
