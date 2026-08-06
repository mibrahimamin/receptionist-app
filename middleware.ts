import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  /**
   * Creates a response that passes the current pathname
   * to Server Component layouts.
   */
  function createResponse() {
    const requestHeaders = new Headers(request.headers);

    requestHeaders.set(
      "x-pathname",
      request.nextUrl.pathname
    );

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  let response = createResponse();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          // Recreate the response while preserving x-pathname.
          response = createResponse();

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(name, value, options);
            }
          );
        },
      },
    }
  );

  // Gets the user and refreshes the session when necessary.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Login and signup must remain accessible without a session.
  if (
    pathname === "/dashboard/login" ||
    pathname === "/dashboard/signup"
  ) {
    // Logged-in owners do not need the login page.
    if (user && pathname === "/dashboard/login") {
      return NextResponse.redirect(
        new URL("/dashboard", request.url)
      );
    }

    return response;
  }

  // Protect every other dashboard route.
  if (pathname.startsWith("/dashboard") && !user) {
    const loginUrl = new URL(
      "/dashboard/login",
      request.url
    );

    loginUrl.searchParams.set("from", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};