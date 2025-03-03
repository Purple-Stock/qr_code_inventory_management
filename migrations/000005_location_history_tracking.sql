-- Migration: 000005_location_history_tracking
-- Description: Enhances stock transactions with value tracking and improves location history
-- Created at: 2025-03-02

-- Add unit_cost to stock_transactions if it doesn't exist
ALTER TABLE stock_transactions 
ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(10,2);

-- Add created_by to stock_transactions if it doesn't exist
ALTER TABLE stock_transactions 
ADD COLUMN IF NOT EXISTS created_by TEXT;

-- Create a view for location history with value calculations
CREATE OR REPLACE VIEW location_history_view AS
SELECT 
    st.id,
    st.created_at,
    st.item_id,
    st.type,
    st.quantity,
    st.from_location_id,
    st.to_location_id,
    st.memo,
    st.created_by,
    COALESCE(st.unit_cost, i.cost) AS unit_cost,
    (COALESCE(st.unit_cost, i.cost) * st.quantity) AS total_value,
    fl.name AS from_location_name,
    tl.name AS to_location_name,
    i.name AS item_name,
    i.sku AS item_sku
FROM 
    stock_transactions st
JOIN 
    items i ON st.item_id = i.id
LEFT JOIN 
    locations fl ON st.from_location_id = fl.id
LEFT JOIN 
    locations tl ON st.to_location_id = tl.id
ORDER BY 
    st.created_at DESC;

-- Create a function to get the current location of an item
CREATE OR REPLACE FUNCTION get_item_current_location(p_item_id BIGINT)
RETURNS TABLE (
    location_id BIGINT,
    location_name TEXT,
    quantity INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        il.location_id,
        l.name AS location_name,
        il.current_quantity AS quantity,
        il.updated_at AS last_updated
    FROM 
        item_locations il
    JOIN 
        locations l ON il.location_id = l.id
    WHERE 
        il.item_id = p_item_id
        AND il.current_quantity > 0
    ORDER BY 
        il.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to calculate the value history of an item
CREATE OR REPLACE FUNCTION calculate_item_value_history(p_item_id BIGINT)
RETURNS TABLE (
    transaction_id BIGINT,
    transaction_date TIMESTAMP WITH TIME ZONE,
    transaction_type TEXT,
    location_id BIGINT,
    location_name TEXT,
    quantity INTEGER,
    unit_cost DECIMAL(10,2),
    total_value DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        st.id AS transaction_id,
        st.created_at AS transaction_date,
        st.type AS transaction_type,
        COALESCE(st.to_location_id, st.from_location_id) AS location_id,
        COALESCE(tl.name, fl.name) AS location_name,
        st.quantity,
        COALESCE(st.unit_cost, i.cost) AS unit_cost,
        (COALESCE(st.unit_cost, i.cost) * st.quantity) AS total_value
    FROM 
        stock_transactions st
    JOIN 
        items i ON st.item_id = i.id
    LEFT JOIN 
        locations tl ON st.to_location_id = tl.id
    LEFT JOIN 
        locations fl ON st.from_location_id = fl.id
    WHERE 
        st.item_id = p_item_id
    ORDER BY 
        st.created_at;
END;
$$ LANGUAGE plpgsql;

-- Create an index to improve location history queries
CREATE INDEX IF NOT EXISTS idx_stock_transactions_item_location ON stock_transactions(item_id, from_location_id, to_location_id);

-- Rollback SQL
/*
DROP FUNCTION IF EXISTS calculate_item_value_history(BIGINT);
DROP FUNCTION IF EXISTS get_item_current_location(BIGINT);
DROP VIEW IF EXISTS location_history_view;
*/

