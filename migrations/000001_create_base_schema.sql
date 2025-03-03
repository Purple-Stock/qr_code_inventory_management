-- Migration: 000001_create_base_schema
-- Description: Creates the initial schema with core tables and types
-- Created at: 2025-03-02

-- Drop tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS stock_transactions CASCADE;
DROP TABLE IF EXISTS item_locations CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TYPE IF EXISTS stock_transaction_type CASCADE;

-- Create custom types
CREATE TYPE stock_transaction_type AS ENUM ('stock_in', 'stock_out', 'adjust', 'move');

-- Create categories table
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT unique_category_name UNIQUE (name)
);

-- Create locations table
CREATE TABLE locations (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    parent_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT unique_location_name UNIQUE (name)
);

-- Add suppliers table after locations table
CREATE TABLE suppliers (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  CONSTRAINT unique_supplier_name UNIQUE (name),
  CONSTRAINT unique_supplier_code UNIQUE (code)
);

-- Create items table with proper relationships
CREATE TABLE items (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    barcode TEXT,
    cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    brand TEXT,
    minimum_quantity INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true NOT NULL,
    CONSTRAINT positive_cost CHECK (cost >= 0),
    CONSTRAINT positive_price CHECK (price >= 0),
    CONSTRAINT positive_minimum_quantity CHECK (minimum_quantity >= 0)
);

-- Create item_locations table for tracking stock at different locations
CREATE TABLE item_locations (
    item_id BIGINT REFERENCES items(id) ON DELETE CASCADE,
    location_id BIGINT REFERENCES locations(id) ON DELETE CASCADE,
    current_quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (item_id, location_id),
    CONSTRAINT positive_quantity CHECK (current_quantity >= 0)
);

-- Create stock_transactions table with enhanced tracking
CREATE TABLE stock_transactions (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    item_id BIGINT REFERENCES items(id) ON DELETE CASCADE,
    type stock_transaction_type NOT NULL,
    quantity INTEGER NOT NULL,
    from_location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    to_location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    memo TEXT,
    reference_number TEXT,
    supplier TEXT,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    CONSTRAINT positive_transaction_quantity CHECK (quantity > 0),
    CONSTRAINT valid_transaction_locations CHECK (
        (type = 'stock_in' AND from_location_id IS NULL AND to_location_id IS NOT NULL) OR
        (type = 'stock_out' AND from_location_id IS NOT NULL AND to_location_id IS NULL) OR
        (type = 'move' AND from_location_id IS NOT NULL AND to_location_id IS NOT NULL) OR
        (type = 'adjust' AND from_location_id IS NULL AND to_location_id IS NOT NULL)
    )
);

-- Add supplier_id to stock_transactions table
ALTER TABLE stock_transactions 
ADD COLUMN supplier_id BIGINT REFERENCES suppliers(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_items_sku ON items(sku);
CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_items_barcode ON items(barcode);
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_brand ON items(brand);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_locations_parent ON locations(parent_id);
CREATE INDEX idx_stock_transactions_item ON stock_transactions(item_id);
CREATE INDEX idx_stock_transactions_locations ON stock_transactions(from_location_id, to_location_id);
CREATE INDEX idx_stock_transactions_date ON stock_transactions(created_at);
CREATE INDEX idx_stock_transactions_type ON stock_transactions(type);
CREATE INDEX idx_item_locations_item ON item_locations(item_id);
CREATE INDEX idx_item_locations_location ON item_locations(location_id);
-- Create index for supplier lookups
CREATE INDEX idx_stock_transactions_supplier ON stock_transactions(supplier_id);

-- Insert default data
INSERT INTO categories (name, description) 
VALUES ('Default', 'Default category for uncategorized items');

INSERT INTO locations (name, description) 
VALUES ('Default', 'Default location for items');

-- Function to recreate the schema
CREATE OR REPLACE FUNCTION recreate_schema() 
RETURNS void AS $$
BEGIN
    -- Drop existing tables
    DROP TABLE IF EXISTS stock_transactions CASCADE;
    DROP TABLE IF EXISTS item_locations CASCADE;
    DROP TABLE IF EXISTS items CASCADE;
    DROP TABLE IF EXISTS categories CASCADE;
    DROP TABLE IF EXISTS locations CASCADE;
    DROP TABLE IF EXISTS suppliers CASCADE;
    DROP TYPE IF EXISTS stock_transaction_type CASCADE;
    
    -- Recreate tables (this will call the migration again)
    \i migrations/000001_create_base_schema.sql
END;
$$ LANGUAGE plpgsql;

-- Command to recreate schema:
-- SELECT recreate_schema();

-- Rollback SQL
/*
DROP FUNCTION IF EXISTS recreate_schema();
DROP TABLE IF EXISTS stock_transactions CASCADE;
DROP TABLE IF EXISTS item_locations CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TYPE IF EXISTS stock_transaction_type CASCADE;
*/

