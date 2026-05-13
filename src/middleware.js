import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;

  // Skip static assets, api routes, and dashboard
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    const origin = request.nextUrl.origin;
    const publicUrl = `https://www.lucirajewelry.com/api/redirect-check?path=${encodeURIComponent(pathname)}`;
    
    // We pass the pathname to check for redirects
    let checkRes;
    try {
      // Try public URL first
      checkRes = await fetch(publicUrl);
    } catch (fetchError) {
      // If public fetch fails (common on VPS self-resolution), fallback to internal loopback
      const fallbackUrl = `http://127.0.0.1:3000/api/redirect-check?path=${encodeURIComponent(pathname)}`;
      try {
        checkRes = await fetch(fallbackUrl);
      } catch (fallbackError) {
        // If even fallback fails, we log it and continue
        console.error("Middleware fallback fetch also failed:", fallbackError.message);
        throw fetchError;
      }
    }
    
    if (checkRes && checkRes.ok) {
      const data = await checkRes.json();
      if (data.redirect && data.target) {
        // Construct the target URL
        let targetUrl;
        if (data.target.startsWith("http")) {
          targetUrl = new URL(data.target);
        } else {
          targetUrl = new URL(data.target, origin);
        }
        
        // Preserve original search params if desired
        if (search) {
          const targetSearchParams = new URLSearchParams(targetUrl.search);
          const originalSearchParams = new URLSearchParams(search);
          originalSearchParams.forEach((value, key) => {
            targetSearchParams.set(key, value);
          });
          targetUrl.search = targetSearchParams.toString();
        }

        return NextResponse.redirect(targetUrl.toString(), 301);
      }
    }
  } catch (error) {
    // Fail silently to not break the site if the redirect check fails
    // But don't log the "fetch failed" if it was handled by fallback
    if (error.message !== "fetch failed") {
      console.error("Middleware redirect check failed:", error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
