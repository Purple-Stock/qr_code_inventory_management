-- Migration: 000004_setup_rls_policies
-- Description: Sets up Row Level Security policies
-- Created at: 2025-03-02

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for development (allowing all operations)
CREATE POLICY "Enable all access for all users" ON categories
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access for all users" ON locations
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access for all users" ON items
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access for all users" ON item_locations
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access for all users" ON stock_transactions
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Note: In production, you would replace these policies with more restrictive ones
-- based on user roles and permissions. For example:
/*
CREATE POLICY "Users can view their assigned locations"
    ON locations
    FOR SELECT
    TO authenticated
    USING (id IN (
        SELECT location_id 
        FROM user_locations 
        WHERE user_id = auth.uid()
    ));
*/

-- Rollback SQL
/*
DROP POLICY IF EXISTS "Enable all access for all users" ON categories;
DROP POLICY IF EXISTS "Enable all access for all users" ON locations;
DROP POLICY IF EXISTS "Enable all access for all users" ON items;
DROP POLICY IF EXISTS "Enable all access for all users" ON item_locations;
DROP POLICY IF EXISTS "Enable all access for all users" ON stock_transactions;

ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
ALTER TABLE item_locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions DISABLE ROW LEVEL SECURITY;
*/

