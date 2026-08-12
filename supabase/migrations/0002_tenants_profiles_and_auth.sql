-- ============================================================================
-- 0002: tenants, profiles, auth integration, is_admin(), and RLS
--
-- CuevikSync is multi-tenant (docs/ARCHITECTURE.md §5, NFR-008): every
-- authenticated read/write is scoped by tenant_id, enforced by RLS. RedyQuote
-- has no equivalent of this file's `tenants` table or the tenant_id column on
-- profiles -- see the convergence spec's D-15.
--
-- NOT INCLUDED HERE, deliberately: a signup trigger that auto-creates a
-- tenant (RedyQuote's handle_new_user() pattern). Tenant provisioning is a
-- named service-role system path (ARCHITECTURE §1/§5), not a bare
-- auth.users trigger, and its actual shape -- self-serve signup vs. invited
-- seats, what happens to the FIRST user of a new tenant -- is not specified
-- anywhere in docs/PRD.md or docs/DATABASE.md (currently a stub). Inventing
-- that flow here would be a product decision made inside a migration file.
-- A new auth.users row gets no profile until provisioning is designed and
-- built.
-- ============================================================================

create table tenants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger tenants_set_updated_at
  before update on tenants
  for each row execute function set_updated_at();

-- No read/write policy on `tenants` for authenticated users yet -- nothing
-- reads or writes it from client code (no provisioning UI, no tenant
-- switcher). RLS is enabled and default-deny per ARCHITECTURE §5's "never
-- briefly off" rule; there simply are no policies granting access yet.
alter table tenants enable row level security;

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  tenant_id   uuid not null references tenants(id) on delete restrict,
  full_name   text not null,
  role        user_role not null default 'sales_rep',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index profiles_tenant_id_idx on profiles (tenant_id);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- is_admin() -- SECURITY DEFINER so RLS policies on `profiles` itself don't
-- recurse when they call it. Same pattern as RedyQuote's is_admin().
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'owner_admin'
  );
$$;

-- current_tenant_id() -- SECURITY DEFINER helper so every tenant-scoped
-- policy, here and in future migrations, reads the caller's own tenant from
-- one place rather than repeating the subquery. Bypasses RLS internally for
-- the same reason is_admin() does: without SECURITY DEFINER, a policy that
-- calls this from within profiles' own RLS would recurse.
create or replace function current_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from public.profiles where id = auth.uid();
$$;

-- ----------------------------------------------------------------------------
-- Role-escalation guard, same pattern and reasoning as
-- RedyQuote:0002_profiles_and_auth.sql's "Role-escalation guard": RLS cannot
-- express "this column may change only if X", so without this trigger any
-- authenticated user could self-promote to owner_admin via the
-- profiles_update_self_or_admin policy below.
--
-- The `auth.uid() is not null` carve-out is kept for the same reason
-- RedyQuote keeps it: it is what lets a dashboard SQL statement (which runs
-- as `postgres`, auth.uid() = NULL) create the first Owner/Admin of a new
-- tenant. No service-role key exists in the app's own request path
-- (docs/TECH-STACK.md confines it to the three system paths), so this is not
-- a hole reachable from client code -- every profiles policy is `to
-- authenticated`, and RLS rejects an anon UPDATE before this trigger fires.
-- ----------------------------------------------------------------------------
create or replace function enforce_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not is_admin() then
    raise exception 'Only an Owner/Admin may change a profile role';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role_change
  before update on profiles
  for each row execute function enforce_profile_role_change();

-- Blocks a tenant_id change through the client-facing update path. RLS's
-- `with check` on profiles_update_self_or_admin cannot express "this column
-- is immutable"; a trigger can. RedyQuote has no equivalent -- single-tenant,
-- so there is no tenant_id to protect.
create or replace function enforce_profile_tenant_immutable()
returns trigger
language plpgsql
as $$
begin
  if new.tenant_id is distinct from old.tenant_id then
    raise exception 'tenant_id is immutable on profiles';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_tenant_immutable
  before update on profiles
  for each row execute function enforce_profile_tenant_immutable();

-- ----------------------------------------------------------------- profiles RLS
alter table profiles enable row level security;

-- Reads are scoped to the caller's own tenant. RedyQuote's equivalent policy
-- is flat (any authenticated user reads every profile) because it has one
-- tenant; that would be a cross-tenant leak here (NFR-008).
create policy "profiles_select_own_tenant"
  on profiles for select
  to authenticated
  using (tenant_id = current_tenant_id());

create policy "profiles_update_self_or_admin"
  on profiles for update
  to authenticated
  using (id = auth.uid() or (tenant_id = current_tenant_id() and is_admin()))
  with check (id = auth.uid() or (tenant_id = current_tenant_id() and is_admin()));
-- Role changes and tenant_id changes through this policy are additionally
-- gated by the two triggers above.

-- no INSERT policy: profiles are created only by tenant provisioning
-- (a future service-role system path), never by client code
-- no DELETE policy: profiles are never deleted by the app
