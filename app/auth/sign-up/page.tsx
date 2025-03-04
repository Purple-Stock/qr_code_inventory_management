"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signUp } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Package, Github, Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function SignUpPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError(t("passwords_dont_match"))
      setIsLoading(false)
      return
    }

    try {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message)
      } else {
        setIsSuccess(true)
      }
    } catch (err) {
      setError("An unexpected error occurred")
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
            <CardTitle className="text-xl">{t("create_account")}</CardTitle>
            <CardDescription>{t("enter_details")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="space-y-4 text-center">
                <div className="rounded-full bg-green-100 p-3 text-green-600 mx-auto w-12 h-12 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium">{t("check_email")}</h3>
                <p className="text-muted-foreground">{t("email_confirmation_sent")}</p>
                <Button variant="outline" className="w-full" onClick={() => router.push("/auth/sign-in")}>
                  {t("back_to_sign_in")}
                </Button>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
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
                    <Label htmlFor="password">{t("password")}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t("confirm_password")}</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("creating_account")}
                      </>
                    ) : (
                      t("create_account")
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
              </>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-center text-sm text-muted-foreground w-full">
              {t("already_have_account")}{" "}
              <Link href="/auth/sign-in" className="text-primary hover:underline font-medium">
                {t("sign_in")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

