-- Migration: 000004_add_audit_timestamps
-- Description: Adds updated_at columns with triggers
-- Created at: 2025-03-02

-- Add updated_at column to both tables
ALTER TABLE items 
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE stock_transactions 
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE;

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_transactions_updated_at
    BEFORE UPDATE ON stock_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update existing rows to set updated_at
UPDATE items SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE stock_transactions SET updated_at = created_at WHERE updated_at IS NULL;

-- Make updated_at not nullable
ALTER TABLE items 
    ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE stock_transactions 
    ALTER COLUMN updated_at SET NOT NULL;

-- Rollback SQL (commented out for reference)
/*
DROP TRIGGER IF EXISTS update_stock_transactions_updated_at ON stock_transactions;
DROP TRIGGER IF EXISTS update_items_updated_at ON items;
DROP FUNCTION IF EXISTS update_updated_at_column();
ALTER TABLE stock_transactions DROP COLUMN IF EXISTS updated_at;
ALTER TABLE items DROP COLUMN IF EXISTS updated_at;
*/

