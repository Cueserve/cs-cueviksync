-- Drop the existing update policies that used `!= 'sales_rep'`
DROP POLICY IF EXISTS "Jobs can be updated by non-reps." ON public.jobs;
DROP POLICY IF EXISTS "Job line items can be updated by non-reps." ON public.job_line_items;

-- Create stricter policies that explicitly require authentication AND a specific admin/manager role
CREATE POLICY "Jobs can be updated by authorized roles only."
    ON public.jobs FOR UPDATE
    USING ( 
        auth.role() = 'authenticated' AND 
        public.get_user_role() IN ('owner_admin', 'office_admin', 'sales_manager')
    );

CREATE POLICY "Job line items can be updated by authorized roles only."
    ON public.job_line_items FOR UPDATE
    USING ( 
        auth.role() = 'authenticated' AND 
        public.get_user_role() IN ('owner_admin', 'office_admin', 'sales_manager')
    );
