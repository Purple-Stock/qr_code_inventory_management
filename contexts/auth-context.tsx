"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import type { Company } from "@/types/database"

interface AuthContextType {
  user: User | null
  profile: any | null
  companies: Company[]
  currentCompany: Company | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any; data: any }>
  signOut: () => Promise<void>
  createCompany: (name: string) => Promise<{ error: any; company: Company | null }>
  switchCompany: (companyId: number) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchUserData(session.user.id)
      } else {
        setProfile(null)
        setCompanies([])
        setCurrentCompany(null)
      }

      setIsLoading(false)
    })

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        fetchUserData(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchUserData(userId: string) {
    try {
      // Fetch user profile
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", userId).single()

      setProfile(profileData)

      // Fetch user's companies
      const { data: companyUsers } = await supabase
        .from("company_users")
        .select(`
          company_id,
          role,
          companies:company_id (*)
        `)
        .eq("user_id", userId)

      if (companyUsers && companyUsers.length > 0) {
        const userCompanies = companyUsers.map((cu) => cu.companies as Company)
        setCompanies(userCompanies)

        // Get current company from localStorage or use the first one
        const storedCompanyId = localStorage.getItem("currentCompanyId")
        const initialCompany = storedCompanyId
          ? userCompanies.find((c) => c.id === Number.parseInt(storedCompanyId))
          : userCompanies[0]

        if (initialCompany) {
          setCurrentCompany(initialCompany)
          localStorage.setItem("currentCompanyId", initialCompany.id.toString())
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) {
      router.push("/dashboard")
    }
    return { error }
  }

  async function signUp(email: string, password: string, fullName: string) {
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
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  async function createCompany(name: string) {
    if (!user) return { error: new Error("User not authenticated"), company: null }

    // Generate slug from company name
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")

    // Create company
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({ name, slug })
      .select()
      .single()

    if (companyError) return { error: companyError, company: null }

    // Associate user with company
    const { error: userCompanyError } = await supabase.from("company_users").insert({
      company_id: company.id,
      user_id: user.id,
      role: "admin",
    })

    if (userCompanyError) return { error: userCompanyError, company: null }

    // Update local state
    setCompanies([...companies, company])
    setCurrentCompany(company)
    localStorage.setItem("currentCompanyId", company.id.toString())

    return { error: null, company }
  }

  async function switchCompany(companyId: number) {
    const company = companies.find((c) => c.id === companyId)
    if (company) {
      setCurrentCompany(company)
      localStorage.setItem("currentCompanyId", company.id.toString())
      router.refresh()
    }
  }

  const value = {
    user,
    profile,
    companies,
    currentCompany,
    isLoading,
    signIn,
    signUp,
    signOut,
    createCompany,
    switchCompany,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

