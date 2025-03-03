"use client"

import type React from "react"

import { createContext, useContext, useEffect } from "react"
import { useSession } from "@/hooks/use-session"
import { usePathname, useSearchParams } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"

interface SessionContextType {
  session: Session | null
  user: User | null
  isLoading: boolean
  error: Error | null
  refreshSession: () => Promise<{ success: boolean; error?: Error }>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { session, user, isLoading, error, refreshSession } = useSession()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isLoggingOut = searchParams.get("logout") === "true"

  // Clear any stale session data if logging out
  useEffect(() => {
    if (isLoggingOut) {
      // This helps ensure we don't have any stale session data
      localStorage.removeItem("supabase.auth.token")
    }
  }, [isLoggingOut])

  return (
    <SessionContext.Provider value={{ session, user, isLoading, error, refreshSession }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSessionContext() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSessionContext must be used within a SessionProvider")
  }
  return context
}

