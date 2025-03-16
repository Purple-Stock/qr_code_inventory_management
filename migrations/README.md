# Database Migrations

This folder contains all database migrations for the Purple Stock application. Migrations are numbered in sequence and should be applied in order.

## Migration Files

1. **000001_create_team_based_schema.sql**  
   - Creates the initial schema with teams as the top-level entity.
   - Sets up all core tables and relationships (profiles, teams, team_users, active_team, categories, locations, suppliers, items, item_locations, stock_transactions, audit_logs, and team_settings).
   - Establishes indexes for performance.

2. **000002_create_functions_and_triggers.sql**  
   - Creates functions for automatic timestamp updates.
   - Sets up triggers for inventory quantity management.
   - Implements audit logging functionality.

3. **000003_setup_rls_policies.sql**  
   - Enables Row Level Security (RLS) on all tables.
   - Creates helper functions for permission checks.
   - Sets up RLS policies for each table based on team membership and roles.
   - Provides an API function for setting the active team.

4. **000004_create_views.sql**  
   - Creates views for reporting and analysis.
   - Provides summaries for inventory valuation, stock levels, transaction history, low stock alerts, out-of-stock items, inventory turnover, item stock summary, and location history.

5. **000005_create_default_data.sql**  
   - Creates default data for new teams and profiles.
   - When a new profile is inserted, a default team is created and linked to that profile.
   - An AFTER INSERT trigger on teams automatically creates a default location, default categories, and default team settings.

6. **000006_location_history_tracking.sql**  
   - Enhances stock transactions with value tracking.
   - Implements functions to retrieve the current location of an item.
   - Implements functions to calculate the historical value of an item based on its transactions.
   - Creates an index to improve location history queries.

## How to Apply Migrations

### Option 1: Using the Supabase Dashboard

1. Log in to your Supabase dashboard.
2. Navigate to the SQL Editor.
3. Copy and paste the contents of each migration file in sequence.
4. Execute each migration one by one.

### Option 2: Using the Migration Script

1. Clone or download the repository containing these migration files.
2. Set your Supabase URL and Service Role key as environment variables in your terminal:
   ```bash
   export SUPABASE_URL="https://your-project-ref.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```
3. Use your preferred SQL client or command-line tool (e.g., psql) to connect to your Supabase Postgres database.
4. Execute the migrations in order:
   ```bash
   psql $SUPABASE_URL -U postgres -f path/to/000001_create_team_based_schema.sql
   psql $SUPABASE_URL -U postgres -f path/to/000002_create_functions_and_triggers.sql
   psql $SUPABASE_URL -U postgres -f path/to/000003_setup_rls_policies.sql
   psql $SUPABASE_URL -U postgres -f path/to/000004_create_views.sql
   psql $SUPABASE_URL -U postgres -f path/to/000005_create_default_data.sql
   psql $SUPABASE_URL -U postgres -f path/to/000006_location_history_tracking.sql
   ```

Note: Ensure that the migrations are applied in sequence. Any changes to the migration files (such as dropping and re-creating functions) must be tested in a development environment before deploying to production.

Happy migrating!

