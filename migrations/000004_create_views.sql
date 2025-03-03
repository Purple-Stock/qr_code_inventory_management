-- Migration: 000004_create_views
-- Description: Creates views for common queries
-- Created at: 2025-03-02

-- Create view for item stock summary
CREATE OR REPLACE VIEW item_stock_summary AS
SELECT 
    i.id AS item_id,
    i.name AS item_name,
    i.sku,
    i.barcode,
    c.name AS category_name,
    l.name AS location_name,
    il.current_quantity,
    i.minimum_quantity,
    CASE 
        WHEN il.current_quantity <= 0 THEN 'out_of_stock'
        WHEN il.current_quantity <= i.minimum_quantity THEN 'low_stock'
        ELSE 'in_stock'
    END AS stock_status
FROM 
    items i
    LEFT JOIN categories c ON i.category_id = c.id
    LEFT JOIN item_locations il ON i.id = il.item_id
    LEFT JOIN locations l ON il.location_id = l.id
WHERE 
    i.is_active = true;

-- Create view for transaction history
CREATE OR REPLACE VIEW transaction_history AS
SELECT 
    st.id,
    st.created_at,
    st.type,
    i.name AS item_name,
    i.sku,
    st.quantity,
    l1.name AS from_location,
    l2.name AS to_location,
    st.memo,
    st.reference_number,
    st.supplier,
    st.unit_cost,
    st.total_cost
FROM 
    stock_transactions st
    JOIN items i ON st.item_id = i.id
    LEFT JOIN locations l1 ON st.from_location_id = l1.id
    LEFT JOIN locations l2 ON st.to_location_id = l2.id
ORDER BY 
    st.created_at DESC;

-- Create view for stock alerts
CREATE OR REPLACE VIEW stock_alerts AS
SELECT 
    i.id AS item_id,
    i.name AS item_name,
    i.sku,
    c.name AS category_name,
    l.name AS location_name,
    il.current_quantity,
    i.minimum_quantity,
    CASE 
        WHEN il.current_quantity <= 0 THEN 'out_of_stock'
        WHEN il.current_quantity <= i.minimum_quantity THEN 'low_stock'
        ELSE 'in_stock'
    END AS alert_type
FROM 
    items i
    LEFT JOIN categories c ON i.category_id = c.id
    LEFT JOIN item_locations il ON i.id = il.item_id
    LEFT JOIN locations l ON il.location_id = l.id
WHERE 
    i.is_active = true 
    AND il.current_quantity <= i.minimum_quantity;

-- Rollback SQL
/*
DROP VIEW IF EXISTS stock_alerts;
DROP VIEW IF EXISTS transaction_history;
DROP VIEW IF EXISTS item_stock_summary;
*/

