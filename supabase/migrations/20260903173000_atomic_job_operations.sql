-- Atomic job operations: ensures jobs and their line items are created and updated in a single transaction.

CREATE OR REPLACE FUNCTION public.fn_create_job_with_items(
  p_job jsonb,
  p_line_items jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_job_id text;
  v_job record;
BEGIN
  v_job_id := coalesce(p_job->>'id', gen_random_uuid()::text);

  INSERT INTO public.jobs (
    id,
    "jobNo",
    "orderDate",
    "promisedDate",
    "completedDate",
    "deliveredDate",
    "overdueReason",
    "inThisWeek",
    "invoiceValue",
    "spoilagePercent",
    "reprintRequired",
    notes,
    deleted_at
  )
  VALUES (
    v_job_id,
    coalesce(p_job->>'jobNo', ''),
    (p_job->>'orderDate')::date,
    (p_job->>'promisedDate')::date,
    nullif(trim(p_job->>'completedDate'), '')::date,
    nullif(trim(p_job->>'deliveredDate'), '')::date,
    nullif(trim(p_job->>'overdueReason'), ''),
    coalesce((p_job->>'inThisWeek')::boolean, false),
    coalesce((p_job->>'invoiceValue')::numeric, 0),
    coalesce((p_job->>'spoilagePercent')::numeric, 0),
    coalesce((p_job->>'reprintRequired')::boolean, false),
    nullif(trim(p_job->>'notes'), ''),
    nullif(trim(p_job->>'deleted_at'), '')::timestamptz
  )
  RETURNING * INTO v_job;

  IF p_line_items IS NOT NULL AND jsonb_array_length(p_line_items) > 0 THEN
    INSERT INTO public.job_line_items (
      id,
      job_id,
      "lineNo",
      "itemDescription",
      quantity,
      "materialShortage",
      "equipmentIssue"
    )
    SELECT
      coalesce(nullif(trim(item->>'id'), ''), gen_random_uuid()::text),
      v_job_id,
      (item->>'lineNo')::integer,
      coalesce(item->>'itemDescription', ''),
      coalesce((item->>'quantity')::integer, 0),
      nullif(trim(item->>'materialShortage'), ''),
      nullif(trim(item->>'equipmentIssue'), '')
    FROM jsonb_array_elements(p_line_items) AS item;
  END IF;

  RETURN to_jsonb(v_job);
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_update_job_with_items(
  p_job_id text,
  p_updates jsonb,
  p_line_items_upsert jsonb DEFAULT '[]'::jsonb,
  p_line_items_delete text[] DEFAULT ARRAY[]::text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  -- 1. Update job details if fields are provided in p_updates
  UPDATE public.jobs
  SET
    "jobNo" = CASE WHEN p_updates ? 'jobNo' THEN p_updates->>'jobNo' ELSE "jobNo" END,
    "orderDate" = CASE WHEN p_updates ? 'orderDate' THEN (p_updates->>'orderDate')::date ELSE "orderDate" END,
    "promisedDate" = CASE WHEN p_updates ? 'promisedDate' THEN (p_updates->>'promisedDate')::date ELSE "promisedDate" END,
    "completedDate" = CASE WHEN p_updates ? 'completedDate' THEN nullif(trim(p_updates->>'completedDate'), '')::date ELSE "completedDate" END,
    "deliveredDate" = CASE WHEN p_updates ? 'deliveredDate' THEN nullif(trim(p_updates->>'deliveredDate'), '')::date ELSE "deliveredDate" END,
    "overdueReason" = CASE WHEN p_updates ? 'overdueReason' THEN nullif(trim(p_updates->>'overdueReason'), '') ELSE "overdueReason" END,
    "inThisWeek" = CASE WHEN p_updates ? 'inThisWeek' THEN (p_updates->>'inThisWeek')::boolean ELSE "inThisWeek" END,
    "invoiceValue" = CASE WHEN p_updates ? 'invoiceValue' THEN (p_updates->>'invoiceValue')::numeric ELSE "invoiceValue" END,
    "spoilagePercent" = CASE WHEN p_updates ? 'spoilagePercent' THEN (p_updates->>'spoilagePercent')::numeric ELSE "spoilagePercent" END,
    "reprintRequired" = CASE WHEN p_updates ? 'reprintRequired' THEN (p_updates->>'reprintRequired')::boolean ELSE "reprintRequired" END,
    notes = CASE WHEN p_updates ? 'notes' THEN nullif(trim(p_updates->>'notes'), '') ELSE notes END,
    deleted_at = CASE WHEN p_updates ? 'deleted_at' THEN nullif(trim(p_updates->>'deleted_at'), '')::timestamptz ELSE deleted_at END
  WHERE id = p_job_id;

  -- 2. Delete removed line items
  IF p_line_items_delete IS NOT NULL AND array_length(p_line_items_delete, 1) > 0 THEN
    DELETE FROM public.job_line_items
    WHERE job_id = p_job_id AND id = ANY(p_line_items_delete);
  END IF;

  -- 3. Upsert line items
  IF p_line_items_upsert IS NOT NULL AND jsonb_array_length(p_line_items_upsert) > 0 THEN
    INSERT INTO public.job_line_items (
      id,
      job_id,
      "lineNo",
      "itemDescription",
      quantity,
      "materialShortage",
      "equipmentIssue"
    )
    SELECT
      coalesce(nullif(trim(item->>'id'), ''), gen_random_uuid()::text),
      p_job_id,
      (item->>'lineNo')::integer,
      coalesce(item->>'itemDescription', ''),
      coalesce((item->>'quantity')::integer, 0),
      nullif(trim(item->>'materialShortage'), ''),
      nullif(trim(item->>'equipmentIssue'), '')
    FROM jsonb_array_elements(p_line_items_upsert) AS item
    ON CONFLICT (id) DO UPDATE
    SET
      "lineNo" = EXCLUDED."lineNo",
      "itemDescription" = EXCLUDED."itemDescription",
      quantity = EXCLUDED.quantity,
      "materialShortage" = EXCLUDED."materialShortage",
      "equipmentIssue" = EXCLUDED."equipmentIssue";
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fn_create_job_with_items TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_update_job_with_items TO authenticated;
