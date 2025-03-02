-- Migration: 000002_create_item_functions
-- Description: Creates functions for managing item quantities
-- Created at: 2025-03-02

-- Create function to update item quantity
CREATE OR REPLACE FUNCTION update_item_quantity(p_item_id BIGINT, p_quantity INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE items
    SET current_quantity = current_quantity + p_quantity
    WHERE id = p_item_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate stock quantity
CREATE OR REPLACE FUNCTION validate_stock_quantity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'stock_out' THEN
        -- Check if there's enough stock
        IF (SELECT current_quantity FROM items WHERE id = NEW.item_id) < NEW.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for item %', NEW.item_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stock validation
CREATE TRIGGER check_stock_quantity
    BEFORE INSERT ON stock_transactions
    FOR EACH ROW
    EXECUTE FUNCTION validate_stock_quantity();

-- Rollback SQL (commented out for reference)
/*
DROP TRIGGER IF EXISTS check_stock_quantity ON stock_transactions;
DROP FUNCTION IF EXISTS validate_stock_quantity();
DROP FUNCTION IF EXISTS update_item_quantity(BIGINT, INTEGER);
*/

