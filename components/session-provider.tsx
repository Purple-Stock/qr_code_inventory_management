"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "@/hooks/use-session"
import { SafeSearchParamsProvider, useSafeSearchParams } from "@/hooks/use-safe-search-params"
import type { Session, User } from "@supabase/supabase-js"

interface SessionContextType {
  session: Session | null
  user: User | null
  isLoading: boolean
  error: Error | null
  refreshSession: () => Promise<{ success: boolean; error?: Error }>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

// Separate component to handle search params
function SessionWithSearchParams({ children }: { children: React.ReactNode }) {
  const searchParams = useSafeSearchParams()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Update isLoggingOut based on search params
  useEffect(() => {
    if (searchParams) {
      const isLogoutParam = searchParams.get("logout") === "true"
      setIsLoggingOut(isLogoutParam)
    }
  }, [searchParams])

  // Clear any stale session data if logging out
  useEffect(() => {
    if (isLoggingOut) {
      // This helps ensure we don't have any stale session data
      localStorage.removeItem("supabase.auth.token")
    }
  }, [isLoggingOut])

  return <>{children}</>
}

function SessionProviderInner({ children }: { children: React.ReactNode }) {
  const { session, user, isLoading, error, refreshSession } = useSession()

  return (
    <SessionContext.Provider value={{ session, user, isLoading, error, refreshSession }}>
      {children}
    </SessionContext.Provider>
  )
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <SafeSearchParamsProvider>
      <SessionWithSearchParams>
        <SessionProviderInner>{children}</SessionProviderInner>
      </SessionWithSearchParams>
    </SafeSearchParamsProvider>
  )
}

export function useSessionContext() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSessionContext must be used within a SessionProvider")
  }
  return context
}

