import { NextResponse, type NextRequest } from "next/server";
import { updateSession, copyCookies } from "@/utils/supabase/middleware";

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin");
  return response;
}

const PROTECTED_ROUTES = ["/admin", "/dashboard", "/history", "/saved", "/profile", "/analyze"];

export async function middleware(request: NextRequest) {
  // Let the signout route pass through without session logic
  if (request.nextUrl.pathname.startsWith("/auth/signout")) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Single Supabase call — refreshes tokens and returns user + response with cookies
  const { response, user } = await updateSession(request);

  applySecurityHeaders(response);

  // Protect routes — redirect to /login if no session
  const isProtected = PROTECTED_ROUTES.some((r) => request.nextUrl.pathname.startsWith(r));

  if (!user && isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    const redirect = NextResponse.redirect(loginUrl);
    // CRITICAL: copy refreshed cookies to the redirect response
    copyCookies(response, redirect);
    return applySecurityHeaders(redirect);
  }

  // Already logged in — bounce away from auth pages
  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    const redirect = NextResponse.redirect(new URL("/dashboard", request.url));
    copyCookies(response, redirect);
    return applySecurityHeaders(redirect);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
