import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (!code) {
    // If there's no code, redirect to sign-in with an error
    return NextResponse.redirect(`${requestUrl.origin}/auth/sign-in?error=Missing authentication code`)
  }

  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Auth callback error:", error.message)
      // If there's an error, redirect to sign-in with the error message
      return NextResponse.redirect(`${requestUrl.origin}/auth/sign-in?error=${encodeURIComponent(error.message)}`)
    }

    // Successful authentication, redirect to the home page
    return NextResponse.redirect(requestUrl.origin)
  } catch (error) {
    console.error("Unexpected error in auth callback:", error)
    // If there's an unexpected error, redirect to sign-in with a generic error message
    return NextResponse.redirect(`${requestUrl.origin}/auth/sign-in?error=Authentication failed`)
  }
}

