import { createClient } from "@supabase/supabase-js"

// Create a Supabase client
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  return { data, error }
}

export async function signOut() {
  // Clear any local storage items related to session
  localStorage.removeItem("currentCompanyId")

  // Sign out from Supabase
  const { error } = await supabase.auth.signOut()

  return { error }
}

