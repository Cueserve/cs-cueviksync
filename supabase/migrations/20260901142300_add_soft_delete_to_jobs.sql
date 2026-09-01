-- Add deleted_at column for soft deletes
ALTER TABLE public.jobs ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
