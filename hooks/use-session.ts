"use client"

import { useState, useEffect } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/lib/auth" // Make sure this is importing from lib/auth

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

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
        setUser(data.session?.user || null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
        console.error("Error getting session:", err)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Set up the auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("Auth state changed:", event)
      setSession(newSession)
      setUser(newSession?.user || null)
      setIsLoading(false)
    })

    // Clean up the subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const refreshSession = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        throw error
      }

      setSession(data.session)
      setUser(data.session?.user || null)
      return { success: true }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      console.error("Error refreshing session:", err)
      return { success: false, error: err instanceof Error ? err : new Error(String(err)) }
    } finally {
      setIsLoading(false)
    }
  }

  return { session, user, isLoading, error, refreshSession }
}

