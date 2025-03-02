-- Migration: 000001_create_initial_tables
-- Description: Creates the initial tables for items and stock transactions
-- Created at: 2025-03-02

-- Create items table
CREATE TABLE IF NOT EXISTS items (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    barcode TEXT,
    cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    type TEXT,
    brand TEXT,
    location TEXT NOT NULL DEFAULT 'default',
    initial_quantity INTEGER NOT NULL DEFAULT 0,
    current_quantity INTEGER NOT NULL DEFAULT 0
);

-- Create stock_transactions table
CREATE TABLE IF NOT EXISTS stock_transactions (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    item_id BIGINT REFERENCES items(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('stock_in', 'stock_out', 'adjust')),
    quantity INTEGER NOT NULL,
    memo TEXT,
    location TEXT NOT NULL DEFAULT 'default',
    supplier TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_items_sku ON items(sku);
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
CREATE INDEX IF NOT EXISTS idx_items_barcode ON items(barcode);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_item_id ON stock_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_created_at ON stock_transactions(created_at);

-- Rollback SQL (commented out for reference)
/*
DROP TABLE IF EXISTS stock_transactions;
DROP TABLE IF EXISTS items;
*/

