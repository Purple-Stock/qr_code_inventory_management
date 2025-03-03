import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the request is for an auth page
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth")

  // Check if this is a logout redirect
  const isLoggingOut = req.nextUrl.searchParams.get("logout") === "true"

  // If accessing an auth page while logged in, redirect to dashboard
  // But don't redirect if we're in the process of logging out
  if (isAuthPage && session && !isLoggingOut) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // If accessing a protected page without being logged in, redirect to login
  if (!isAuthPage && !session && !req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url))
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
}

