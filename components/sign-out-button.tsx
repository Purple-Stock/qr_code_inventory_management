"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function SignOutButton({ variant = "default", size = "default", className }: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
      // Redirect with a logout parameter to prevent redirect loops
      router.push("/auth/sign-in?logout=true")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleSignOut} disabled={isLoading}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Sign out
    </Button>
  )
}

