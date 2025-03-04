"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Package, Github } from "lucide-react"
import { useSessionContext } from "@/components/session-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function SignInPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user } = useSessionContext()

  // Client-side only state for search params
  const [redirectTo, setRedirectTo] = useState("/dashboard")
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Use useEffect to safely access search params on the client
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRedirectTo(params.get("redirect") || "/dashboard")
    setIsLoggingOut(params.get("logout") === "true")
  }, [])

  useEffect(() => {
    if (user && !isLoggingOut) {
      router.push(redirectTo)
    }
  }, [user, isLoggingOut, redirectTo, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        throw error
      }

      router.push(redirectTo)
    } catch (err: any) {
      setError(err.message || "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-[400px] px-4">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <div className="relative p-3">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full opacity-20 blur-xl animate-pulse" />
              <Package className="h-10 w-10 text-primary relative z-10" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Purple Stock</h1>
          <p className="text-sm text-muted-foreground">{t("inventory_management_system")}</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-xl">{t("sign_in")}</CardTitle>
            <CardDescription>{t("enter_credentials")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("password")}</Label>
                  <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                    {t("forgot_password")}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              {error && <div className="rounded bg-destructive/15 p-3 text-sm text-destructive">{error}</div>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("signing_in")}
                  </>
                ) : (
                  t("sign_in")
                )}
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t("continue_with")}</span>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <Github className="mr-2 h-4 w-4" />
              Github
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-center text-sm text-muted-foreground w-full">
              {t("dont_have_account")}{" "}
              <Link href="/auth/sign-up" className="text-primary hover:underline font-medium">
                {t("sign_up")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

