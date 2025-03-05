"use client"

import { CardFooter } from "@/components/ui/card"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Package, Github, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/components/ui/use-toast"

export default function SignInPage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    setIsSuccess(false)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Show success message
      setIsSuccess(true)
      toast({
        title: t("login_successful"),
        description: t("redirecting_to_dashboard"),
        variant: "default",
        duration: 3000,
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      })

      // Add a small delay before redirecting to show the success message
      setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 1500)
    } catch (err: any) {
      console.error("Sign-in error:", err)
      const errorMessage = err.message || t("failed_to_sign_in")
      setError(errorMessage)

      // Show error toast
      toast({
        title: t("login_failed"),
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5" />,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }
    } catch (err: any) {
      console.error("GitHub sign-in error:", err)
      const errorMessage = err.message || t("failed_to_sign_in_with_github")
      setError(errorMessage)

      toast({
        title: t("login_failed"),
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5" />,
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
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
                  disabled={isLoading || isSuccess}
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
                  disabled={isLoading || isSuccess}
                />
              </div>

              {error && (
                <div className="rounded bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {isSuccess && (
                <div className="rounded bg-green-100 p-3 text-sm text-green-800 flex items-center gap-2 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>{t("login_successful")}</span>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || isSuccess}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("signing_in")}
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {t("redirecting")}
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

            <Button variant="outline" className="w-full" disabled={isLoading || isSuccess} onClick={handleGithubSignIn}>
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

