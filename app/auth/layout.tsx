import type { ReactNode } from "react"

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12">
      <div className="w-full max-w-md space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-6">
          <h1 className="text-3xl font-bold">Purple Stock</h1>
          <h2 className="text-xl text-center text-muted-foreground">Inventory Management System</h2>
        </div>
        {children}
      </div>
    </div>
  )
}

