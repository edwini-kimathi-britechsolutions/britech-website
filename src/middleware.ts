import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "britech_session";
const SEVEN_DAYS = 60 * 60 * 24 * 7;

/**
 * Cheap first gate for /admin: no cookie → sign-in page.
 * Real validation (DB session, role checks) happens in every admin page and server action.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const isLogin = pathname === "/admin/login";

  if (!token && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");

  // Sliding cookie expiry on normal page loads.
  if (token && req.method === "GET") {
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SEVEN_DAYS,
    });
  }
  return res;
}

export const config = { matcher: ["/admin/:path*"] };
