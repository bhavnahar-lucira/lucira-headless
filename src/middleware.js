import { NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Common image/font extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|css|js)$).*)',
  ],
};

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;

  // Additional safety check to skip non-page routes
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
      // Try public URL with a 2-second timeout to prevent hanging the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      checkRes = await fetch(publicUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      // Fallback to internal loopback if public fetch fails or times out
      const fallbackUrl = `http://127.0.0.1:3000/api/redirect-check?path=${encodeURIComponent(pathname)}`;
      try {
        const fallbackController = new AbortController();
        const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 2000);
        
        checkRes = await fetch(fallbackUrl, { signal: fallbackController.signal });
        clearTimeout(fallbackTimeoutId);
      } catch (fallbackError) {
        // Fail silently
        return NextResponse.next();
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
    // But don't log "fetch failed" or "aborted" errors as they are handled by fallbacks
    if (!["fetch failed", "signal is aborted", "The operation was aborted"].includes(error.message)) {
      console.error("Middleware redirect check failed:", error);
    }
  }

  return NextResponse.next();
}
