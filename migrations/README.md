# Database Migrations

This folder contains all database migrations for the Purple Stock application. Migrations are numbered in sequence and should be applied in order.

## Migration Files

1. `000001_create_base_schema.sql`: Creates the initial schema with core tables
   - Categories table
   - Locations table
   - Items table
   - Item Locations table
   - Stock Transactions table
   - Creates necessary indexes
   - Inserts default category and location

2. `000002_create_functions_and_triggers.sql`: Creates functions and triggers
   - Update timestamps trigger
   - Update item quantity function and trigger
   - Stock validation function and trigger
   - Item locations initialization function and trigger

3. `000003_setup_rls_policies.sql`: Sets up Row Level Security
   - Enables RLS on all tables
   - Creates development policies (all access)
   - Provides template for production policies

4. `000004_create_views.sql`: Creates views for common queries
   - Item stock summary view
   - Transaction history view
   - Stock alerts view

## How to Apply Migrations

1. Connect to your Supabase database using psql or the Supabase dashboard SQL editor
2. Run each migration file in sequence
3. Verify the changes after each migration

## Rollback

Each migration file includes commented rollback SQL at the bottom. To rollback:

1. Locate the migration you want to rollback to
2. Execute the rollback SQL statements in reverse order
3. Verify the database state after rollback

## Key Changes from Previous Schema

1. Added proper category support with hierarchical structure
2. Enhanced location management with hierarchical structure
3. Improved stock tracking with item_locations table
4. Added stock transaction types as ENUM
5. Enhanced audit trail with updated_at timestamps
6. Added views for common queries
7. Improved indexes for better performance
8. Added support for minimum stock levels and alerts
9. Added proper foreign key constraints
10. Added support for item status (active/inactive)

## Creating New Migrations

When creating new migrations:

1. Create a new file with the next sequence number
2. Include a description and creation date in the header comments
3. Include both the migration SQL and rollback SQL
4. Test the migration and rollback before committing

## Naming Convention

Migration files follow the format:
`NNNNNN_description.sql`

Where:
- `NNNNNN` is a 6-digit sequence number
- `description` is a brief description of the migration
- `.sql` is the file extension

Example: `000005_add_user_preferences.sql`

