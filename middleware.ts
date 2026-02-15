import { NextResponse, type NextRequest } from "next/server";
import { updateSession, copyCookies } from "@/utils/supabase/middleware";

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin");
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return response;
}

const PROTECTED_ROUTES = ["/admin", "/dashboard", "/history", "/saved", "/profile", "/analyze"];
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/pricing", "/privacy"];

export async function middleware(request: NextRequest) {
  // Let the signout route pass through without session logic
  if (request.nextUrl.pathname.startsWith("/auth/signout")) {
    return applySecurityHeaders(NextResponse.next());
  }

  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isPublic = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

  let response: NextResponse;
  let user: unknown;
  try {
    // Single Supabase call — refreshes tokens and returns user + response with cookies
    const result = await updateSession(request);
    response = result.response;
    user = result.user;
  } catch (err) {
    console.log("[Middleware] updateSession error", err);
    response = NextResponse.next();
    user = null;
  }

  applySecurityHeaders(response);

  // Protect routes — redirect to /login if no session
  if (!user && isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    const redirect = NextResponse.redirect(loginUrl);
    // CRITICAL: copy refreshed cookies to the redirect response
    copyCookies(response, redirect);
    return applySecurityHeaders(redirect);
  }

  // Already logged in — bounce away from auth pages
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const redirect = NextResponse.redirect(new URL("/dashboard", request.url));
    copyCookies(response, redirect);
    return applySecurityHeaders(redirect);
  }

  // If request is neither public nor protected, still avoid caching to reduce weird session edge cases
  if (!isPublic && !isProtected) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
