"use client"

import { useEffect, useState } from "react"
import { useSessionContext } from "./session-provider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"

// Session expiry handler - shows a dialog when session is about to expire
export function SessionExpiryHandler() {
  const { session, refreshSession } = useSessionContext()
  const [showExpiryWarning, setShowExpiryWarning] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!session) return

    const expiresAt = session.expires_at * 1000 // Convert to milliseconds
    const warningTime = 5 * 60 * 1000 // 5 minutes before expiry

    // Calculate time until warning should show
    const timeUntilWarning = expiresAt - Date.now() - warningTime

    // Set timeout to show warning
    const warningTimeout = setTimeout(
      () => {
        setShowExpiryWarning(true)
      },
      Math.max(0, timeUntilWarning),
    )

    return () => {
      clearTimeout(warningTimeout)
    }
  }, [session])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    const { success } = await refreshSession()
    setIsRefreshing(false)

    if (success) {
      setShowExpiryWarning(false)
    }
  }

  return (
    <AlertDialog open={showExpiryWarning} onOpenChange={setShowExpiryWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
          <AlertDialogDescription>
            Your session is about to expire. Would you like to stay signed in?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              "Stay Signed In"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

