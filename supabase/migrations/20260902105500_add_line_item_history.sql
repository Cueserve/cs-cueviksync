-- Add new columns to track the specific entity being changed
ALTER TABLE public.job_history
ADD COLUMN entity_type TEXT NOT NULL DEFAULT 'job',
ADD COLUMN entity_id TEXT;

-- Update existing records to have entity_id = job_id
UPDATE public.job_history SET entity_id = job_id;

-- Update the trigger function to handle both tables dynamically
CREATE OR REPLACE FUNCTION public.log_job_changes()
RETURNS TRIGGER AS $$
DECLARE
    changes_json JSONB := '{}'::jsonb;
    current_user_id UUID;
    target_job_id TEXT;
    target_entity_type TEXT;
    target_entity_id TEXT;
BEGIN
    current_user_id := auth.uid();

    -- Determine job_id and entity info based on the table firing the trigger
    IF TG_TABLE_NAME = 'jobs' THEN
        target_entity_type := 'job';
        IF TG_OP = 'DELETE' THEN
            target_job_id := OLD.id;
            target_entity_id := OLD.id;
        ELSE
            target_job_id := NEW.id;
            target_entity_id := NEW.id;
        END IF;
    ELSIF TG_TABLE_NAME = 'job_line_items' THEN
        target_entity_type := 'line_item';
        IF TG_OP = 'DELETE' THEN
            target_job_id := OLD.job_id;
            target_entity_id := OLD.id;
        ELSE
            target_job_id := NEW.job_id;
            target_entity_id := NEW.id;
        END IF;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        WITH old_json AS (SELECT row_to_json(OLD) AS data),
             new_json AS (SELECT row_to_json(NEW) AS data)
        
        SELECT coalesce(jsonb_object_agg(o.key, jsonb_build_object('old', o.value, 'new', n.value)), '{}'::jsonb)
        INTO changes_json
        FROM json_each( (SELECT data FROM old_json) ) o
        JOIN json_each( (SELECT data FROM new_json) ) n ON o.key = n.key
        WHERE o.value::text IS DISTINCT FROM n.value::text 
          AND o.key != 'updated_at';

        IF changes_json != '{}'::jsonb THEN
            INSERT INTO public.job_history (job_id, user_id, action_type, changes, entity_type, entity_id)
            VALUES (target_job_id, current_user_id, 'UPDATE', changes_json, target_entity_type, target_entity_id);
        END IF;

    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.job_history (job_id, user_id, action_type, changes, entity_type, entity_id)
        VALUES (target_job_id, current_user_id, 'INSERT', to_jsonb(NEW), target_entity_type, target_entity_id);
        
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.job_history (job_id, user_id, action_type, changes, entity_type, entity_id)
        VALUES (target_job_id, current_user_id, 'DELETE', to_jsonb(OLD), target_entity_type, target_entity_id);
        RETURN OLD;
    END IF;

    RETURN NEW; 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to job_line_items
CREATE TRIGGER job_line_items_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.job_line_items
FOR EACH ROW EXECUTE PROCEDURE public.log_job_changes();
