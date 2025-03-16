import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function fixUsers() {
  console.log("🔧 Fixing user data...")

  // Get all auth users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error("❌ Could not fetch auth users:", authError.message)
    return
  }

  console.log(`Found ${authUsers.users.length} users in auth.users`)

  for (const user of authUsers.users) {
    console.log(`Processing user ${user.id} (${user.email})`)

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError || !profile) {
      console.log(`Creating missing profile for user ${user.id}`)

      // Create profile
      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata.full_name || user.email?.split("@")[0] || "User",
      })

      if (insertError) {
        console.error(`❌ Error creating profile for ${user.id}:`, insertError.message)
      } else {
        console.log(`✅ Created profile for ${user.id}`)
      }
    } else {
      console.log(`✅ Profile exists for ${user.id}`)
    }

    // Check if user has a team
    const { data: teamUsers, error: teamError } = await supabase
      .from("team_users")
      .select("team_id")
      .eq("user_id", user.id)

    if (teamError || !teamUsers || teamUsers.length === 0) {
      console.log(`Creating default team for user ${user.id}`)

      // Generate a unique slug for the team
      const teamSlug = `team-${Math.random().toString(36).substring(2, 10)}`

      // Create a default team
      const { data: team, error: teamCreateError } = await supabase
        .from("teams")
        .insert({
          name: `${profile?.full_name || "User"}'s Team`,
          slug: teamSlug,
          description: "Default team created by fix script",
          created_by: user.id,
        })
        .select()
        .single()

      if (teamCreateError || !team) {
        console.error(`❌ Error creating team for ${user.id}:`, teamCreateError?.message)
      } else {
        console.log(`✅ Created team ${team.id} for ${user.id}`)

        // Associate user with team
        const { error: teamUserError } = await supabase.from("team_users").insert({
          team_id: team.id,
          user_id: user.id,
          role: "admin",
        })

        if (teamUserError) {
          console.error(`❌ Error associating user ${user.id} with team:`, teamUserError.message)
        } else {
          console.log(`✅ Associated user ${user.id} with team ${team.id}`)
        }

        // Set as active team
        const { error: activeTeamError } = await supabase.from("active_team").upsert({
          user_id: user.id,
          team_id: team.id,
        })

        if (activeTeamError) {
          console.error(`❌ Error setting active team for ${user.id}:`, activeTeamError.message)
        } else {
          console.log(`✅ Set active team for ${user.id}`)
        }
      }
    } else {
      console.log(`✅ User ${user.id} has ${teamUsers.length} teams`)
    }
  }

  console.log("✅ User fix process completed")
}

async function main() {
  try {
    await fixUsers()
  } catch (error) {
    console.error("Error fixing users:", error)
  }
}

main()

