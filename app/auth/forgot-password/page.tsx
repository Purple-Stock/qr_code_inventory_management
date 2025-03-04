"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ArrowLeft, Loader2, CheckCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function ForgotPasswordPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw error
      }

      setIsSuccess(true)
    } catch (error: any) {
      setError(error.message || t("failed_to_send_reset_link"))
    } finally {
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
            <CardTitle className="text-xl">{t("forgot_password")}</CardTitle>
            <CardDescription>{t("enter_email_for_reset")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="space-y-4 text-center">
                <div className="rounded-full bg-green-100 p-3 text-green-600 mx-auto w-12 h-12 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-medium">{t("check_email")}</h3>
                <p className="text-muted-foreground">{t("reset_link_sent")}</p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/auth/sign-in">{t("back_to_sign_in")}</Link>
                </Button>
              </div>
            ) : (
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
                {error && <div className="rounded bg-destructive/15 p-3 text-sm text-destructive">{error}</div>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("sending")}
                    </>
                  ) : (
                    t("send_reset_link")
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="link" className="w-full" asChild>
              <Link href="/auth/sign-in" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("back_to_sign_in")}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

