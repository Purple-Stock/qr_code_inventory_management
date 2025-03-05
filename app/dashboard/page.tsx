import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function DashboardPage() {
  // Server-side session verification
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/sign-in")
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="bg-card rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Welcome, {session.user.email}</h2>
        <p className="text-muted-foreground">You are now signed in to your account.</p>
      </div>
    </div>
  )
}

