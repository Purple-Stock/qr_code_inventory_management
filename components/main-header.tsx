"use client"

import { Package, Zap, Globe, Download, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { usePWAInstall } from "@/hooks/use-pwa-install"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function MainHeader() {
  const { t, setLanguage } = useLanguage()
  const { isInstallable, install } = usePWAInstall()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoggingOutState, setIsLoggingOut] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isLoggingOutFromParams = searchParams.get("logout") === "true"
  const shouldHideHeader = isLoggingOutFromParams || isLoggingOutState

  if (shouldHideHeader || pathname.includes("/auth/")) {
    return null
  }

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true)
      await supabase.auth.signOut()
      router.refresh()
      router.push("/auth/sign-in?logout=true")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold transition-transform hover:scale-105">
          <div className="relative">
            <Package className="h-8 w-8 text-primary" />
            <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary animate-pulse" />
          </div>
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            PURPLE STOCK
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          {isInstallable && (
            <Button variant="outline" size="sm" onClick={install} className="flex items-center gap-2 gradient-border">
              <Download className="h-4 w-4" />
              {t("install_app")}
            </Button>
          )}
          <Button variant="outline" size="sm" asChild className="gradient-border">
            <Link href="/settings" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              {t("Assinar")}
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="gradient-border hidden sm:flex">
            {t("user_guide")}
          </Button>
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors">
                  <Globe className="h-4 w-4" />
                  <span className="sr-only">Toggle language</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("en")}>{t("english")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("pt")}>{t("portuguese")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />

            {/* User Profile and Logout Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    {t("profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  disabled={isLoggingOutState}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {isLoggingOutState ? t("logging_out") : t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

