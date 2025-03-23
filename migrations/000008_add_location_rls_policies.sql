-- Enable RLS for locations table if not already enabled
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view locations in their teams" ON public.locations;
DROP POLICY IF EXISTS "Users can create locations in their teams" ON public.locations;
DROP POLICY IF EXISTS "Users can update locations in their teams" ON public.locations;
DROP POLICY IF EXISTS "Users can delete locations in their teams" ON public.locations;
DROP POLICY IF EXISTS "Users can view audit logs in their teams" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can create audit logs in their teams" ON public.audit_logs;

-- Create policies for locations
CREATE POLICY "Users can view locations in their teams" ON public.locations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_users 
      WHERE team_id = locations.team_id
    )
  );

CREATE POLICY "Users can create locations in their teams" ON public.locations
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.team_users 
      WHERE team_id = team_id
    )
  );

CREATE POLICY "Users can update locations in their teams" ON public.locations
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_users 
      WHERE team_id = locations.team_id
    )
  );

CREATE POLICY "Users can delete locations in their teams" ON public.locations
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_users 
      WHERE team_id = locations.team_id
    )
  );

-- Create policies for audit logs
CREATE POLICY "Users can view audit logs in their teams" ON public.audit_logs
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_users 
      WHERE team_id = audit_logs.team_id
    )
  );

CREATE POLICY "Users can create audit logs in their teams" ON public.audit_logs
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.team_users 
      WHERE team_id = team_id
    )
  );

-- Create a function to automatically set team_id in audit logs
CREATE OR REPLACE FUNCTION public.set_audit_log_team_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.team_id = COALESCE(
    (SELECT team_id FROM locations WHERE id = NEW.record_id AND NEW.table_name = 'locations'),
    (SELECT team_id FROM items WHERE id = NEW.record_id AND NEW.table_name = 'items'),
    (SELECT team_id FROM categories WHERE id = NEW.record_id AND NEW.table_name = 'categories'),
    (SELECT team_id FROM suppliers WHERE id = NEW.record_id AND NEW.table_name = 'suppliers')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set team_id
DROP TRIGGER IF EXISTS set_audit_log_team_id_trigger ON public.audit_logs;
CREATE TRIGGER set_audit_log_team_id_trigger
  BEFORE INSERT ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_audit_log_team_id(); 