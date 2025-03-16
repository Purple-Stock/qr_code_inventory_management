import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigrations() {
  console.log("🚀 Applying migrations...")

  const migrationsDir = path.join(process.cwd(), "migrations")
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort() // Ensure files are processed in order

  for (const file of migrationFiles) {
    console.log(`Processing migration: ${file}`)
    const filePath = path.join(migrationsDir, file)
    const sql = fs.readFileSync(filePath, "utf8")

    try {
      // Execute the SQL
      const { error } = await supabase.rpc("exec_sql", { sql_query: sql })

      if (error) {
        console.error(`❌ Error applying migration ${file}:`, error.message)
      } else {
        console.log(`✅ Successfully applied migration: ${file}`)
      }
    } catch (error) {
      console.error(`❌ Exception applying migration ${file}:`, error)
    }
  }
}

// Create the exec_sql function if it doesn't exist
async function createExecSqlFunction() {
  const createFunctionSql = `
  CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
  RETURNS VOID AS $$
  BEGIN
    EXECUTE sql_query;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  `

  const { error } = await supabase.rpc("exec_sql", { sql_query: createFunctionSql })

  if (error) {
    // Function might not exist yet, try direct SQL
    const { error: directError } = await supabase.sql(createFunctionSql)

    if (directError) {
      console.error("Could not create exec_sql function:", directError.message)
      throw directError
    }
  }
}

// Create the helper functions
async function createHelperFunctions() {
  const createFunctionSql = `
  CREATE OR REPLACE FUNCTION get_triggers()
  RETURNS TABLE (
    trigger_name TEXT,
    event_manipulation TEXT,
    event_object_schema TEXT,
    event_object_table TEXT,
    action_statement TEXT
  ) AS $$
  BEGIN
    RETURN QUERY
    SELECT 
      trigger_name::TEXT,
      event_manipulation::TEXT,
      event_object_schema::TEXT,
      event_object_table::TEXT,
      action_statement::TEXT
    FROM information_schema.triggers;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  `

  const { error } = await supabase.rpc("exec_sql", { sql_query: createFunctionSql })

  if (error) {
    console.error("Could not create get_triggers function:", error.message)
  }
}

async function main() {
  try {
    await createExecSqlFunction()
    await createHelperFunctions()
    await applyMigrations()
  } catch (error) {
    console.error("Error applying migrations:", error)
  }
}

main()

