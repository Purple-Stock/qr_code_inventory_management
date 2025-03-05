"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSessionContext } from "./session-provider"
import { Loader2 } from "lucide-react"

interface SessionGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function SessionGuard({ children, fallback }: SessionGuardProps) {
  const { user, isLoading } = useSessionContext()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip auth check for auth pages
    if (pathname.startsWith("/auth/")) {
      return
    }

    // If not loading and no user, redirect to sign in
    if (!isLoading && !user) {
      router.push(`/auth/sign-in?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [user, isLoading, router, pathname])

  // Show loading state
  if (isLoading) {
    return (
      fallback || (
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    )
  }

  // For auth pages, show children regardless of auth state
  if (pathname.startsWith("/auth/")) {
    return <>{children}</>
  }

  // For protected pages, only show if authenticated
  return user ? <>{children}</> : null
}

