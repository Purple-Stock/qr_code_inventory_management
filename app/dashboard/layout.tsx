import type React from "react"
import { CompanySwitcher } from "@/components/company-switcher"
import { MainHeader } from "@/components/main-header"
import { AuthProvider } from "@/contexts/auth-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <MainHeader>
          <CompanySwitcher />
        </MainHeader>
        <div className="flex-1 p-8">{children}</div>
      </div>
    </AuthProvider>
  )
}

