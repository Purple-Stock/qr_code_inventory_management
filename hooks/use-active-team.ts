import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useActiveTeam() {
  const [activeTeamId, setActiveTeamId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadActiveTeam() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('active_team')
          .select('team_id')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error
        setActiveTeamId(data?.team_id || null)
      } catch (error) {
        console.error('Error loading active team:', error)
      } finally {
        setLoading(false)
      }
    }

    loadActiveTeam()
  }, [])

  return { activeTeamId, loading }
} 