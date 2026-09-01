create table public.job_number_sequences (
  year         smallint primary key,
  last_number  integer not null default 0
);

alter table public.job_number_sequences enable row level security;

-- No policies means no one but postgres / superuser (or SECURITY DEFINER functions) can query it

create or replace function public.fn_next_job_number()
returns text
language plpgsql
security definer -- Elevates privileges to bypass RLS
set search_path = public
as $$
declare
  v_year smallint := extract(year from now())::smallint;
  v_seq  integer;
begin
  -- Atomic operation ensures race-free increments
  insert into public.job_number_sequences(year, last_number)
  values (v_year, 1)
  on conflict (year)
    do update set last_number = job_number_sequences.last_number + 1
  returning last_number into v_seq;
  
  -- Formats the number like J-2026-0001
  return 'J-' || v_year || '-' || lpad(v_seq::text, 4, '0');
end;
$$;
