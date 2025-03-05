import { createClient } from "@supabase/supabase-js"

// Create a Supabase client
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Sign-in error:", error)
    } else {
      console.log("Sign-in successful:", data)
    }

    return { data, error }
  } catch (err) {
    console.error("Unexpected sign-in error:", err)
    return {
      data: null,
      error: new Error(err instanceof Error ? err.message : "An unexpected error occurred"),
    }
  }
}

export async function signUp(email: string, password: string, fullName: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (!error && data.user) {
      // Create profile
      await supabase.from("profiles").insert({
        id: data.user.id,
        email,
        full_name: fullName,
      })
    }

    return { data, error }
  } catch (err) {
    console.error("Unexpected sign-up error:", err)
    return {
      data: null,
      error: new Error(err instanceof Error ? err.message : "An unexpected error occurred"),
    }
  }
}

export async function signOut() {
  try {
    // Clear any local storage items related to session
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentCompanyId")
    }

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (err) {
    console.error("Unexpected sign-out error:", err)
    return {
      error: new Error(err instanceof Error ? err.message : "An unexpected error occurred"),
    }
  }
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  return { error }
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({
    password,
  })
  return { error }
}

