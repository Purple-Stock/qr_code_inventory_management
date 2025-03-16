/********************************************************************
 * Migration: 000001_create_team_based_schema
 * Description: Creates the initial schema with teams as the top-level entity
 * Created at: 2025-03-15
 ********************************************************************/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables (order matters)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS team_settings CASCADE;
DROP TABLE IF EXISTS stock_transactions CASCADE;
DROP TABLE IF EXISTS item_locations CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS team_users CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create custom types
CREATE TYPE stock_transaction_type AS ENUM ('stock_in', 'stock_out', 'adjust', 'move', 'count');

-- Create profiles table (this will be our user table, not auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY, -- This should match the Supabase auth user ID if you sync it
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT,
  avatar_url TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  preferences JSONB DEFAULT '{}'::jsonb
);

-- Create teams table (top-level entity)
CREATE TABLE IF NOT EXISTS public.teams (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  tax_id TEXT,
  currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Create team_users junction table
CREATE TABLE IF NOT EXISTS public.team_users (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  team_id INTEGER NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  permissions JSONB DEFAULT '{}'::jsonb,
  UNIQUE(team_id, user_id)
);

-- Create active_team table to track which team is active for each user
CREATE TABLE IF NOT EXISTS public.active_team (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id INTEGER NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  team_id INTEGER NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,
  color TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(team_id, name)
);

-- Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  team_id INTEGER NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  parent_id INTEGER REFERENCES public.locations(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(team_id, name)
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS public.suppliers (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  team_id INTEGER NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  payment_terms TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(team_id, name)
);

-- Create items table
CREATE TABLE IF NOT EXISTS public.items (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  team_id INTEGER NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  barcode TEXT,
  type TEXT,
  brand TEXT,
  model TEXT,
  cost DECIMAL(15, 2) DEFAULT 0,
  price DECIMAL(15, 2) DEFAULT 0,
  category_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,
  supplier_id INTEGER REFERENCES public.suppliers(id) ON DELETE SET NULL,
  minimum_quantity INTEGER DEFAULT 0,
  initial_quantity INTEGER DEFAULT 0,
  current_quantity INTEGER DEFAULT 0,
  last_counted_quantity INTEGER,
  last_counted_at TIMESTAMP WITH TIME ZONE,
  image_url TEXT,
  weight DECIMAL(10, 2),
  weight_unit TEXT,
  dimensions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(team_id, sku)
);

-- Create item_locations junction table
CREATE TABLE IF NOT EXISTS public.item_locations (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  team_id INTEGER NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  location_id INTEGER NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  current_quantity INTEGER DEFAULT 0,
  minimum_quantity INTEGER DEFAULT 0,
  bin_location TEXT,
  UNIQUE(item_id, location_id)
);

-- Create stock_transactions table
CREATE TABLE IF NOT EXISTS public.stock_transactions (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  team_id INTEGER NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('stock_in', 'stock_out', 'adjust', 'move', 'count')),
  quantity INTEGER NOT NULL,
  from_location_id INTEGER REFERENCES public.locations(id) ON DELETE SET NULL,
  to_location_id INTEGER REFERENCES public.locations(id) ON DELETE SET NULL,
  supplier_id INTEGER REFERENCES public.suppliers(id) ON DELETE SET NULL,
  unit_cost DECIMAL(15, 2),
  total_cost DECIMAL(15, 2),
  reference_number TEXT,
  memo TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'failed')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  team_id INTEGER NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT
);

-- Create team_settings table
CREATE TABLE IF NOT EXISTS public.team_settings (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  team_id INTEGER NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE UNIQUE,
  settings JSONB DEFAULT '{}'::jsonb,
  email_notifications JSONB DEFAULT '{}'::jsonb,
  low_stock_threshold INTEGER DEFAULT 5,
  default_currency TEXT DEFAULT 'USD',
  default_language TEXT DEFAULT 'en',
  fiscal_year_start DATE,
  logo_url TEXT,
  theme_settings JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_items_team_id ON public.items(team_id);
CREATE INDEX IF NOT EXISTS idx_items_category_id ON public.items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_supplier_id ON public.items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_items_sku ON public.items(sku);
CREATE INDEX IF NOT EXISTS idx_items_barcode ON public.items(barcode);
CREATE INDEX IF NOT EXISTS idx_items_name ON public.items(name);

CREATE INDEX IF NOT EXISTS idx_categories_team_id ON public.categories(team_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);

CREATE INDEX IF NOT EXISTS idx_locations_team_id ON public.locations(team_id);
CREATE INDEX IF NOT EXISTS idx_locations_parent_id ON public.locations(parent_id);

CREATE INDEX IF NOT EXISTS idx_suppliers_team_id ON public.suppliers(team_id);

CREATE INDEX IF NOT EXISTS idx_item_locations_team_id ON public.item_locations(team_id);
CREATE INDEX IF NOT EXISTS idx_item_locations_item_id ON public.item_locations(item_id);
CREATE INDEX IF NOT EXISTS idx_item_locations_location_id ON public.item_locations(location_id);

CREATE INDEX IF NOT EXISTS idx_stock_transactions_team_id ON public.stock_transactions(team_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_item_id ON public.stock_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_from_location_id ON public.stock_transactions(from_location_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_to_location_id ON public.stock_transactions(to_location_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_supplier_id ON public.stock_transactions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_created_at ON public.stock_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_type ON public.stock_transactions(type);

CREATE INDEX IF NOT EXISTS idx_team_users_team_id ON public.team_users(team_id);
CREATE INDEX IF NOT EXISTS idx_team_users_user_id ON public.team_users(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_team_id ON public.audit_logs(team_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

/********************************************************************
 * Migration: 000002_create_functions_and_triggers
 * Description: Creates functions and triggers for managing inventory and audit logging
 * Created at: 2025-03-15
 ********************************************************************/

-- 1. Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
      SELECT table_name 
      FROM information_schema.columns 
      WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
  LOOP
      EXECUTE format('
          DROP TRIGGER IF EXISTS update_updated_at_trigger ON %I;
          CREATE TRIGGER update_updated_at_trigger
          BEFORE UPDATE ON %I
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      ', t, t);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 2. Function: Update item quantities on stock transactions
CREATE OR REPLACE FUNCTION update_item_quantities()
RETURNS TRIGGER AS $$
DECLARE
  item_team_id INTEGER;
BEGIN
  SELECT team_id INTO item_team_id FROM public.items WHERE id = NEW.item_id;
  IF NEW.team_id != item_team_id THEN
      RAISE EXCEPTION 'Team ID mismatch between transaction and item';
  END IF;
  
  IF NEW.type = 'stock_in' THEN
      UPDATE public.items 
      SET current_quantity = current_quantity + NEW.quantity
      WHERE id = NEW.item_id;
      
      INSERT INTO public.item_locations (team_id, item_id, location_id, current_quantity)
      VALUES (NEW.team_id, NEW.item_id, NEW.to_location_id, NEW.quantity)
      ON CONFLICT (item_id, location_id) 
      DO UPDATE SET current_quantity = public.item_locations.current_quantity + NEW.quantity;
      
  ELSIF NEW.type = 'stock_out' THEN
      UPDATE public.items 
      SET current_quantity = current_quantity - NEW.quantity
      WHERE id = NEW.item_id;
      
      UPDATE public.item_locations
      SET current_quantity = current_quantity - NEW.quantity
      WHERE item_id = NEW.item_id AND location_id = NEW.from_location_id;
      
  ELSIF NEW.type = 'move' THEN
      UPDATE public.item_locations
      SET current_quantity = current_quantity - NEW.quantity
      WHERE item_id = NEW.item_id AND location_id = NEW.from_location_id;
      
      INSERT INTO public.item_locations (team_id, item_id, location_id, current_quantity)
      VALUES (NEW.team_id, NEW.item_id, NEW.to_location_id, NEW.quantity)
      ON CONFLICT (item_id, location_id)
      DO UPDATE SET current_quantity = public.item_locations.current_quantity + NEW.quantity;
      
  ELSIF NEW.type = 'adjust' THEN
      DECLARE current_qty INTEGER;
      DECLARE diff INTEGER;
      BEGIN
          SELECT current_quantity INTO current_qty 
          FROM public.item_locations 
          WHERE item_id = NEW.item_id AND location_id = NEW.to_location_id;
          
          IF current_qty IS NULL THEN
              current_qty := 0;
          END IF;
          
          diff := NEW.quantity - current_qty;
          
          UPDATE public.items 
          SET current_quantity = current_quantity + diff
          WHERE id = NEW.item_id;
          
          INSERT INTO public.item_locations (team_id, item_id, location_id, current_quantity)
          VALUES (NEW.team_id, NEW.item_id, NEW.to_location_id, NEW.quantity)
          ON CONFLICT (item_id, location_id) 
          DO UPDATE SET current_quantity = NEW.quantity;
      END;
  ELSIF NEW.type = 'count' THEN
      UPDATE public.items
      SET last_counted_quantity = NEW.quantity,
          last_counted_at = NOW()
      WHERE id = NEW.item_id;
      
      DECLARE current_qty INTEGER;
      DECLARE diff INTEGER;
      BEGIN
          SELECT current_quantity INTO current_qty 
          FROM public.item_locations 
          WHERE item_id = NEW.item_id AND location_id = NEW.to_location_id;
          
          IF current_qty IS NULL THEN
              current_qty := 0;
          END IF;
          
          diff := NEW.quantity - current_qty;
          
          UPDATE public.items 
          SET current_quantity = current_quantity + diff
          WHERE id = NEW.item_id;
          
          INSERT INTO public.item_locations (team_id, item_id, location_id, current_quantity)
          VALUES (NEW.team_id, NEW.item_id, NEW.to_location_id, NEW.quantity)
          ON CONFLICT (item_id, location_id)
          DO UPDATE SET current_quantity = NEW.quantity;
      END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stock_transaction_trigger ON public.stock_transactions;
CREATE TRIGGER stock_transaction_trigger
AFTER INSERT ON public.stock_transactions
FOR EACH ROW
EXECUTE FUNCTION update_item_quantities();

-- 3. Function: Create audit logs
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  team_id_val INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN
      team_id_val := OLD.team_id;
  ELSE
      team_id_val := NEW.team_id;
  END IF;
  
  IF team_id_val IS NULL THEN
      RETURN NULL;
  END IF;
  
  IF TG_OP = 'INSERT' THEN
      INSERT INTO public.audit_logs (
          team_id, user_id, action, table_name, record_id, new_values
      ) VALUES (
          team_id_val, auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, row_to_json(NEW)
      );
  ELSIF TG_OP = 'UPDATE' THEN
      INSERT INTO public.audit_logs (
          team_id, user_id, action, table_name, record_id, old_values, new_values
      ) VALUES (
          team_id_val, auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW)
      );
  ELSIF TG_OP = 'DELETE' THEN
      INSERT INTO public.audit_logs (
          team_id, user_id, action, table_name, record_id, old_values
      ) VALUES (
          team_id_val, auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD)
      );
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
        AND table_name IN ('items', 'categories', 'locations', 'suppliers', 'stock_transactions')
  LOOP
      EXECUTE format('
          DROP TRIGGER IF EXISTS audit_log_trigger ON %I;
          CREATE TRIGGER audit_log_trigger
          AFTER INSERT OR UPDATE OR DELETE ON %I
          FOR EACH ROW
          EXECUTE FUNCTION create_audit_log();
      ', t, t);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. Function: Validate stock quantity for stock_out and move transactions
CREATE OR REPLACE FUNCTION validate_stock_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type IN ('stock_out', 'move') THEN
      IF NOT EXISTS (
          SELECT 1 FROM public.item_locations 
          WHERE item_id = NEW.item_id 
            AND location_id = NEW.from_location_id
            AND current_quantity >= NEW.quantity
      ) THEN
          RAISE EXCEPTION 'Insufficient stock for item % at location %', NEW.item_id, NEW.from_location_id;
      END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_stock_quantity
  BEFORE INSERT ON public.stock_transactions
  FOR EACH ROW
  EXECUTE FUNCTION validate_stock_quantity();

-- 5. Function: Initialize item_locations for a new item
CREATE OR REPLACE FUNCTION initialize_item_locations()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.item_locations (team_id, item_id, location_id, current_quantity)
  SELECT NEW.team_id, NEW.id, id, 0
  FROM public.locations
  WHERE team_id = NEW.team_id AND is_active = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER initialize_item_locations
  AFTER INSERT ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION initialize_item_locations();

/********************************************************************
 * Migration: 000003_create_views
 * Description: Creates views for common queries
 * Created at: 2025-03-15
 ********************************************************************/

-- View: item_stock_levels
CREATE OR REPLACE VIEW item_stock_levels AS
SELECT 
  i.id AS item_id,
  i.team_id,
  i.sku,
  i.name AS item_name,
  i.barcode,
  i.cost,
  i.price,
  c.name AS category_name,
  s.name AS supplier_name,
  l.id AS location_id,
  l.name AS location_name,
  il.current_quantity,
  il.minimum_quantity,
  il.bin_location,
  CASE 
      WHEN il.current_quantity <= 0 THEN 'out_of_stock'
      WHEN il.current_quantity <= il.minimum_quantity THEN 'low_stock'
      ELSE 'in_stock'
  END AS stock_status
FROM 
  public.items i
JOIN 
  public.item_locations il ON i.id = il.item_id
JOIN 
  public.locations l ON il.location_id = l.id
LEFT JOIN 
  public.categories c ON i.category_id = c.id
LEFT JOIN 
  public.suppliers s ON i.supplier_id = s.id
WHERE 
  i.is_active = true
  AND l.is_active = true;

-- View: transaction_history
CREATE OR REPLACE VIEW transaction_history AS
SELECT 
  st.id AS transaction_id,
  st.team_id,
  st.created_at,
  st.type,
  st.quantity,
  st.reference_number,
  st.memo,
  st.status,
  i.id AS item_id,
  i.sku,
  i.name AS item_name,
  fl.id AS from_location_id,
  fl.name AS from_location_name,
  tl.id AS to_location_id,
  tl.name AS to_location_name,
  s.id AS supplier_id,
  s.name AS supplier_name,
  st.unit_cost,
  st.total_cost,
  p.full_name AS created_by_name
FROM 
  public.stock_transactions st
JOIN 
  public.items i ON st.item_id = i.id
LEFT JOIN 
  public.locations fl ON st.from_location_id = fl.id
LEFT JOIN 
  public.locations tl ON st.to_location_id = tl.id
LEFT JOIN 
  public.suppliers s ON st.supplier_id = s.id
LEFT JOIN 
  public.profiles p ON st.created_by = p.id;

-- View: inventory_valuation
CREATE OR REPLACE VIEW inventory_valuation AS
SELECT 
  i.team_id,
  i.id AS item_id,
  i.sku,
  i.name AS item_name,
  c.name AS category_name,
  i.cost,
  i.current_quantity,
  (i.cost * i.current_quantity) AS total_value,
  l.id AS location_id,
  l.name AS location_name,
  il.current_quantity AS location_quantity,
  (i.cost * il.current_quantity) AS location_value
FROM 
  public.items i
LEFT JOIN 
  public.categories c ON i.category_id = c.id
JOIN 
  public.item_locations il ON i.id = il.item_id
JOIN 
  public.locations l ON il.location_id = l.id
WHERE 
  i.is_active = true;

-- View: low_stock_alerts
CREATE OR REPLACE VIEW low_stock_alerts AS
SELECT 
  i.team_id,
  i.id AS item_id,
  i.sku,
  i.name AS item_name,
  i.barcode,
  i.current_quantity,
  i.minimum_quantity,
  (i.minimum_quantity - i.current_quantity) AS quantity_needed,
  c.name AS category_name,
  s.name AS supplier_name,
  s.email AS supplier_email,
  s.phone AS supplier_phone
FROM 
  public.items i
LEFT JOIN 
  public.categories c ON i.category_id = c.id
LEFT JOIN 
  public.suppliers s ON i.supplier_id = s.id
WHERE 
  i.is_active = true
  AND i.current_quantity <= i.minimum_quantity
  AND i.current_quantity > 0;

-- View: out_of_stock_items
CREATE OR REPLACE VIEW out_of_stock_items AS
SELECT 
  i.team_id,
  i.id AS item_id,
  i.sku,
  i.name AS item_name,
  i.barcode,
  c.name AS category_name,
  s.name AS supplier_name,
  s.email AS supplier_email,
  s.phone AS supplier_phone
FROM 
  public.items i
LEFT JOIN 
  public.categories c ON i.category_id = c.id
LEFT JOIN 
  public.suppliers s ON i.supplier_id = s.id
WHERE 
  i.is_active = true
  AND i.current_quantity <= 0;

-- View: inventory_turnover
CREATE OR REPLACE VIEW inventory_turnover AS
WITH stock_out_totals AS (
  SELECT 
      i.team_id,
      i.id AS item_id,
      i.name AS item_name,
      i.sku,
      i.cost,
      i.current_quantity,
      COALESCE(SUM(CASE WHEN st.type = 'stock_out' THEN st.quantity ELSE 0 END), 0) AS total_sold,
      COALESCE(SUM(CASE WHEN st.type = 'stock_out' THEN st.quantity * st.unit_cost ELSE 0 END), 0) AS total_sold_value
  FROM 
      public.items i
  LEFT JOIN 
      public.stock_transactions st ON i.id = st.item_id AND st.type = 'stock_out'
  WHERE 
      i.is_active = true
  GROUP BY 
      i.team_id, i.id, i.name, i.sku, i.cost, i.current_quantity
)
SELECT 
  team_id,
  item_id,
  item_name,
  sku,
  cost,
  current_quantity,
  total_sold,
  total_sold_value,
  CASE 
      WHEN current_quantity > 0 THEN total_sold::numeric / current_quantity
      ELSE 0
  END AS turnover_ratio
FROM 
  stock_out_totals;

-- View: item_stock_summary
CREATE OR REPLACE VIEW item_stock_summary AS
SELECT 
  i.id AS item_id,
  i.team_id,
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
  public.items i
LEFT JOIN public.categories c ON i.category_id = c.id
LEFT JOIN public.item_locations il ON i.id = il.item_id
LEFT JOIN public.locations l ON il.location_id = l.id
WHERE 
  i.is_active = true;

-- View: location_history_view
CREATE OR REPLACE VIEW location_history_view AS
SELECT 
  st.id,
  st.team_id,
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
  public.stock_transactions st
JOIN 
  public.items i ON st.item_id = i.id
LEFT JOIN 
  public.locations fl ON st.from_location_id = fl.id
LEFT JOIN 
  public.locations tl ON st.to_location_id = tl.id
ORDER BY 
  st.created_at DESC;

/********************************************************************
 * Migration: 000004_setup_rls_policies
 * Description: Sets up Row Level Security policies for all tables
 * Created at: 2025-03-15
 ********************************************************************/

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_settings ENABLE ROW LEVEL SECURITY;

-- Function: Check if a user belongs to a team
CREATE OR REPLACE FUNCTION auth.user_belongs_to_team(team_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
      SELECT 1 FROM public.team_users
      WHERE team_id = $1 AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if a user has a specific role in a team
CREATE OR REPLACE FUNCTION auth.user_has_role(team_id INTEGER, required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
      SELECT 1 FROM public.team_users
      WHERE team_id = $1 
        AND user_id = auth.uid()
        AND role = ANY(required_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid());

-- Teams policies
CREATE POLICY "Users can view teams they belong to"
ON public.teams FOR SELECT
USING (auth.user_belongs_to_team(id));

CREATE POLICY "Users can insert teams"
ON public.teams FOR INSERT
WITH CHECK (true);

CREATE POLICY "Owners and admins can update their teams"
ON public.teams FOR UPDATE
USING (auth.user_has_role(id, ARRAY['owner', 'admin']));

-- Team users policies
CREATE POLICY "Users can view team memberships they belong to"
ON public.team_users FOR SELECT
USING (user_id = auth.uid() OR auth.user_belongs_to_team(team_id));

CREATE POLICY "Users can insert their own team membership"
ON public.team_users FOR INSERT
WITH CHECK (user_id = auth.uid() OR auth.user_has_role(team_id, ARRAY['owner', 'admin']));

CREATE POLICY "Owners and admins can update team memberships"
ON public.team_users FOR UPDATE
USING (auth.user_has_role(team_id, ARRAY['owner', 'admin']));

CREATE POLICY "Owners and admins can delete team memberships"
ON public.team_users FOR DELETE
USING (auth.user_has_role(team_id, ARRAY['owner', 'admin']));

-- Categories policies
CREATE POLICY "Users can view categories in their teams"
ON public.categories FOR SELECT
USING (auth.user_belongs_to_team(team_id));

CREATE POLICY "Users with appropriate roles can insert categories"
ON public.categories FOR INSERT
WITH CHECK (auth.user_has_role(team_id, ARRAY['owner', 'admin', 'manager']));

CREATE POLICY "Users with appropriate roles can update categories"
ON public.categories FOR UPDATE
USING (auth.user_has_role(team_id, ARRAY['owner', 'admin', 'manager']));

CREATE POLICY "Users with appropriate roles can delete categories"
ON public.categories FOR DELETE
USING (auth.user_has_role(team_id, ARRAY['owner', 'admin']));

-- Locations policies
CREATE POLICY "Users can view locations in their teams"
ON public.locations FOR SELECT
USING (auth.user_belongs_to_team(team_id));

CREATE POLICY "Users with appropriate roles can insert locations"
ON public.locations FOR INSERT
WITH CHECK (auth.user_has_role(team_id, ARRAY['owner', 'admin', 'manager']));

CREATE POLICY "Users with appropriate roles can update locations"
ON public.locations FOR UPDATE
USING (auth.user_has_role(team_id, ARRAY['owner', 'admin', 'manager']));

CREATE POLICY "Users with appropriate roles can delete locations"
ON public.locations FOR DELETE
USING (auth.user_has_role(team_id, ARRAY['owner', 'admin']));

-- Suppliers policies
CREATE POLICY "Users can view suppliers in their teams"
ON public.suppliers FOR SELECT
USING (auth.user_belongs_to_team(team_id));

CREATE POLICY "Users with appropriate roles can insert suppliers"
ON public.suppliers FOR INSERT
WITH CHECK (auth.user_has_role(team_id, ARRAY['owner', 'admin', 'manager']));

CREATE POLICY "Users with appropriate roles can update suppliers"
ON public.suppliers FOR UPDATE
USING (auth.user_has_role(team_id, ARRAY['owner', 'admin', 'manager']));

CREATE POLICY "Users with appropriate roles can delete suppliers"
ON public.suppliers FOR DELETE
USING (auth.user_has_role(team_id, ARRAY['owner', 'admin']));

-- Items policies
CREATE POLICY "Users can view items in their teams"
ON public.items FOR SELECT
USING (auth.user_belongs_to_team(team_id));

CREATE POLICY "Users with appropriate roles can insert items"
ON public.items FOR INSERT
WITH CHECK (auth.user_has_role(team_id, ARRAY['owner', 'admin', 'manager', 'member']));

CREATE POLICY "Users with appropriate roles can update items"
ON public.items FOR UPDATE
USING (auth.user_has_role(team_id, ARRAY['owner', 'admin', 'manager', 'member']));

CREATE POLICY "Users with appropriate roles can delete items"
ON public.items FOR DELETE
USING (auth.user_has_role(team_id, ARRAY['owner', 'admin', 'manager']));

-- Item locations policies
CREATE POLICY "Users can view item locations in their teams"
ON public.item_locations FOR SELECT
USING (auth.user_belongs_to_team(team_id));

CREATE POLICY "Users with appropriate roles can insert item locations"
ON public.item_locations FOR INSERT
WITH CHECK (auth.user_has_role(team_id, ARRAY['owner', 'admin', 'manager', 'member']));

CREATE POLICY "Users with appropriate roles can update item locations"
ON public.item_locations FOR UPDATE
USING (auth.user_has_role(team_id, ARRAY['owner', 'admin', 'manager', 'member']));

CREATE POLICY "Users with appropriate roles can delete item locations"
ON public.item_locations FOR DELETE
USING (auth.user_has_role(team_id, ARRAY['owner', 'admin', 'manager']));

-- Stock transactions policies
CREATE POLICY "Users can view stock transactions in their teams"
ON public.stock_transactions FOR SELECT
USING (auth.user_belongs_to_team(team_id));

CREATE POLICY "Users with appropriate roles can insert stock transactions"
ON public.stock_transactions FOR INSERT
WITH CHECK (auth.user_has_role(team_id, ARRAY['owner', 'admin', 'manager', 'member']));

CREATE POLICY "Users with appropriate roles can update stock transactions"
ON public.stock_transactions FOR UPDATE
USING (auth.user_has_role(team_id, ARRAY['owner', 'admin', 'manager']));

CREATE POLICY "Users with appropriate roles can delete stock transactions"
ON public.stock_transactions FOR DELETE
USING (auth.user_has_role(team_id, ARRAY['owner', 'admin']));

-- Audit logs policies
CREATE POLICY "Users can view audit logs in their teams"
ON public.audit_logs FOR SELECT
USING (auth.user_has_role(team_id, ARRAY['owner', 'admin']));

-- Team settings policies
CREATE POLICY "Users can view team settings in their teams"
ON public.team_settings FOR SELECT
USING (auth.user_belongs_to_team(team_id));

CREATE POLICY "Users with appropriate roles can insert team settings"
ON public.team_settings FOR INSERT
WITH CHECK (auth.user_has_role(team_id, ARRAY['owner', 'admin']));

CREATE POLICY "Users with appropriate roles can update team settings"
ON public.team_settings FOR UPDATE
USING (auth.user_has_role(team_id, ARRAY['owner', 'admin']));

-- API Function: Set active team for a user
CREATE OR REPLACE FUNCTION public.set_active_team(team_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
  team_exists BOOLEAN;
BEGIN
  user_id := auth.uid();
  
  SELECT EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.team_users tu ON t.id = tu.team_id
      WHERE t.id = team_id AND tu.user_id = user_id
  ) INTO team_exists;
  
  IF team_exists THEN
      UPDATE public.team_users
      SET is_default = (team_id = $1)
      WHERE user_id = auth.uid();
      RETURN TRUE;
  ELSE
      RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/********************************************************************
 * Migration: 000005_create_default_data
 * Description: Creates default data for new teams and profiles
 * Created at: 2025-03-15
 ********************************************************************/

-------------------------------
-- 1. Create Default Team for New Profile
-------------------------------
CREATE OR REPLACE FUNCTION create_default_team_for_profile()
RETURNS TRIGGER AS $$
DECLARE
    new_team_id INTEGER;
    team_slug TEXT;
BEGIN
    -- Generate a unique team slug
    team_slug := 'team-' || REPLACE(SUBSTRING(gen_random_uuid()::text, 1, 8), '-', '');
    
    -- Create a default team using profile info (full_name or email)
    INSERT INTO public.teams (
        name, 
        slug, 
        description, 
        created_at, 
        updated_at, 
        created_by
    ) VALUES (
        COALESCE(NEW.full_name, NEW.email) || '''s Team', 
        team_slug, 
        'Default team created on signup', 
        NOW(), 
        NOW(), 
        NEW.id
    ) RETURNING id INTO new_team_id;
    
    IF new_team_id IS NOT NULL THEN
        -- Associate the profile with the new team as admin
        INSERT INTO public.team_users (
            team_id, 
            user_id, 
            role, 
            created_at, 
            updated_at, 
            is_active
        ) VALUES (
            new_team_id, 
            NEW.id, 
            'admin', 
            NOW(), 
            NOW(), 
            true
        );
        
        -- Set the active team for the user
        INSERT INTO public.active_team (
            user_id, 
            team_id, 
            created_at, 
            updated_at
        ) VALUES (
            NEW.id, 
            new_team_id, 
            NOW(), 
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS after_profile_created ON public.profiles;
CREATE TRIGGER after_profile_created
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION create_default_team_for_profile();

-------------------------------
-- 2. Create Default Data for New Team
-------------------------------
-- First, drop the existing function to rename the parameter
DROP FUNCTION IF EXISTS create_default_team_data(integer);

CREATE OR REPLACE FUNCTION create_default_team_data(p_team_id INTEGER)
RETURNS VOID AS $$
DECLARE
  default_location_id INTEGER;
BEGIN
  -- Create default location using the parameter p_team_id
  INSERT INTO public.locations (team_id, name, description, is_active)
  VALUES (p_team_id, 'Default', 'Default location', true)
  RETURNING id INTO default_location_id;
  
  -- Create default categories with ON CONFLICT to avoid duplicate errors
  INSERT INTO public.categories (team_id, name, description, is_active)
  VALUES 
      (p_team_id, 'Default', 'General items', true)
  ON CONFLICT (team_id, name) DO NOTHING;
      
  -- Create default team settings using json_build_object for proper JSON construction
  INSERT INTO public.team_settings (team_id, settings)
  VALUES (
      p_team_id, 
      json_build_object(
          'inventory', json_build_object(
              'lowStockThreshold', 5,
              'enableBarcodeScan', true,
              'defaultLocation', default_location_id
          ),
          'notifications', json_build_object(
              'lowStock', true,
              'outOfStock', true,
              'expiringItems', false
          ),
          'display', json_build_object(
              'itemsPerPage', 20,
              'defaultView', 'grid'
          )
      )
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_create_default_team_data()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_default_team_data(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_default_team_data_trigger ON public.teams;
CREATE TRIGGER create_default_team_data_trigger
AFTER INSERT ON public.teams
FOR EACH ROW
EXECUTE FUNCTION trigger_create_default_team_data();

/********************************************************************
 * Migration: 000006_location_history_tracking
 * Description: Enhances stock transactions with value tracking and improves location history
 * Created at: 2025-03-15
 ********************************************************************/

-- Function: Get current location of an item
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
      public.item_locations il
  JOIN 
      public.locations l ON il.location_id = l.id
  WHERE 
      il.item_id = p_item_id
      AND il.current_quantity > 0
  ORDER BY 
      il.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate the value history of an item
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
      public.stock_transactions st
  JOIN 
      public.items i ON st.item_id = i.id
  LEFT JOIN 
      public.locations tl ON st.to_location_id = tl.id
  LEFT JOIN 
      public.locations fl ON st.from_location_id = fl.id
  WHERE 
      st.item_id = p_item_id
  ORDER BY 
      st.created_at;
END;
$$ LANGUAGE plpgsql;

-- Create an index to improve location history queries
CREATE INDEX IF NOT EXISTS idx_stock_transactions_item_location ON public.stock_transactions(item_id, from_location_id, to_location_id);

