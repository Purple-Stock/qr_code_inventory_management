"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/auth"
import { useRouter } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get the initial session
    const getInitialSession = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        setSession(data.session)
        setUser(data.session?.user ?? null)
      } catch (error) {
        setError(error as Error)
        console.error("Error getting session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Set up the auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)

      // Handle auth events
      if (event === "SIGNED_IN") {
        router.refresh()
      }
      if (event === "SIGNED_OUT") {
        router.push("/auth/sign-in")
      }
      if (event === "PASSWORD_RECOVERY") {
        router.push("/auth/reset-password")
      }
      if (event === "USER_UPDATED") {
        setUser(session?.user ?? null)
      }
    })

    // Clean up the subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        throw error
      }

      setSession(data.session)
      setUser(data.session?.user ?? null)
      return { success: true }
    } catch (error) {
      setError(error as Error)
      console.error("Error refreshing session:", error)
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    session,
    user,
    isLoading,
    error,
    refreshSession,
  }
}

