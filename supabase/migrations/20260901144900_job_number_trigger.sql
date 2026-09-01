-- Create trigger function to assign job number automatically on insert
CREATE OR REPLACE FUNCTION public.trg_assign_job_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only assign a job number if it wasn't explicitly provided
  IF NEW."jobNo" IS NULL OR NEW."jobNo" = '' THEN
    NEW."jobNo" := public.fn_next_job_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Attach the trigger to the jobs table
DROP TRIGGER IF EXISTS trg_jobs_assign_job_number ON public.jobs;
CREATE TRIGGER trg_jobs_assign_job_number
  BEFORE INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_assign_job_number();
