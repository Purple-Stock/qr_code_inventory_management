import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define paths that don't require authentication
const publicPaths = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/callback",
]

// Define static asset paths that should be excluded from middleware processing
const staticPaths = ["/_next", "/favicon.ico", "/manifest.json", "/sw.js", "/workbox-", "/assets/", "/images/", "/api/"]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Skip middleware for static assets and API routes
  if (staticPaths.some((path) => pathname.startsWith(path))) {
    return res
  }

  try {
    // Create supabase middleware client
    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if expired
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Handle authentication logic
    const isAuthPath = publicPaths.some((path) => pathname.startsWith(path))

    // If user is signed in and trying to access auth pages, redirect to home
    if (session && isAuthPath) {
      const redirectUrl = new URL("/", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is not signed in and trying to access protected pages, redirect to sign-in
    if (!session && !isAuthPath) {
      const redirectUrl = new URL("/auth/sign-in", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)

    // If there's an error, allow access to auth pages but redirect to sign-in for other pages
    if (publicPaths.some((path) => pathname.startsWith(path))) {
      return res
    } else {
      const redirectUrl = new URL("/auth/sign-in", req.url)
      return NextResponse.redirect(redirectUrl)
    }
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

