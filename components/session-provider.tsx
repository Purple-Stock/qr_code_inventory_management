"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "@/hooks/use-session"
import { usePathname } from "next/navigation"
import { ClientSearchParams } from "@/hooks/use-safe-search-params"
import type { Session, User } from "@supabase/supabase-js"

interface SessionContextType {
  session: Session | null
  user: User | null
  isLoading: boolean
  error: Error | null
  refreshSession: () => Promise<{ success: boolean; error?: Error }>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

function SessionProviderInner({ children }: { children: React.ReactNode }) {
  const { session, user, isLoading, error, refreshSession } = useSession()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Clear any stale session data if logging out
  useEffect(() => {
    if (isLoggingOut) {
      // This helps ensure we don't have any stale session data
      localStorage.removeItem("supabase.auth.token")
    }
  }, [isLoggingOut])
  
  return (
    <ClientSearchParams fallback={null}>
      {(searchParams) => {
        // Check if logout param is true
        const isLogoutParam = searchParams?.get("logout") === "true";
        if (isLogoutParam !== isLoggingOut) {
          setIsLoggingOut(isLogoutParam);
        }
        
        return (
          <SessionContext.Provider value={{ session, user, isLoading, error, refreshSession }}>
            {children}
          </SessionContext.Provider>
        );
      }}
    </ClientSearchParams>
  );
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProviderInner>{children}</SessionProviderInner>;
}

export function useSessionContext() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSessionContext must be used within a SessionProvider")
  }
  return context
}