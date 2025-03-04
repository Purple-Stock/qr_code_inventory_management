"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package, CheckCircle, Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"

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
      setError(error.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-[400px] space-y-6">
        <div className="flex flex-col items-center space-y-2 mb-4">
          <div className="relative p-3">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full opacity-20 blur-xl animate-pulse" />
            <Package className="h-10 w-10 text-primary relative z-10" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-center">Purple Stock</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("inventory_management_system")}</p>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <div className="space-y-4">
            <div className="space-y-2 text-center">
              <h2 className="text-xl font-semibold">{t("reset_password")}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("reset_password_instructions")}</p>
            </div>

            {isSuccess ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-md p-4 text-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-500 mx-auto mb-2" />
                <h3 className="font-medium text-green-800 dark:text-green-400">{t("email_sent")}</h3>
                <p className="text-sm text-green-700 dark:text-green-500 mt-1">{t("check_inbox")}</p>
                <Button asChild variant="link" className="mt-2 mx-auto">
                  <Link href="/auth/sign-in">{t("return_to_sign_in")}</Link>
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
                    className="w-full"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-md p-3 text-sm text-red-800 dark:text-red-400">
                    {error}
                  </div>
                )}

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

                <div className="text-center">
                  <Button asChild variant="link" className="text-sm">
                    <Link href="/auth/sign-in">{t("back_to_sign_in")}</Link>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

