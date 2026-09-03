-- Performance indexes for jobs and job_line_items

-- 1. Unique index on jobNo to enforce uniqueness and accelerate lookups / search
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_job_no 
  ON public.jobs ("jobNo");

-- 2. Partial index on active jobs ordered by orderDate DESC (powers default listing & sorting)
CREATE INDEX IF NOT EXISTS idx_jobs_active_order_date 
  ON public.jobs ("orderDate" DESC) 
  WHERE deleted_at IS NULL;

-- 3. Partial index on active jobs by promisedDate (powers overdue calculations & date filters)
CREATE INDEX IF NOT EXISTS idx_jobs_active_promised_date 
  ON public.jobs ("promisedDate") 
  WHERE deleted_at IS NULL;

-- 4. Partial index on active jobs by completedDate (powers dashboard yearly/weekly queries)
CREATE INDEX IF NOT EXISTS idx_jobs_active_completed_date 
  ON public.jobs ("completedDate") 
  WHERE deleted_at IS NULL;

-- 5. Foreign key index on job_line_items(job_id) to accelerate joins between jobs and line items
CREATE INDEX IF NOT EXISTS idx_job_line_items_job_id 
  ON public.job_line_items (job_id);
