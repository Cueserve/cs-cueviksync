-- Make INSERT and DELETE policies consistent with UPDATE policies by using explicit role allowlists

-- 1. Drop existing INSERT and DELETE policies on jobs
DROP POLICY IF EXISTS "Jobs can be inserted by non-reps." ON public.jobs;
DROP POLICY IF EXISTS "Jobs can be deleted by non-reps." ON public.jobs;

-- 2. Drop existing INSERT and DELETE policies on job_line_items
DROP POLICY IF EXISTS "Job line items can be inserted by non-reps." ON public.job_line_items;
DROP POLICY IF EXISTS "Job line items can be deleted by non-reps." ON public.job_line_items;

-- 3. Create strict allowlist INSERT and DELETE policies for jobs
CREATE POLICY "Jobs can be inserted by authorized roles only."
    ON public.jobs FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        public.get_user_role() IN ('owner_admin', 'office_admin', 'sales_manager')
    );

CREATE POLICY "Jobs can be deleted by authorized roles only."
    ON public.jobs FOR DELETE
    USING (
        auth.role() = 'authenticated' AND
        public.get_user_role() IN ('owner_admin', 'office_admin', 'sales_manager')
    );

-- 4. Create strict allowlist INSERT and DELETE policies for job_line_items
CREATE POLICY "Job line items can be inserted by authorized roles only."
    ON public.job_line_items FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        public.get_user_role() IN ('owner_admin', 'office_admin', 'sales_manager')
    );

CREATE POLICY "Job line items can be deleted by authorized roles only."
    ON public.job_line_items FOR DELETE
    USING (
        auth.role() = 'authenticated' AND
        public.get_user_role() IN ('owner_admin', 'office_admin', 'sales_manager')
    );
