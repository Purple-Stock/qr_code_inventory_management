"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'

interface Team {
  id: number
  name: string
  description: string | null
  logo_url: string | null
}

interface TeamContextType {
  activeTeam: Team | null
  setActiveTeam: (team: Team | null) => Promise<void>
  isLoading: boolean
}

const TeamContext = createContext<TeamContextType | null>(null)

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [activeTeam, setActiveTeamState] = useState<Team | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    loadActiveTeam()
  }, [])

  const loadActiveTeam = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: activeTeamData, error: activeTeamError } = await supabase
        .from('active_team')
        .select(`
          team:teams (
            id,
            name,
            description,
            logo_url
          )
        `)
        .eq('user_id', user.id)
        .single()

      if (activeTeamError && activeTeamError.code !== 'PGRST116') {
        throw activeTeamError
      }

      if (activeTeamData?.team) {
        setActiveTeamState(activeTeamData.team as Team)
      }
    } catch (error) {
      console.error('Error loading active team:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const setActiveTeam = async (team: Team | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (team) {
        const { error } = await supabase.rpc('set_active_team', {
          team_id: team.id
        })
        if (error) throw error
      }

      setActiveTeamState(team)
      
      // Trigger a page refresh to update data
      window.location.reload()
    } catch (error) {
      console.error('Error setting active team:', error)
      throw error
    }
  }

  return (
    <TeamContext.Provider value={{ activeTeam, setActiveTeam, isLoading }}>
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider')
  }
  return context
} 