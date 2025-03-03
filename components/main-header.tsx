"use client"

import { Package, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export function MainHeader() {
  const { t } = useLanguage()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6 text-purple-600" />
          <span className="text-lg font-bold text-purple-600">PURPLE STOCK</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              {t("assinar")}
            </Link>
          </Button>
          <Button variant="outline" size="sm">
            {t("user_guide")}
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

