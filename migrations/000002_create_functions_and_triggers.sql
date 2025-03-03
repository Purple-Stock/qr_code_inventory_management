-- Migration: 000002_create_functions_and_triggers
-- Description: Creates functions and triggers for managing inventory
-- Created at: 2025-03-02

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_transactions_updated_at
    BEFORE UPDATE ON stock_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_item_locations_updated_at
    BEFORE UPDATE ON item_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to update item quantity
CREATE OR REPLACE FUNCTION update_item_quantity()
RETURNS TRIGGER AS $$
BEGIN
    -- For stock in
    IF NEW.type = 'stock_in' THEN
        INSERT INTO item_locations (item_id, location_id, current_quantity)
        VALUES (NEW.item_id, NEW.to_location_id, NEW.quantity)
        ON CONFLICT (item_id, location_id)
        DO UPDATE SET current_quantity = item_locations.current_quantity + NEW.quantity;
        
    -- For stock out
    ELSIF NEW.type = 'stock_out' THEN
        UPDATE item_locations
        SET current_quantity = current_quantity - NEW.quantity
        WHERE item_id = NEW.item_id AND location_id = NEW.from_location_id;
        
    -- For stock move
    ELSIF NEW.type = 'move' THEN
        -- Decrease from source location
        UPDATE item_locations
        SET current_quantity = current_quantity - NEW.quantity
        WHERE item_id = NEW.item_id AND location_id = NEW.from_location_id;
        
        -- Increase at destination location
        INSERT INTO item_locations (item_id, location_id, current_quantity)
        VALUES (NEW.item_id, NEW.to_location_id, NEW.quantity)
        ON CONFLICT (item_id, location_id)
        DO UPDATE SET current_quantity = item_locations.current_quantity + NEW.quantity;
        
    -- For stock adjust
    ELSIF NEW.type = 'adjust' THEN
        INSERT INTO item_locations (item_id, location_id, current_quantity)
        VALUES (NEW.item_id, NEW.to_location_id, NEW.quantity)
        ON CONFLICT (item_id, location_id)
        DO UPDATE SET current_quantity = NEW.quantity;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating item quantities
CREATE TRIGGER update_stock_quantity
    AFTER INSERT ON stock_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_item_quantity();

-- Create function to validate stock quantity
CREATE OR REPLACE FUNCTION validate_stock_quantity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type IN ('stock_out', 'move') THEN
        IF NOT EXISTS (
            SELECT 1 
            FROM item_locations 
            WHERE item_id = NEW.item_id 
            AND location_id = NEW.from_location_id
            AND current_quantity >= NEW.quantity
        ) THEN
            RAISE EXCEPTION 'Insufficient stock for item % at location %', 
                NEW.item_id, NEW.from_location_id;
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

-- Create function to initialize item_locations
CREATE OR REPLACE FUNCTION initialize_item_locations()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a record for each active location with 0 quantity
    INSERT INTO item_locations (item_id, location_id, current_quantity)
    SELECT NEW.id, id, 0
    FROM locations
    WHERE is_active = true;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for initializing item_locations
CREATE TRIGGER initialize_item_locations
    AFTER INSERT ON items
    FOR EACH ROW
    EXECUTE FUNCTION initialize_item_locations();

-- Rollback SQL
/*
DROP TRIGGER IF EXISTS update_items_updated_at ON items;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
DROP TRIGGER IF EXISTS update_stock_transactions_updated_at ON stock_transactions;
DROP TRIGGER IF EXISTS update_item_locations_updated_at ON item_locations;
DROP TRIGGER IF EXISTS update_stock_quantity ON stock_transactions;
DROP TRIGGER IF EXISTS check_stock_quantity ON stock_transactions;
DROP TRIGGER IF EXISTS initialize_item_locations ON items;

DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_item_quantity();
DROP FUNCTION IF EXISTS validate_stock_quantity();
DROP FUNCTION IF EXISTS initialize_item_locations();
*/

