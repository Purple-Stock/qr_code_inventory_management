-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON items;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON stock_transactions;

-- Create new policies that allow all operations for all users (for development)
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

-- Enable RLS on tables
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;

