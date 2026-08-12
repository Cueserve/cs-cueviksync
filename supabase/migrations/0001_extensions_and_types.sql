-- ============================================================================
-- 0001: Extensions, role enum, shared trigger
--
-- Mirrors RedyQuote:supabase/migrations/0001_extensions_and_types.sql in
-- structure. CuevikSync's role enum has four values (PRD-024), not two, and
-- there is no quote/pipeline domain here -- docs/DATABASE.md is a stub, so
-- only what auth/tenancy needs (0002) is created here. See the convergence
-- spec's C-25b for the decision record.
--
-- pgmq and pg_cron are approved in docs/TECH-STACK.md for the capture path
-- but are deliberately NOT enabled here -- nothing consumes them yet. They
-- land in the migration that first uses them (the intake_submissions table
-- and dead-letter queue), so the extension and its consumer are reviewable
-- together.
-- ============================================================================

create extension if not exists pgcrypto;

-- Owner/Admin is the sole admin role (PRD-024/PRD-027); the other three are
-- all non-admin with distinct, non-overlapping permission boundaries.
create type user_role as enum ('owner_admin', 'sales_manager', 'sales_rep', 'office_admin');

-- Shared updated_at trigger
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
