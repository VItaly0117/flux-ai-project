import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin");
  return response;
}

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/auth/signout")) {
    return applySecurityHeaders(NextResponse.next());
  }

  let response = applySecurityHeaders(
    NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  );

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return applySecurityHeaders(response);
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = applySecurityHeaders(
          NextResponse.next({
            request,
          })
        );
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    console.log("Middleware: Session found", { path: request.nextUrl.pathname, userId: user.id });
  } else {
    console.log("Middleware: No session", { path: request.nextUrl.pathname });
  }

  if (
    !user &&
    (request.nextUrl.pathname.startsWith("/admin") ||
      request.nextUrl.pathname.startsWith("/history") ||
      request.nextUrl.pathname.startsWith("/saved") ||
      request.nextUrl.pathname.startsWith("/profile") ||
      request.nextUrl.pathname.startsWith("/analyze"))
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    return applySecurityHeaders(NextResponse.redirect(new URL("/", request.url)));
  }

  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
