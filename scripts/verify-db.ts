import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyDatabase() {
  console.log("🔍 Verifying database structure...")

  // Check if tables exist
  const tables = [
    "profiles",
    "teams",
    "team_users",
    "active_team",
    "categories",
    "locations",
    "suppliers",
    "items",
    "item_locations",
    "stock_transactions",
    "audit_logs",
    "team_settings",
  ]

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("count(*)", { count: "exact", head: true })

    if (error) {
      console.error(`❌ Table ${table} does not exist or is not accessible:`, error.message)
    } else {
      console.log(`✅ Table ${table} exists with ${data} rows`)
    }
  }

  // Check if triggers exist
  const { data: triggers, error: triggerError } = await supabase.rpc("get_triggers")

  if (triggerError) {
    console.error("❌ Could not check triggers:", triggerError.message)
  } else {
    const expectedTriggers = ["after_auth_user_created", "after_team_created"]

    for (const trigger of expectedTriggers) {
      const found = triggers.some((t: any) => t.trigger_name === trigger)
      if (found) {
        console.log(`✅ Trigger ${trigger} exists`)
      } else {
        console.error(`❌ Trigger ${trigger} does not exist`)
      }
    }
  }

  // Check auth users and profiles consistency
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error("❌ Could not fetch auth users:", authError.message)
  } else {
    console.log(`Found ${authUsers.users.length} users in auth.users`)

    for (const user of authUsers.users) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error(`❌ User ${user.id} (${user.email}) has no matching profile:`, profileError.message)
      } else {
        console.log(`✅ User ${user.id} (${user.email}) has a matching profile`)
      }
    }
  }
}

// Create the get_triggers function if it doesn't exist
async function createHelperFunctions() {
  const { error } = await supabase.rpc("create_helper_functions", {})

  if (error) {
    console.error("Could not create helper functions:", error.message)
  }
}

async function main() {
  try {
    await createHelperFunctions()
    await verifyDatabase()
  } catch (error) {
    console.error("Error verifying database:", error)
  }
}

main()

