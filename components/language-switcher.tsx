"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={language === "en" ? "default" : "outline"}
        size="sm"
        onClick={() => setLanguage("en")}
        className="h-8 w-8 p-0"
      >
        EN
      </Button>
      <Button
        variant={language === "pt" ? "default" : "outline"}
        size="sm"
        onClick={() => setLanguage("pt")}
        className="h-8 w-8 p-0"
      >
        PT
      </Button>
    </div>
  )
}

