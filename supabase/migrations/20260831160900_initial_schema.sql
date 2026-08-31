-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role public.user_role NOT NULL DEFAULT 'sales_rep',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create jobs table
CREATE TABLE public.jobs (
    id TEXT PRIMARY KEY,
    "jobNo" TEXT NOT NULL,
    "orderDate" DATE NOT NULL,
    "promisedDate" DATE NOT NULL,
    "completedDate" DATE,
    "deliveredDate" DATE,
    "overdueReason" TEXT,
    "inThisWeek" BOOLEAN NOT NULL DEFAULT false,
    "invoiceValue" NUMERIC(10,2) NOT NULL DEFAULT 0,
    "spoilagePercent" NUMERIC(5,2) NOT NULL DEFAULT 0,
    "reprintRequired" BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create job_line_items table
CREATE TABLE public.job_line_items (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    "lineNo" INTEGER NOT NULL,
    "itemDescription" TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    "materialShortage" TEXT,
    "equipmentIssue" TEXT
);

-- Setup Row Level Security (RLS)

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
    ON public.profiles FOR SELECT
    USING ( true );

CREATE POLICY "Users can insert their own profile."
    ON public.profiles FOR INSERT
    WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
    ON public.profiles FOR UPDATE
    USING ( auth.uid() = id );

-- Jobs
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jobs are viewable by authenticated users."
    ON public.jobs FOR SELECT
    USING ( auth.role() = 'authenticated' );

CREATE POLICY "Jobs can be inserted by authenticated users."
    ON public.jobs FOR INSERT
    WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "Jobs can be updated by authenticated users."
    ON public.jobs FOR UPDATE
    USING ( auth.role() = 'authenticated' );

CREATE POLICY "Jobs can be deleted by authenticated users."
    ON public.jobs FOR DELETE
    USING ( auth.role() = 'authenticated' );

-- Job Line Items
ALTER TABLE public.job_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Job line items are viewable by authenticated users."
    ON public.job_line_items FOR SELECT
    USING ( auth.role() = 'authenticated' );

CREATE POLICY "Job line items can be inserted by authenticated users."
    ON public.job_line_items FOR INSERT
    WITH CHECK ( auth.role() = 'authenticated' );

CREATE POLICY "Job line items can be updated by authenticated users."
    ON public.job_line_items FOR UPDATE
    USING ( auth.role() = 'authenticated' );

CREATE POLICY "Job line items can be deleted by authenticated users."
    ON public.job_line_items FOR DELETE
    USING ( auth.role() = 'authenticated' );

-- Create trigger for updated_at (reusing set_updated_at from 0001_extensions_and_types.sql)
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    EXECUTE PROCEDURE public.set_updated_at();
