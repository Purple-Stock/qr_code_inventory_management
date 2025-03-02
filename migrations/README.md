# Database Migrations

This folder contains all database migrations for the Purple Stock application. Migrations are numbered in sequence and should be applied in order.

## Migration Files

- `000001_create_initial_tables.sql`: Creates the initial schema with items and stock_transactions tables
- `000002_create_item_functions.sql`: Creates functions and triggers for managing item quantities
- `000003_setup_rls.sql`: Sets up Row Level Security policies
- `000004_add_audit_timestamps.sql`: Adds audit timestamps and triggers

## How to Apply Migrations

1. Connect to your Supabase database using psql or the Supabase dashboard SQL editor
2. Run each migration file in sequence
3. Verify the changes after each migration

## Rollback

Each migration file includes commented rollback SQL at the bottom. To rollback:

1. Locate the migration you want to rollback to
2. Execute the rollback SQL statements in reverse order
3. Verify the database state after rollback

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

