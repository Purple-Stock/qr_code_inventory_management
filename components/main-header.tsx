"use client"

import { Package, Zap, Globe, Download, LogOut, User, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { usePWAInstall } from "@/hooks/use-pwa-install"
import { useRouter, usePathname } from "next/navigation"
import { ClientSearchParams } from "@/hooks/use-safe-search-params"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Database } from "@/types/database"
import { useTeam } from '@/contexts/team-context'
import { ClientOnly } from "@/components/client-only"

interface TeamData {
  team: {
    id: number
    name: string
    description: string | null
    logo_url: string | null
  } | null
}

interface Team {
  id: number
  name: string
  description: string | null
  logo_url: string | null
}

export function MainHeader() {
  const { t, setLanguage } = useLanguage()
  const { isInstallable, install } = usePWAInstall()
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()
  const [isLoggingOutState, setIsLoggingOut] = useState(false)
  const pathname = usePathname()
  const [isLoggingOutFromParams, setIsLoggingOutFromParams] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const { activeTeam, setActiveTeam } = useTeam()
  const [loading, setLoading] = useState(true)
  const shouldHideHeader = isLoggingOutFromParams || isLoggingOutState || pathname.includes("/auth/")

  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // First, get all teams
      const { data: teamData, error: teamsError } = await supabase
        .from('team_users')
        .select(`
          team:teams (
            id,
            name,
            description,
            logo_url
          )
        `)
        .eq('user_id', user.id)

      if (teamsError) throw teamsError

      // Safely transform the team data
      const userTeams = (teamData as TeamData[])
        .map(t => t.team)
        .filter((team): team is Team => team !== null)

      setTeams(userTeams)

      // Then, get active team
      const { data: activeTeamData, error: activeTeamError } = await supabase
        .from('active_team')
        .select('team_id')
        .eq('user_id', user.id)
        .single()

      if (activeTeamError && activeTeamError.code !== 'PGRST116') throw activeTeamError

      if (activeTeamData?.team_id) {
        const active = userTeams.find(t => t.id === activeTeamData.team_id)
        if (active) {
          setActiveTeam(active)
        } else if (userTeams.length > 0) {
          setActiveTeam(userTeams[0])
        }
      } else if (userTeams.length > 0) {
        setActiveTeam(userTeams[0])
        const { error: setActiveError } = await supabase.rpc('set_active_team', {
          team_id: userTeams[0].id
        })
        if (setActiveError) throw setActiveError
      }
    } catch (error) {
      console.error('Error loading teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTeamChange = async (team: Team) => {
    try {
      await setActiveTeam(team)
    } catch (error) {
      console.error('Error changing team:', error)
      // Show error toast
    }
  }

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true)
      await supabase.auth.signOut()
      router.refresh()
      router.push("/auth/sign-in?logout=true")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <ClientOnly>
      <ClientSearchParams fallback={null}>
        {(searchParams) => {
          const isLogoutParam = searchParams?.get("logout") === "true"
          if (isLogoutParam !== isLoggingOutFromParams) {
            setIsLoggingOutFromParams(isLogoutParam)
          }
          
          if (shouldHideHeader) {
            return null
          }

          return (
            <header
              suppressHydrationWarning
              className="fixed top-0 left-0 right-0 z-50 glass-effect"
            >
              <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold transition-transform hover:scale-105">
                  <div className="relative">
                    <Package className="h-8 w-8 text-primary" />
                    <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary animate-pulse" />
                  </div>
                  <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                    PURPLE STOCK
                  </span>
                </Link>

                {/* Team Selector Dropdown */}
                {!loading && teams.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="ml-4 flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {activeTeam?.name || t("select_team")}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {teams.map((team) => (
                        <DropdownMenuItem
                          key={team.id}
                          onClick={() => handleTeamChange(team)}
                          className={activeTeam?.id === team.id ? "bg-primary/10" : ""}
                        >
                          {team.name}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/teams/create">+ {t("create_team")}</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Rest of the header content */}
                <div className="ml-auto flex items-center gap-3">
                  {isInstallable && (
                    <Button variant="outline" size="sm" onClick={install} className="flex items-center gap-2 gradient-border">
                      <Download className="h-4 w-4" />
                      {t("install_app")}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" asChild className="gradient-border">
                    <Link href="/settings" className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      {t("Assinar")}
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="gradient-border hidden sm:flex">
                    {t("user_guide")}
                  </Button>
                  <div className="flex items-center gap-2 pl-2 border-l border-border">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors">
                          <Globe className="h-4 w-4" />
                          <span className="sr-only">Toggle language</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setLanguage("en")}>{t("english")}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLanguage("pt")}>{t("portuguese")}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <ThemeToggle />

                    {/* User Profile and Logout Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="cursor-pointer">
                            {t("profile")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={handleSignOut}
                          disabled={isLoggingOutState}
                          className="text-destructive focus:text-destructive cursor-pointer"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          {isLoggingOutState ? t("logging_out") : t("logout")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </header>
          )
        }}
      </ClientSearchParams>
    </ClientOnly>
  )
}

