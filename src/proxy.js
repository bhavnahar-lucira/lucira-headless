import { NextResponse } from "next/server";

export async function proxy(request) {
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
    const fetchUrl = `${origin}/api/redirect-check?path=${encodeURIComponent(pathname)}`;
    
    // We pass the pathname to check for redirects
    let checkRes;
    try {
      checkRes = await fetch(fetchUrl);
    } catch (fetchError) {
      console.error(`Proxy fetch failed for ${fetchUrl}:`, fetchError.message);
      
      // Fallback to internal loopback (127.0.0.1:3000)
      // This solves issues where the server cannot resolve its own public domain (common on UAT/Prod)
      const fallbackUrl = `http://127.0.0.1:3000/api/redirect-check?path=${encodeURIComponent(pathname)}`;
      try {
        console.log(`Attempting fallback fetch to: ${fallbackUrl}`);
        checkRes = await fetch(fallbackUrl);
      } catch (fallbackError) {
        console.error(`Fallback fetch also failed:`, fallbackError.message);
        throw fetchError; // Throw original error if fallback also fails
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
    console.error("Proxy redirect check failed:", error);
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
