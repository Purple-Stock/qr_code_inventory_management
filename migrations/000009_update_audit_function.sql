CREATE OR REPLACE FUNCTION public.audit_log_changes()
RETURNS TRIGGER AS $$
DECLARE
    old_data jsonb;
    new_data jsonb;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        old_data = to_jsonb(OLD);
        new_data = null;
    ELSIF (TG_OP = 'UPDATE') THEN
        old_data = to_jsonb(OLD);
        new_data = to_jsonb(NEW);
    ELSE
        old_data = null;
        new_data = to_jsonb(NEW);
    END IF;

    INSERT INTO public.audit_logs (
        table_name,
        record_id,
        operation,
        old_data,
        new_data,
        user_id,
        team_id
    ) VALUES (
        TG_TABLE_NAME::text,
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        TG_OP,
        old_data,
        new_data,
        auth.uid(),
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.team_id
            ELSE NEW.team_id
        END
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 