-- Helper function to get the current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Jobs can be inserted by authenticated users." ON public.jobs;
DROP POLICY IF EXISTS "Jobs can be updated by authenticated users." ON public.jobs;
DROP POLICY IF EXISTS "Jobs can be deleted by authenticated users." ON public.jobs;

DROP POLICY IF EXISTS "Job line items can be inserted by authenticated users." ON public.job_line_items;
DROP POLICY IF EXISTS "Job line items can be updated by authenticated users." ON public.job_line_items;
DROP POLICY IF EXISTS "Job line items can be deleted by authenticated users." ON public.job_line_items;

-- Create restrictive policies for jobs
CREATE POLICY "Jobs can be inserted by non-reps."
    ON public.jobs FOR INSERT
    WITH CHECK ( auth.role() = 'authenticated' AND public.get_user_role() != 'sales_rep' );

CREATE POLICY "Jobs can be updated by non-reps."
    ON public.jobs FOR UPDATE
    USING ( auth.role() = 'authenticated' AND public.get_user_role() != 'sales_rep' );

CREATE POLICY "Jobs can be deleted by non-reps."
    ON public.jobs FOR DELETE
    USING ( auth.role() = 'authenticated' AND public.get_user_role() != 'sales_rep' );

-- Create restrictive policies for job_line_items
CREATE POLICY "Job line items can be inserted by non-reps."
    ON public.job_line_items FOR INSERT
    WITH CHECK ( auth.role() = 'authenticated' AND public.get_user_role() != 'sales_rep' );

CREATE POLICY "Job line items can be updated by non-reps."
    ON public.job_line_items FOR UPDATE
    USING ( auth.role() = 'authenticated' AND public.get_user_role() != 'sales_rep' );

CREATE POLICY "Job line items can be deleted by non-reps."
    ON public.job_line_items FOR DELETE
    USING ( auth.role() = 'authenticated' AND public.get_user_role() != 'sales_rep' );
