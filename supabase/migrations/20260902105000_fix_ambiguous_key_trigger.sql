CREATE OR REPLACE FUNCTION public.log_job_changes()
RETURNS TRIGGER AS $$
DECLARE
    changes_json JSONB := '{}'::jsonb;
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();

    IF TG_OP = 'UPDATE' THEN
        WITH old_json AS (SELECT row_to_json(OLD) AS data),
             new_json AS (SELECT row_to_json(NEW) AS data)
        
        -- FIXED: explicitly use o.key instead of just key to resolve ambiguity
        SELECT coalesce(jsonb_object_agg(o.key, jsonb_build_object('old', o.value, 'new', n.value)), '{}'::jsonb)
        INTO changes_json
        FROM json_each( (SELECT data FROM old_json) ) o
        JOIN json_each( (SELECT data FROM new_json) ) n ON o.key = n.key
        WHERE o.value::text IS DISTINCT FROM n.value::text 
          AND o.key != 'updated_at';

        IF changes_json != '{}'::jsonb THEN
            INSERT INTO public.job_history (job_id, user_id, action_type, changes)
            VALUES (NEW.id, current_user_id, 'UPDATE', changes_json);
        END IF;

    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.job_history (job_id, user_id, action_type, changes)
        VALUES (NEW.id, current_user_id, 'INSERT', to_jsonb(NEW));
        
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.job_history (job_id, user_id, action_type, changes)
        VALUES (OLD.id, current_user_id, 'DELETE', to_jsonb(OLD));
        RETURN OLD;
    END IF;

    RETURN NEW; 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
