-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create company_users junction table
CREATE TABLE IF NOT EXISTS public.company_users (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  company_id INTEGER NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  UNIQUE(company_id, user_id)
);

-- Add company_id to existing tables
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.suppliers ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES public.companies(id) ON DELETE CASCADE;

-- Create RLS policies for multi-tenant isolation

-- Companies table policies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own companies" 
  ON public.companies FOR SELECT 
  USING (
    id IN (
      SELECT company_id FROM public.company_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own companies" 
  ON public.companies FOR INSERT 
  WITH CHECK (TRUE);

-- Company users table policies
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own company memberships" 
  ON public.company_users FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own company memberships" 
  ON public.company_users FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Items table policies
CREATE POLICY "Users can view items from their companies" 
  ON public.items FOR SELECT 
  USING (
    company_id IN (
      SELECT company_id FROM public.company_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items to their companies" 
  ON public.items FOR INSERT 
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.company_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their companies" 
  ON public.items FOR UPDATE 
  USING (
    company_id IN (
      SELECT company_id FROM public.company_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their companies" 
  ON public.items FOR DELETE 
  USING (
    company_id IN (
      SELECT company_id FROM public.company_users 
      WHERE user_id = auth.uid()
    )
  );

-- Apply similar policies to other tables (categories, locations, suppliers, etc.)

