# Person and Organization records — Spec

**Work item:** [#41 PRD-008: Contact and company records (Must)](https://github.com/Cueserve/cs-cueviksync/issues/41)
**Date:** 2026-09-23
**Status:** Approved
**Derived from:** [intent.md](intent.md)

> Transient per [docs/work/README.md](../README.md). Not a source-of-truth document: where
> this disagrees with a file under `docs/`, that file wins.

---

## Contents

1. [Behaviour](#1-behaviour)
2. [Data model](#2-data-model)
3. [Server surface](#3-server-surface)
4. [User interface](#4-user-interface)
5. [Rejected alternatives](#5-rejected-alternatives)
6. [Tests](#6-tests)
7. [Downstream document changes](#7-downstream-document-changes)
8. [Requires human approval before `/work:3-plan`](#8-requires-human-approval-before-work3-plan)
9. [Out of scope](#9-out-of-scope)

---

## 1. Behaviour

Numbered so tests and tasks can cite them. Each traces to a requirement in
[docs/PRD.md](../../PRD.md).

**Records**

1. A user can create, view, edit, and delete a Person and an Organization. (PRD-008)
2. A Person can exist with no Organization. An Organization can exist with no Person. (PRD-008)
3. A Person must carry an email address or a phone number. A value of only whitespace counts as
   absent. (PRD-008, and the reason is in §5.)
4. A Person's surname is optional. A single-name walk-in is a valid record. (PRD-008)
5. A Person can be linked to two or more Organizations, and every link is visible from the
   Person. (PRD-009)
6. Creating a Person or Organization whose name, email, or phone matches an existing record shows
   a warning listing the suspected matches. The user may proceed or cancel. It never blocks.
   (PRD-010)

**Lists**

7. Five lists are configurable per tenant: categories, person-organization roles, contact duties,
   organization-relationship types, and lifecycle statuses. (PRD-045)
8. Only an Owner/Admin may create, rename, reorder, or deactivate a list value. Every tenant
   member may read the lists. (PRD-045, PRD-026)
9. A new tenant is seeded with a usable starting set of all five lists. (PRD-045)
10. A user picks a value from a list. No path lets a user create a list value while creating or
    editing a record. (PRD-045)
11. A deactivated value is refused on a new or changed record and stays valid on every record that
    already references it. (PRD-046)
12. Deleting a list value that is still referenced is refused. (PRD-046)
13. The anchored values — Prospect, Client, and Primary contact — can be renamed but can never be
    deleted or deactivated. (PRD-046)

**Category scope**

14. A person-scoped category cannot be assigned to an Organization, and an organization-scoped
    category cannot be assigned to a Person. (PRD-045)

**Lifecycle status**

15. A Person or Organization may carry a lifecycle status. Having none is valid and permanent —
    a Person who only ever orders as a contact of Organizations never accumulates one. (PRD-047)
16. Qualifying a record that is already at Client does not move it back to Prospect. (PRD-047)
17. An Owner/Admin may set a status to any value by hand, including backwards, and doing so does
    not stop it advancing again later. (PRD-047)
18. Every status change records the previous status, the new status, what caused it, who did it,
    and when. A change to the same status it already holds records nothing. (PRD-047, NFR-011)

**Links**

19. A link between a Person and an Organization carries exactly one role. A pair can be linked
    only once. (PRD-048)
20. A link carries zero or more duties. Several people in one Organization may hold the same duty.
    (PRD-048)
21. Deleting a link deletes the duties held on it. (PRD-048)
22. Two Organizations can be linked with a relationship type, readable from either side using the
    type's forward name from one end and its inverse name from the other. An Organization cannot
    be linked to itself. (PRD-049)

**Access**

23. Every read and write is scoped to the caller's tenant by RLS. A request for another tenant's
    record returns zero rows rather than an error. (PRD-025, NFR-008)
24. Owner/Admin, Sales Manager, and Sales Rep have full read and write on all records above.
    (PRD-027)
25. Office Administrator may create a Person or Organization and edit its name, email, phone,
    website, and category. It may not set a lifecycle status, create or edit a link, assign a
    duty, create an organization relationship, or delete a record. (PRD-027)
26. Lifecycle-status history is readable by every role that can read records, and can only ever
    be inserted — never updated, never deleted. (NFR-011)
27. Operations has no access to any Person, Organization, link, or history row. It reads the five
    lists, like every role, and cannot edit them. (PRD-027)
28. Inactive is not shielded from automatic events. Re-qualifying an Inactive record moves it to
    Prospect, and winning a deal for one moves it to Client. Inactive is an ordinary manual label,
    not a do-not-contact flag — if real suppression is ever needed, it is a different mechanism
    from lifecycle status. (PRD-047)
29. A status can only change through `set_lifecycle_status()`, so no change goes unrecorded. A
    direct write of the status column, on insert or on update, is refused. The recorded actor is
    always the caller; nobody can record a change under another user's name. (NFR-011, and
    CLAUDE.md "Audit in the same transaction")

---

## 2. Data model

Eleven new tables, one view, six functions, and four enum types. One existing type is altered:
`user_role` gains `operations`, in its own migration file ahead of the rest — see §2.1.

The pattern is copied from `supabase/migrations/0002_tenants_profiles_and_auth.sql`: every policy
is `to authenticated`, scoped with `using (tenant_id = current_tenant_id())`, and RLS is enabled
on every table so the absence of a policy denies rather than permits.

### 2.1 Enum types

```sql
create type category_scope   as enum ('person', 'organization');
create type lifecycle_anchor as enum ('prospect', 'client');
create type duty_anchor      as enum ('primary');
create type lifecycle_source as enum ('manual', 'qualified', 'won');
```

`lifecycle_anchor` and `duty_anchor` are how the system finds the values it depends on. Resolving
them by name would break the moment a tenant renames Prospect; resolving them by display order
would break the moment a tenant reorders the list.

**`user_role` gains a fifth value, in a migration file of its own:**

```sql
alter type user_role add value 'operations';
```

PRD-024 requires five roles and `0001` created four. Jobs is committed thin-core scope —
PRD-031 through PRD-043, eight of them Must — so Operations is a role this release owes, not a
placeholder for a deferred module. It lands here because this is the Pull Request (PR) that sets
every role's access to these tables, and §1.27 cannot keep Operations out of a table on behalf of
a role that does not exist.

It is a separate file from the contact tables: one logical change per migration
([docs/PROJECT-STRUCTURE.md](../../PROJECT-STRUCTURE.md) §5), and PostgreSQL will not let a new
enum value be used in the transaction that adds it. Nothing here uses it, so the separation costs
nothing and removes the question.

### 2.2 The five configurable lists

All five share a base shape: `id`, `tenant_id`, `name`, `position`, `active`, `created_at`,
`updated_at`, `unique (tenant_id, id)`, a case-insensitive unique name per tenant, and RLS
enabled. `position` controls dropdown order only and has no effect on any rule.

```sql
create table categories (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id),
  name        text not null,
  applies_to  category_scope not null,
  position    int not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (tenant_id, id, applies_to)
);
create index categories_tenant_idx on categories (tenant_id, applies_to);
create unique index categories_tenant_scope_name_idx
  on categories (tenant_id, applies_to, lower(name));

create table person_organization_roles (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id),
  name        text not null,
  position    int not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (tenant_id, id)
);
create unique index por_tenant_name_idx on person_organization_roles (tenant_id, lower(name));

create table contact_duties (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id),
  name        text not null,
  position    int not null,
  active      boolean not null default true,
  system_key  duty_anchor,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (tenant_id, id)
);
create unique index cd_tenant_name_idx on contact_duties (tenant_id, lower(name));
create unique index cd_tenant_system_key_idx
  on contact_duties (tenant_id, system_key) where system_key is not null;

create table organization_relationship_types (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id),
  name          text not null,
  inverse_name  text not null,
  position      int not null,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (tenant_id, id)
);
create unique index ort_tenant_name_idx
  on organization_relationship_types (tenant_id, lower(name));

create table lifecycle_statuses (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id),
  name        text not null,
  position    int not null,
  active      boolean not null default true,
  system_key  lifecycle_anchor,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (tenant_id, id)
);
create unique index ls_tenant_name_idx on lifecycle_statuses (tenant_id, lower(name));
create unique index ls_tenant_system_key_idx
  on lifecycle_statuses (tenant_id, system_key) where system_key is not null;
```

Each gets the shared `set_updated_at()` trigger from `0001`.

**Starting values**, seeded per tenant and editable afterwards:

| List                              | Values                                                                                                           |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `categories` (person)             | Individual, Self-employed                                                                                        |
| `categories` (organization)       | Business, Agency, Reseller, Non-profit, Education, Healthcare, Government                                        |
| `person_organization_roles`       | Owner, Director, Manager, Designer, Bookkeeper, Assistant, Employee, Agent                                       |
| `contact_duties`                  | **Primary contact** (`system_key = 'primary'`), Billing contact, Proof approver, Shipping/Receiving              |
| `organization_relationship_types` | Parent of / Subsidiary of · Branch of / Has branch · Represents / Represented by · Franchisor of / Franchisee of |
| `lifecycle_statuses`              | Lead, **Prospect** (`system_key = 'prospect'`), **Client** (`system_key = 'client'`), Inactive                   |

Lead and Inactive carry no anchor. Nothing sets them automatically; they are ordinary values a
user picks, on the same footing as any status a tenant adds.

**Employee is the fallback role.** A user who cannot place a person in any other role picks
Employee rather than inventing one — which is §1.10, and the reason Employee is in the starting
set at all.

### 2.3 Person and Organization

```sql
create table persons (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid not null references tenants(id),
  first_name            text not null,
  last_name             text,
  email                 text,
  phone                 text,
  category_id           uuid not null,
  category_applies_to   category_scope not null generated always as ('person') stored,
  lifecycle_status_id   uuid,
  custom_fields         jsonb not null default '{}',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint persons_contact_detail_required
    check (nullif(btrim(email), '') is not null or nullif(btrim(phone), '') is not null),

  unique (tenant_id, id),
  foreign key (tenant_id, category_id, category_applies_to)
    references categories (tenant_id, id, applies_to),
  foreign key (tenant_id, lifecycle_status_id)
    references lifecycle_statuses (tenant_id, id)
);

create index persons_tenant_email_idx    on persons (tenant_id, lower(email)) where email is not null;
create index persons_tenant_phone_idx    on persons (tenant_id, phone) where phone is not null;
create index persons_tenant_name_idx     on persons (tenant_id, lower(last_name), lower(first_name));
create index persons_tenant_category_idx on persons (tenant_id, category_id);
create index persons_tenant_status_idx   on persons (tenant_id, lifecycle_status_id);

create table organizations (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid not null references tenants(id),
  name                  text not null,
  email                 text,
  phone                 text,
  website               text,
  category_id           uuid not null,
  category_applies_to   category_scope not null generated always as ('organization') stored,
  lifecycle_status_id   uuid,
  custom_fields         jsonb not null default '{}',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  unique (tenant_id, id),
  foreign key (tenant_id, category_id, category_applies_to)
    references categories (tenant_id, id, applies_to),
  foreign key (tenant_id, lifecycle_status_id)
    references lifecycle_statuses (tenant_id, id)
);

create index organizations_tenant_email_idx    on organizations (tenant_id, lower(email)) where email is not null;
create index organizations_tenant_phone_idx    on organizations (tenant_id, phone) where phone is not null;
create index organizations_tenant_name_idx     on organizations (tenant_id, lower(name));
create index organizations_tenant_category_idx on organizations (tenant_id, category_id);
create index organizations_tenant_status_idx   on organizations (tenant_id, lifecycle_status_id);
```

**`category_applies_to` is a generated column, and it is what enforces §1.14.** It lets
person-categories and organization-categories share one `categories` table while making it
structurally impossible to file a Person under an organization-only category. The composite
foreign key rejects it exactly the way a missing identifier would, with no trigger involved.

**`unique (tenant_id, id)`** on both tables is redundant as a uniqueness claim — `id` is already
the primary key. It exists so other tables can carry a composite foreign key that includes
`tenant_id`, which is what makes a cross-tenant reference impossible rather than merely unlikely.

### 2.4 Links

```sql
create table person_organizations (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references tenants(id),
  person_id        uuid not null,
  organization_id  uuid not null,
  role_id          uuid not null,
  active           boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  unique (tenant_id, id),
  unique (person_id, organization_id),
  foreign key (tenant_id, person_id)       references persons (tenant_id, id) on delete cascade,
  foreign key (tenant_id, organization_id) references organizations (tenant_id, id) on delete cascade,
  foreign key (tenant_id, role_id)         references person_organization_roles (tenant_id, id)
);
create index po_tenant_person_idx on person_organizations (tenant_id, person_id);
create index po_tenant_org_idx    on person_organizations (tenant_id, organization_id);
create index po_tenant_role_idx   on person_organizations (tenant_id, role_id);

create table person_organization_duties (
  id                      uuid primary key default gen_random_uuid(),
  tenant_id               uuid not null references tenants(id),
  person_organization_id  uuid not null,
  duty_id                 uuid not null,
  created_at              timestamptz not null default now(),

  unique (person_organization_id, duty_id),
  foreign key (tenant_id, person_organization_id)
    references person_organizations (tenant_id, id) on delete cascade,
  foreign key (tenant_id, duty_id) references contact_duties (tenant_id, id)
);
create index pod_tenant_link_idx on person_organization_duties (tenant_id, person_organization_id);
create index pod_tenant_duty_idx on person_organization_duties (tenant_id, duty_id);

create table organization_relationships (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid not null references tenants(id),
  from_organization_id  uuid not null,
  to_organization_id    uuid not null,
  relationship_type_id  uuid not null,
  active                boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  check (from_organization_id <> to_organization_id),
  unique (from_organization_id, to_organization_id, relationship_type_id),
  foreign key (tenant_id, from_organization_id) references organizations (tenant_id, id) on delete cascade,
  foreign key (tenant_id, to_organization_id)   references organizations (tenant_id, id) on delete cascade,
  foreign key (tenant_id, relationship_type_id) references organization_relationship_types (tenant_id, id)
);
create index orel_tenant_from_idx on organization_relationships (tenant_id, from_organization_id);
create index orel_tenant_to_idx   on organization_relationships (tenant_id, to_organization_id);
create index orel_tenant_type_idx on organization_relationships (tenant_id, relationship_type_id);
```

**Every foreign key has an index that leads with its columns**, per
[docs/DATABASE.md](../../DATABASE.md) §4. Each composite index also serves the single-column
`tenant_id` reference to `tenants`. Postgres indexes the referenced side of a foreign key, never
the referencing side, so without these a delete on the parent scans the child.

**There is no Person-to-Person link table, and that is the enforcement.** No trigger is needed to
prevent one because nothing can hold it.

**Organization-to-Organization links are informational.** They render on both records and never
affect who an opportunity, quote, or job belongs to.

### 2.5 Lifecycle status history

```sql
create table lifecycle_status_history (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references tenants(id),
  person_id        uuid,
  organization_id  uuid,
  from_status_id   uuid,
  to_status_id     uuid,
  source           lifecycle_source not null,
  actor_id         uuid not null references profiles(id),
  created_at       timestamptz not null default now(),

  check (num_nonnulls(person_id, organization_id) <= 1),
  foreign key (tenant_id, person_id)
    references persons (tenant_id, id) on delete set null (person_id),
  foreign key (tenant_id, organization_id)
    references organizations (tenant_id, id) on delete set null (organization_id),
  foreign key (tenant_id, from_status_id) references lifecycle_statuses (tenant_id, id),
  foreign key (tenant_id, to_status_id)   references lifecycle_statuses (tenant_id, id)
);
create index lsh_tenant_person_idx      on lifecycle_status_history (tenant_id, person_id);
create index lsh_tenant_org_idx         on lifecycle_status_history (tenant_id, organization_id);
create index lsh_tenant_from_status_idx on lifecycle_status_history (tenant_id, from_status_id);
create index lsh_tenant_to_status_idx   on lifecycle_status_history (tenant_id, to_status_id);
create index lsh_actor_idx              on lifecycle_status_history (actor_id);
```

**`on delete set null (person_id)`, with the column named.** A plain `on delete set null` on a
composite key nulls every column in it — `tenant_id` included, which is `not null`, so deleting
any Person with history would fail. Naming the column (PostgreSQL 15 and later) nulls only the
link.

**The status columns are foreign keys**, so a history row can never point at a status that no
longer exists. The consequence is deliberate: a status that has appeared in history can be
deactivated but never deleted — §1.12's rule, applied to the audit trail as well as to live
records.

**The check is `<= 1`, not `= 1`.** Both references are `on delete set null`, so a row whose
subject was deleted keeps its event skeleton — actor, timestamp, transition — with the
identifying link stripped. That is how [docs/ARCHITECTURE.md](../../ARCHITECTURE.md) §7 already
treats `StageHistory` and `QuoteStatusHistory` under an erasure request, and it is why `= 1`
would make erasure and audit integrity mutually exclusive.

### 2.6 The directory view

```sql
create view directory with (security_invoker = true) as
  select id, tenant_id, 'person'::text as kind,
         btrim(first_name || ' ' || coalesce(last_name, '')) as display_name,
         email, phone, category_id, lifecycle_status_id, created_at
    from persons
  union all
  select id, tenant_id, 'organization'::text as kind,
         name as display_name,
         email, phone, category_id, lifecycle_status_id, created_at
    from organizations;
```

`security_invoker = true` means the view runs with the querying user's own grants, so RLS on
`persons` and `organizations` applies. Without it the view would own its creator's access and
become a way around the policies below.

### 2.7 Functions and triggers

**`is_list_value_active()`** — one parameterised trigger function, attached to all seven
columns that reference a list: `category_id` and `lifecycle_status_id` on both `persons` and
`organizations`, `person_organizations.role_id`, `person_organization_duties.duty_id`, and
`organization_relationships.relationship_type_id`. It
takes the referenced table name and column name as trigger arguments and raises when the target
row has `active = false`.

This is what satisfies §1.11. A foreign key alone cannot express "must be active unless already
referenced" — it has no way to distinguish a new assignment from an existing one. The trigger
fires only on insert and on update of the referencing column, so existing rows are untouched.

**`protect_anchored_list_values()`** — a trigger on `lifecycle_statuses` and `contact_duties`
that raises on any delete where `system_key is not null`, and on any update setting
`active = false` where `system_key is not null`. Changes to `name` pass. This satisfies §1.13.

**`set_lifecycle_status()`** — the only path that writes a lifecycle status, satisfying §1.16
through §1.18 and §1.29.

**The caller names neither the tenant nor the actor.** Both come from the session —
`current_tenant_id()` and `auth.uid()` — so a caller reaching this function through the API
cannot record a change in another tenant or under another user's name. It runs as the invoker,
so RLS on `persons` and `organizations` still decides whether the caller may touch the record at
all.

```sql
create function set_lifecycle_status(
  p_person_id        uuid,
  p_organization_id  uuid,
  p_new_status_id    uuid,
  p_source           lifecycle_source
) returns void language plpgsql as $$
declare
  v_tenant_id         uuid := current_tenant_id();
  v_actor_id          uuid := auth.uid();
  v_current_status_id uuid;
  v_client_status_id  uuid;
begin
  if v_actor_id is null or v_tenant_id is null then
    raise exception 'set_lifecycle_status requires an authenticated caller with a tenant';
  end if;
  if num_nonnulls(p_person_id, p_organization_id) <> 1 then
    raise exception 'exactly one of p_person_id and p_organization_id must be given';
  end if;

  if p_person_id is not null then
    select lifecycle_status_id into v_current_status_id from persons
      where id = p_person_id and tenant_id = v_tenant_id for update;
  else
    select lifecycle_status_id into v_current_status_id from organizations
      where id = p_organization_id and tenant_id = v_tenant_id for update;
  end if;
  if not found then
    raise exception 'record not found';
  end if;

  if p_source = 'qualified' then
    select id into v_client_status_id from lifecycle_statuses
      where tenant_id = v_tenant_id and system_key = 'client';
    if v_current_status_id = v_client_status_id then
      return;
    end if;
  end if;

  if v_current_status_id is not distinct from p_new_status_id then
    return;
  end if;

  perform set_config('cueviksync.lifecycle_write', 'on', true);
  if p_person_id is not null then
    update persons set lifecycle_status_id = p_new_status_id where id = p_person_id;
  else
    update organizations set lifecycle_status_id = p_new_status_id where id = p_organization_id;
  end if;
  perform set_config('cueviksync.lifecycle_write', 'off', true);

  insert into lifecycle_status_history
    (tenant_id, person_id, organization_id, from_status_id, to_status_id, source, actor_id)
  values
    (v_tenant_id, p_person_id, p_organization_id, v_current_status_id, p_new_status_id,
     p_source, v_actor_id);
end;
$$;
```

**`guard_lifecycle_status()`** — a `before insert or update` trigger on `persons` and
`organizations`. It raises when an insert carries a non-null `lifecycle_status_id`, or an update
changes it, unless the transaction-local setting `cueviksync.lifecycle_write` is `'on'`. Only
`set_lifecycle_status()` sets it, and switches it back off straight after its one update. That
makes the history row impossible to skip, which the write policies alone cannot express.

An API caller cannot set the flag itself: PostgREST exposes only functions in `public`, and
`set_config` lives in `pg_catalog`.

**`current_user_role()`** — returns the caller's `profiles.role`. `security definer` with
`search_path = public`, for the same reason as `current_tenant_id()` in `0002`: a policy that
reads `profiles` directly would recurse through `profiles`' own RLS. §2.8 uses it.

**The forward-only rule reduces to one comparison.** Once a record is at Client, a `'qualified'`
event does nothing. There is nothing above Client for a `'won'` event to protect against, and a
`'manual'` source is never guarded — §1.17 depends on that. No position comparison is involved,
so renaming or reordering statuses cannot change behaviour.

**Which record an automatic event targets is the caller's decision, not this function's.** When
the future Opportunity — or, since #106, a directly booked Job — carries an organization, the
event targets the Organization, not the person who placed the order on its behalf. That contract
lives in ARCHITECTURE §5, not here — see §7.

**`seed_tenant_contact_lists(p_tenant_id uuid)`** — inserts the starting values in §2.2 for one
tenant. Tenant provisioning calls it when provisioning exists; until then it is called by hand
for a pilot tenant. It is idempotent: it inserts nothing for a tenant that already has values.

### 2.8 RLS

Every table above gets `enable row level security`. Policies follow `0002`'s naming and shape.

**The five lists** — read by every role in the tenant, Operations included, and written by
Owner/Admin only. That is PRD-027's "every role reads the contact value lists", and it extends
PRD-026's admin-only-configuration boundary to them.

```sql
create policy "categories_select_own_tenant" on categories for select
  to authenticated using (tenant_id = current_tenant_id());
create policy "categories_write_admin" on categories for all
  to authenticated
  using (tenant_id = current_tenant_id() and is_admin())
  with check (tenant_id = current_tenant_id() and is_admin());
```

The same pair, renamed, on `person_organization_roles`, `contact_duties`,
`organization_relationship_types`, and `lifecycle_statuses`.

**Records and links** — read and written by the four roles PRD-027 grants them to, named in an
allowlist. The field restriction that separates Office Administrator from the sales roles
(§1.25) lives in the Server Action, not here; §5 explains why.

```sql
create policy "persons_select_contact_roles" on persons for select
  to authenticated
  using (tenant_id = current_tenant_id()
         and current_user_role() in ('owner_admin', 'sales_manager', 'sales_rep', 'office_admin'));
create policy "persons_write_contact_roles" on persons for all
  to authenticated
  using (tenant_id = current_tenant_id()
         and current_user_role() in ('owner_admin', 'sales_manager', 'sales_rep', 'office_admin'))
  with check (tenant_id = current_tenant_id()
         and current_user_role() in ('owner_admin', 'sales_manager', 'sales_rep', 'office_admin'));
```

The same pair on `organizations`, `person_organizations`, `person_organization_duties`, and
`organization_relationships`.

**Operations** — excluded from records, links, and history by being absent from the allowlist.
A tenant check alone would not do it: `current_tenant_id()` returns an Operations user's tenant
like anyone else's. **An allowlist rather than `<> 'operations'`** so a role added later gets
nothing here until a policy names it — the policies fail closed.

**History** — readable by the same four roles, insert-only, with no update or delete policy at
all, so both are denied by default.

```sql
create policy "lsh_select_contact_roles" on lifecycle_status_history for select
  to authenticated
  using (tenant_id = current_tenant_id()
         and current_user_role() in ('owner_admin', 'sales_manager', 'sales_rep', 'office_admin'));
create policy "lsh_insert_contact_roles" on lifecycle_status_history for insert
  to authenticated
  with check (tenant_id = current_tenant_id()
         and current_user_role() in ('owner_admin', 'sales_manager', 'sales_rep', 'office_admin'));
```

---

## 3. Server surface

Placement follows [docs/PROJECT-STRUCTURE.md](../../PROJECT-STRUCTURE.md) §2. Question 3 — "does
it write to the database?" — puts every action in `src/server/actions/`; question 4 puts the
schemas in `src/lib/`. Neither directory exists yet.

| File                                  | Holds                                                                                                                                   |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `src/server/actions/persons.ts`       | `createPerson`, `updatePerson`, `deletePerson`, `setPersonLifecycleStatus`, `findDuplicatePersons`                                      |
| `src/server/actions/organizations.ts` | the same five for Organization, plus `linkPersonToOrganization`, `unlinkPersonFromOrganization`, `setLinkDuties`, `relateOrganizations` |
| `src/server/actions/contact-lists.ts` | `createListValue`, `renameListValue`, `reorderListValue`, `deactivateListValue`, `deleteListValue`                                      |
| `src/lib/validation/person.ts`        | `personCreateSchema`, `personUpdateSchema`                                                                                              |
| `src/lib/validation/organization.ts`  | `organizationCreateSchema`, `organizationUpdateSchema`, `personOrganizationLinkSchema`, `organizationRelationshipSchema`                |
| `src/lib/validation/contact-lists.ts` | one schema per list, sharing a base                                                                                                     |

Every file in `src/server/actions/` starts with `import 'server-only'`.

**Client:** all of them use `createClient` from `src/lib/supabase/server.ts`, which carries the
caller's JWT so RLS scopes the query. **No action here uses `service-role.ts`** — intent §5
establishes there is no service-role path in this slice, and `seed_tenant_contact_lists` is
called by provisioning or by hand, never by an action.

**Validation:** every action validates its input against its Zod schema before touching the
database ([docs/ENGINEERING-RULES.md](../../ENGINEERING-RULES.md) §1). `personCreateSchema`
carries the email-or-phone rule from §1.3 so a user gets a field error rather than a constraint
violation; the database check constraint stays as the backstop.

**No list field has a default.** `category_id`, `role_id`, and `duty_id` are required with no
default value in any schema, so a caller must choose one. A default would quietly become
"whatever is listed first."

**Office Administrator (§1.25)** is enforced by each action reading the caller's role from
`profiles` and rejecting a write outside the permitted fields. `createPerson` and `updatePerson`
accept the restricted field set for that role; `deletePerson`, `setPersonLifecycleStatus`,
`linkPersonToOrganization`, `setLinkDuties`, and `relateOrganizations` reject it outright.

**Lifecycle status:** `setPersonLifecycleStatus` and its Organization twin call
`supabase.rpc('set_lifecycle_status', …)` with source `'manual'`, passing neither tenant nor
actor. `createPerson` and `createOrganization` take no status field — the guard in §2.7 would
refuse it — so a record that needs one gets it through a second call.

**Invalidation:** `revalidatePath` after every mutation. There is no client-side cache library
([docs/ENGINEERING-RULES.md](../../ENGINEERING-RULES.md) §1).

**Duplicate detection (§1.6)** is a read, not a constraint. `findDuplicatePersons` queries the
`lower(email)`, phone, and `lower(name)` indexes in §2.3 and returns candidates. The caller shows
them and decides. Nothing in the database prevents the insert.

---

## 4. User interface

**None.** No route, no component, no design token.

`/contacts` stays a dead link from the sidebar. The screens that read these tables belong to #42
and #43. This slice ends at the Server Action, so the tenant-isolation pattern the next eight
tables copy is under test before a user-interface review is added to the same Pull Request (PR).

Because nothing here is UI-bearing, `/impeccable shape` does not apply — the order in
[CLAUDE.md](../../../CLAUDE.md) "Building UI" exempts backend-only work.

**One rule this spec hands to the screens #42 and #43 will build:** no list control pre-selects a
value. A form with nothing pre-checked forces a real choice. It matters most for category, where
a rep often cannot tell Individual from Self-employed at first contact and would otherwise accept
whatever loads first.

---

## 5. Rejected alternatives

- **One `contacts` table with a `kind` discriminator.** Rejected: a Person requires a first name
  and an email-or-phone, an Organization requires a name and neither; the two draw from different
  category scopes. One table would make half its columns conditionally required, which no
  constraint expresses cleanly. The `directory` view gives the single list a screen wants without
  the shared table.
- **A unique index on name, email, or phone to prevent duplicates.** Rejected: PRD-010 says warn,
  not block. Two different people genuinely named John Smith is a correct state, and a unique
  index makes it unrepresentable.
- **Six near-identical trigger functions for the deactivated-value check.** Rejected in favour of
  one parameterised function. Six copies drift; the sixth is the one that gets forgotten.
- **A `position`-based forward-only rule** ("status position must not decrease"). Rejected:
  reordering a dropdown would silently change qualification behaviour. Anchoring on `system_key`
  makes renaming and reordering safe by construction.
- **Column-level RLS for the Office Administrator field restriction.** Rejected this session: it
  would need a column-privilege grant per column plus its own policy, and Server Actions are
  already the only authenticated write path. Revisit if a second write path is ever added —
  that is the condition under which this becomes the wrong call.
- **Keeping Operations out with `current_user_role() <> 'operations'`.** Rejected: it fails
  open. A sixth role added later would reach every customer record on the day it is created,
  without anyone writing a policy for it. The allowlist in §2.8 makes a new role's access a
  decision someone has to make.
- **Trusting the Server Actions to be the only writer of `lifecycle_status_id`.** Rejected: the
  write policy lets any caller in the tenant update the column through the API, and every such
  update would skip the history row. CLAUDE.md makes "Audit in the same transaction" an
  invariant, so it is enforced where the column lives — the guard trigger in §2.7.
- **Passing tenant and actor into `set_lifecycle_status()`.** Rejected: the function is callable
  through the API, so a caller could name any actor. Both are read from the session instead.
- **Entity-Attribute-Value tables or per-tenant columns for custom fields.** Banned outright by
  [docs/ENGINEERING-RULES.md](../../ENGINEERING-RULES.md) §2. `custom_fields jsonb` is the
  approved shape.
- **Seeding list values as plain rows in the migration.** Rejected: there are no tenants today, so
  it would insert nothing, and provisioning would still have nothing to call.
- **Blocking delete until Opportunity exists.** Rejected this session: it ships a PRD-008 Must as
  a deliberate failure. The `on delete restrict` arrives with the table it protects.
- **Dropping the Operations role from PRD-024 and PRD-027** rather than adding it to `user_role`.
  Rejected on the evidence: Jobs is committed thin-core scope — 13 requirements in PRD §6, eight
  of them Must; PRD §9 excludes only depth _beyond_ thin-core; PRODUCT §4 lists Job/Order
  execution as committed. The argument for dropping it was that no job table exists, which
  compares the role against today's code rather than the release it belongs to. No `persons`
  table exists either.

---

## 6. Tests

Vitest, against the local Supabase stack (`npx supabase start`) — never the hosted project, because
these cases are destructive ([docs/ENGINEERING-RULES.md](../../ENGINEERING-RULES.md) §3,
[docs/ENVIRONMENTS.md](../../ENVIRONMENTS.md) §1).

**Where the stack runs.** On the developer machine, Docker Desktop per ENVIRONMENTS §4 steps 1–2,
installed before the build starts. In CI, `ci.yml`'s `check` job gains `supabase/setup-cli` and
`supabase start` ahead of `npm run test`, in the same PR as the tests — otherwise the first test
file turns the gate permanently red.

**Mandatory cases from ENGINEERING-RULES §3 that apply here:**

- **Tenant isolation.** For every one of the eleven tables: a session scoped to tenant B reads
  zero rows of tenant A's data, and a write naming tenant A's row from tenant B is rejected.
  Covers §1.23 and NFR-008.
- **Cross-tenant composite foreign keys.** A crafted insert cannot attach another tenant's
  category, role, duty, status, or relationship type — the composite key rejects it. This is the
  case the `unique (tenant_id, id)` columns exist for.
- **State-machine rejection.** Qualifying an already-Client record does not demote it (§1.16); a
  manual downgrade followed by re-qualification does advance it, proving §1.17 is not a lock.

**Worker idempotency does not apply** — this slice has no queue consumer and no worker.

**Behaviour from §1:**

- Email-or-phone: a Person with neither is rejected; whitespace in both counts as neither (§1.3).
- Surname absent is accepted (§1.4).
- A person-scoped category on an Organization is rejected, and the reverse (§1.14).
- A deactivated value is rejected on a new record and stays valid on a record that already holds
  it (§1.11).
- Deleting a referenced list value is rejected (§1.12).
- Prospect, Client, and Primary contact cannot be deleted or deactivated, and can be renamed
  (§1.13).
- A status change writes exactly one history row; setting the same status writes none (§1.18).
- Qualifying an Inactive record moves it to Prospect (§1.28).
- One role per pair, and a second link for the same pair is rejected (§1.19).
- Deleting a link deletes its duties (§1.21).
- An Organization cannot be related to itself (§1.22).
- Office Administrator cannot set a status, link, assign a duty, or delete (§1.25).
- History cannot be updated or deleted (§1.26).
- Operations reads zero rows from every record, link, and history table, has every write there
  rejected, and reads all five lists (§1.27).
- A direct update of `lifecycle_status_id`, and an insert carrying one, are both rejected; the
  history row's actor is the caller, whatever else is sent (§1.29).
- `findDuplicatePersons` returns candidates on a name, an email, and a phone match (§1.6).

**Not testable in this slice:** delete blocked by a referencing Opportunity. No Opportunity table
exists. Recorded in §9, not skipped.

---

## 7. Downstream document changes

Each is its own Pull Request per [CONTRIBUTING.md](../../../CONTRIBUTING.md).

1. **`docs/PRD.md` §1 — done, #98.** It said job execution was deferred, contradicting §6, §9,
   and PRODUCT §4, and was the evidence behind this spec first proposing to drop the Operations
   role. Corrected on 2026-09-23.
2. **`docs/PRD.md` PRD-024 and PRD-027 — no change needed, and that is the finding.** Both name
   five roles including Operations, and both are correct. The database is what was wrong, and
   §2.1 fixes it.
3. **`docs/ARCHITECTURE.md` §5 — done, #99.** The Opportunity and Job contract now lives there:
   `person_id not null`, `organization_id` nullable, both `on delete restrict`; the pair must be
   linked; frozen once Won; Job inherits; Reorder copies without re-checking; an inactive link
   warns; lifecycle events target the Organization when there is one. Added on 2026-09-23.
   Amended 2026-09-29 (#106): a Job may be booked without an Opportunity, and Reorder is a
   direct booking — see ARCHITECTURE §5.
4. **`docs/DATABASE.md`** — §§1–3, 5, and 6 are unwritten. This is the first real domain model in
   the repo and should fill them.
5. **`CLAUDE.md` "Project state"** — currently says no Server Actions and no tests exist. Both
   become false when this merges.
6. **`docs/PROJECT-STRUCTURE.md` §3** — `src/server/actions/` and `src/lib/validation/` stop being
   directories that do not exist yet.
7. **`docs/ENVIRONMENTS.md` §1 and CLAUDE.md "Project state"** — both say the local stack runs
   only in `db-replay.yml` and the `test` step gates nothing. Once `ci.yml` starts a stack and
   the tests exist, both are false.

---

## 8. Requires human approval before `/work:3-plan`

- [x] **A schema change, and a large one** — eleven tables, one view, four enum types, six
      functions, and the triggers. CLAUDE.md "Decision escalation" requires sign-off on any new
      table, index, RLS policy, or extension before it is authored.
- [x] **RLS policies on eleven tables** — CLAUDE.md "Off-limits" lists RLS as auth-related code
      requiring explicit instruction. The policies are specified in §2.8; this box is agreement
      that they are correct, not that they exist.
- [x] **`alter type user_role add value 'operations'`** — a change to the role enum every future
      policy in the repo reads, and CLAUDE.md "Decision escalation" names a new runtime role
      explicitly. An enum value is far easier to add than to remove.
- [x] **`docs/PRD.md` §1's scope sentence is corrected** — merged in #98 on 2026-09-23. It
      had said job execution was deferred, which was the evidence behind the first draft of this
      spec proposing to drop the Operations role.
- [x] **`seed_tenant_contact_lists` is adjacent to provisioning**, one of the three service-role
      system paths. It does not change provisioning, but provisioning will call it, which makes
      its signature a contract. CLAUDE.md "Scope boundaries" puts changes to those paths out of
      bounds without instruction.

- [x] **`.github/workflows/ci.yml` gains a Supabase stack** — CLAUDE.md "Off-limits" puts CI
      configuration under human review. The `check` job gets `supabase/setup-cli` and
      `supabase start` before `npm run test` (§6).

All five original boxes were signed off by Viral Parikh on 2026-09-27. The first two were
reopened the same day: `/work:3-plan` found that §2.8's record policies checked the tenant alone,
which let Operations reach every customer record, and that nothing forced a status change
through `set_lifecycle_status()`. §2.7 and §2.8 were rewritten, the CI box was added, and all
three were signed off again on 2026-09-27 with the revised spec. Box 1 was reopened once more
that day and re-signed: §2.4 and §2.5 gained the foreign-key indexes DATABASE.md §4 requires,
the history table's status columns became foreign keys, and its `on delete set null` names the
column it nulls.

**No package is added or removed.** Nothing here needs a dependency that is not already in
`package.json`.

---

## 9. Out of scope

Carried from [intent.md](intent.md) §4, plus what this design ruled out:

- **Every screen.** `/contacts`, the #42 multi-organization view, and the #43 duplicate warning
  user interface.
- **Delete refused because an Opportunity references the record.** The `on delete restrict`
  foreign keys land in the Opportunity and Job migrations. PRD-008's delete rule is half-satisfied
  here, deliberately.
- **The Opportunity and Job attachment contract itself** — in ARCHITECTURE §5 since #99 (§7.3).
- **Tenant provisioning.** This slice provides the seed function. Nothing here creates a tenant or
  calls it automatically.
- **Working authentication** (#70–#74). Tests set session claims directly.
- **Person-to-Person relationships**, cut by table structure rather than by rule.
- **Verticals other than Print & Signage**, direct booking with no Inquiry, notification emails,
  and activity logging.
- **A `directory` index or materialisation.** The view is a plain union; if it becomes slow, that
  is a later measurement, not a guess made now.
