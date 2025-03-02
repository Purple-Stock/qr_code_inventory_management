-- Migration: 000003_setup_rls
-- Description: Sets up Row Level Security policies
-- Created at: 2025-03-02

-- Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable all access for all users" ON items;
DROP POLICY IF EXISTS "Enable all access for all users" ON stock_transactions;

-- Create policies that allow all operations for all users (for development)
CREATE POLICY "Enable all access for all users" ON items
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access for all users" ON stock_transactions
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Rollback SQL (commented out for reference)
/*
DROP POLICY IF EXISTS "Enable all access for all users" ON stock_transactions;
DROP POLICY IF EXISTS "Enable all access for all users" ON items;
ALTER TABLE stock_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
*/

