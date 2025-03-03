-- Migration: 000003_create_views
-- Description: Creates views for common queries
-- Created at: 2025-03-02

-- Create view for item stock summary with category and location info
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
    END AS stock_status,
    i.cost,
    i.price,
    (i.price - i.cost) AS margin,
    (il.current_quantity * i.cost) AS stock_value
FROM 
    items i
    LEFT JOIN categories c ON i.category_id = c.id
    LEFT JOIN item_locations il ON i.id = il.item_id
    LEFT JOIN locations l ON il.location_id = l.id
WHERE 
    i.is_active = true;

-- Create view for transaction history with location names
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
    st.total_cost,
    c.name AS category_name
FROM 
    stock_transactions st
    JOIN items i ON st.item_id = i.id
    LEFT JOIN categories c ON i.category_id = c.id
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
    END AS alert_type,
    i.cost,
    i.price,
    (i.minimum_quantity - il.current_quantity) AS quantity_needed
FROM 
    items i
    LEFT JOIN categories c ON i.category_id = c.id
    LEFT JOIN item_locations il ON i.id = il.item_id
    LEFT JOIN locations l ON il.location_id = l.id
WHERE 
    i.is_active = true 
    AND il.current_quantity <= i.minimum_quantity;

-- Create view for category hierarchy
CREATE OR REPLACE VIEW category_hierarchy AS
WITH RECURSIVE category_tree AS (
    -- Base case: categories without parents
    SELECT 
        id,
        name,
        parent_id,
        1 AS level,
        ARRAY[name] AS path,
        name::text AS full_path
    FROM categories
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- Recursive case: categories with parents
    SELECT 
        c.id,
        c.name,
        c.parent_id,
        ct.level + 1,
        ct.path || c.name,
        ct.full_path || ' > ' || c.name::text
    FROM categories c
    INNER JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT 
    id,
    name,
    parent_id,
    level,
    path,
    full_path
FROM category_tree;

-- Create view for location hierarchy
CREATE OR REPLACE VIEW location_hierarchy AS
WITH RECURSIVE location_tree AS (
    -- Base case: locations without parents
    SELECT 
        id,
        name,
        parent_id,
        1 AS level,
        ARRAY[name] AS path,
        name::text AS full_path
    FROM locations
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- Recursive case: locations with parents
    SELECT 
        l.id,
        l.name,
        l.parent_id,
        lt.level + 1,
        lt.path || l.name,
        lt.full_path || ' > ' || l.name::text
    FROM locations l
    INNER JOIN location_tree lt ON l.parent_id = lt.id
)
SELECT 
    id,
    name,
    parent_id,
    level,
    path,
    full_path
FROM location_tree;

-- Rollback SQL
/*
DROP VIEW IF EXISTS location_hierarchy;
DROP VIEW IF EXISTS category_hierarchy;
DROP VIEW IF EXISTS stock_alerts;
DROP VIEW IF EXISTS transaction_history;
DROP VIEW IF EXISTS item_stock_summary;
*/

