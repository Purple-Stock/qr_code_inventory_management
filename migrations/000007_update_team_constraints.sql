-- Add NOT NULL constraint to team_id in all relevant tables
ALTER TABLE public.items
ALTER COLUMN team_id SET NOT NULL;

ALTER TABLE public.categories
ALTER COLUMN team_id SET NOT NULL;

ALTER TABLE public.locations
ALTER COLUMN team_id SET NOT NULL;

ALTER TABLE public.suppliers
ALTER COLUMN team_id SET NOT NULL;

ALTER TABLE public.item_locations
ALTER COLUMN team_id SET NOT NULL;

ALTER TABLE public.stock_transactions
ALTER COLUMN team_id SET NOT NULL;

ALTER TABLE public.audit_logs
ALTER COLUMN team_id SET NOT NULL;

-- Add foreign key constraints if they don't exist
ALTER TABLE public.items
ADD CONSTRAINT fk_items_team
FOREIGN KEY (team_id)
REFERENCES public.teams(id)
ON DELETE CASCADE;

ALTER TABLE public.categories
ADD CONSTRAINT fk_categories_team
FOREIGN KEY (team_id)
REFERENCES public.teams(id)
ON DELETE CASCADE;

ALTER TABLE public.locations
ADD CONSTRAINT fk_locations_team
FOREIGN KEY (team_id)
REFERENCES public.teams(id)
ON DELETE CASCADE;

ALTER TABLE public.suppliers
ADD CONSTRAINT fk_suppliers_team
FOREIGN KEY (team_id)
REFERENCES public.teams(id)
ON DELETE CASCADE;

ALTER TABLE public.item_locations
ADD CONSTRAINT fk_item_locations_team
FOREIGN KEY (team_id)
REFERENCES public.teams(id)
ON DELETE CASCADE;

ALTER TABLE public.stock_transactions
ADD CONSTRAINT fk_stock_transactions_team
FOREIGN KEY (team_id)
REFERENCES public.teams(id)
ON DELETE CASCADE;

ALTER TABLE public.audit_logs
ADD CONSTRAINT fk_audit_logs_team
FOREIGN KEY (team_id)
REFERENCES public.teams(id)
ON DELETE CASCADE;

-- Add indexes for team_id if they don't exist
CREATE INDEX IF NOT EXISTS idx_items_team_id ON public.items(team_id);
CREATE INDEX IF NOT EXISTS idx_categories_team_id ON public.categories(team_id);
CREATE INDEX IF NOT EXISTS idx_locations_team_id ON public.locations(team_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_team_id ON public.suppliers(team_id);
CREATE INDEX IF NOT EXISTS idx_item_locations_team_id ON public.item_locations(team_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_team_id ON public.stock_transactions(team_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_team_id ON public.audit_logs(team_id);

-- Add RLS policies for team-based access
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for each table
CREATE POLICY "Users can view items in their teams"
ON public.items FOR SELECT
USING (auth.uid() IN (
  SELECT user_id FROM public.team_users WHERE team_id = items.team_id
));

CREATE POLICY "Users can insert items in their teams"
ON public.items FOR INSERT
WITH CHECK (auth.uid() IN (
  SELECT user_id FROM public.team_users WHERE team_id = team_id
));

-- Repeat similar policies for other tables...

-- Function to validate team membership
CREATE OR REPLACE FUNCTION public.validate_team_membership()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.team_users
    WHERE user_id = auth.uid()
    AND team_id = NEW.team_id
  ) THEN
    RAISE EXCEPTION 'User does not belong to the specified team';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers to validate team membership on insert
CREATE TRIGGER validate_item_team_membership
BEFORE INSERT ON public.items
FOR EACH ROW
EXECUTE FUNCTION public.validate_team_membership();

-- Repeat similar triggers for other tables... 