# Contact Management — Design Spec

**Owner:** Viral Parikh
**Date:** 2026-09-17
**Status:** Approved design, not yet implemented
**Scope:** Print & Signage only (PRD.md's sole validation vertical). Painter's-company and
accounting-firm variants were explicitly ruled out of this spec's scope — see §9.

> Transient per [docs/specs/README.md](README.md): this file is deleted once its content lands
> in PRODUCT.md, PRD.md, ARCHITECTURE.md, and a migration. Until then it is authoritative for
> the slice it covers, same as the permanent docs it will feed.

---

## Contents

1. [Terminology](#1-terminology)
2. [Core Entities: Person, Organization](#2-core-entities-person-organization)
3. [Configurable Lists](#3-configurable-lists)
4. [Relationships](#4-relationships)
5. [Lifecycle Status Mechanics](#5-lifecycle-status-mechanics)
6. [Opportunity & Job Contract (forward-looking)](#6-opportunity--job-contract-forward-looking)
7. [Deletion, Duplicate Detection, and Access](#7-deletion-duplicate-detection-and-access)
8. [Policy Rules Summary](#8-policy-rules-summary)
9. [Explicitly Out of Scope / Deferred](#9-explicitly-out-of-scope--deferred)
10. [Downstream Document Changes Required](#10-downstream-document-changes-required)
11. [Testing Requirements](#11-testing-requirements)
12. [Implementation Notes](#12-implementation-notes)

---

## 1. Terminology

- **Person** and **Organization** are the canonical entity names, in the database and in every
  source-of-truth document. They replace `Contact` and `Company` in ARCHITECTURE.md §2 and the
  "contact and company" phrasing throughout PRD.md.
- **Contact** stays as the UI-facing umbrella term only — the sidebar's existing "Contacts" nav
  item ([AppChrome.tsx:56](<../../src/app/(app)/_components/AppChrome.tsx>)) lists Persons and
  Organizations together, via the `directory` view (§4). "Contact" never means "Person" alone in
  code or in a data model — that ambiguity is exactly what this rename avoids. PRODUCT.md's
  glossary gets an entry making this explicit, since it has no Person/Organization/Contact entry
  today.
- A **person–organization role** is a job title (Owner, Manager, …), stored on the link.
  A **duty** is an order-facing job (Primary contact, Billing contact, …), also stored on the
  link but many-to-many, not one-per-link. These are deliberately separate lists (§3).

## 2. Core Entities: Person, Organization

```sql
create table persons (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid not null references tenants(id),
  first_name            text not null,
  last_name             text,                    -- nullable: a single-name walk-in is valid
  email                 text,
  phone                 text,
  category_id           uuid not null,
  category_applies_to   category_scope not null generated always as ('person') stored,
  lifecycle_status_id   uuid,                     -- null = no status yet (§5)
  custom_fields         jsonb not null default '{}',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint persons_contact_detail_required
    check (nullif(btrim(email), '') is not null or nullif(btrim(phone), '') is not null),

  unique (tenant_id, id),                          -- FK target for tenant-carrying references
  foreign key (tenant_id, category_id, category_applies_to)
    references categories (tenant_id, id, applies_to),
  foreign key (tenant_id, lifecycle_status_id)
    references lifecycle_statuses (tenant_id, id)
);

create index persons_tenant_email_idx  on persons (tenant_id, lower(email)) where email is not null;
create index persons_tenant_name_idx   on persons (tenant_id, lower(last_name), lower(first_name));
create index persons_tenant_category_idx on persons (tenant_id, category_id);
create index persons_tenant_status_idx   on persons (tenant_id, lifecycle_status_id);

alter table persons enable row level security;
```

```sql
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

create index organizations_tenant_email_idx on organizations (tenant_id, lower(email)) where email is not null;
create index organizations_tenant_name_idx  on organizations (tenant_id, lower(name));
create index organizations_tenant_category_idx on organizations (tenant_id, category_id);
create index organizations_tenant_status_idx   on organizations (tenant_id, lifecycle_status_id);

alter table organizations enable row level security;
```

**Why `category_applies_to` is a generated column, not just a plain foreign key:** it is the
mechanism that lets a person-category and an organization-category live in one shared
`categories` table (§3) while making it structurally impossible for a person to be filed under
an organization-only category, or vice versa — the composite foreign key rejects it the same way
a missing ID would, with no trigger required.

**Assumption flagged, not decided in this session:** `last_name` is nullable. No requirement
addresses single-name records; this is a reasonable default, not a confirmed decision — correct
it if wrong.

**`email` or `phone` is mandatory, blanks count as empty.** This blocks the Ingestion Worker
from ever creating a Person directly from a bare web-form submission with only a name — a person
is created by a user at triage or qualification, never by the automated capture path. The
Inquiry record itself still retains the raw submission regardless (PRD-004), so this does not
reduce capture reliability (NFR-002).

## 3. Configurable Lists

Five tenant-configurable lists. Each shares a common shape:

```sql
create table categories (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id),
  name        text not null,
  applies_to  category_scope not null,       -- 'person' | 'organization'
  position    int not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (tenant_id, id, applies_to)
);
create index categories_tenant_idx on categories (tenant_id, applies_to);
create unique index categories_tenant_scope_name_idx
  on categories (tenant_id, applies_to, lower(name));
alter table categories enable row level security;
```

`person_organization_roles` and `organization_relationship_types` and `lifecycle_statuses` and
`contact_duties` share the same base shape (`id, tenant_id, name, position, active, created_at,
updated_at`, `unique (tenant_id, id)`, a case-insensitive unique name per tenant, RLS on), with
these additions:

| Table                             | Extra column(s)                                                                                                           | Anchor values (`system_key`) |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `organization_relationship_types` | `inverse_name text not null`                                                                                              | —                            |
| `lifecycle_statuses`              | `system_key lifecycle_anchor` (`'prospect'` \| `'client'`), `unique (tenant_id, system_key) where system_key is not null` | Prospect, Client             |
| `contact_duties`                  | `system_key duty_anchor` (`'primary'`), same uniqueness pattern                                                           | Primary contact              |

**Starting values** (tenant-editable after creation; provisioning must seed them — see §12):

| List                                                    | Values                                                                                                           |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `categories` (`applies_to = 'person'`)                  | Individual, Self-employed                                                                                        |
| `categories` (`applies_to = 'organization'`)            | Business, Agency, Reseller, Non-profit, Education, Healthcare, Government                                        |
| `person_organization_roles`                             | Owner, Director, Manager, Designer, Bookkeeper, Assistant, Employee, Agent                                       |
| `organization_relationship_types` (name / inverse_name) | Parent of / Subsidiary of · Branch of / Has branch · Represents / Represented by · Franchisor of / Franchisee of |
| `lifecycle_statuses`                                    | Lead, **Prospect** (`system_key='prospect'`), **Client** (`system_key='client'`), Inactive                       |
| `contact_duties`                                        | **Primary contact** (`system_key='primary'`), Billing contact, Proof approver, Shipping/Receiving                |

`category_id`, `role_id`, `lifecycle_status_id`, and `duty_id` are all **required** fields on
whatever references them (persons/organizations require a category; a
`person_organizations` link requires a role). Nothing defaults to a pre-selected value in the
UI — a form control with nothing pre-checked forces an actual choice rather than "whatever's
listed first," particularly for category, where a rep often cannot tell Individual from
Self-employed at first contact.

**`position` controls display/dropdown order only.** It has no bearing on the forward-only
lifecycle-status rule in §5, which is deliberately independent of position so that reordering or
renaming statuses can never change automatic behavior.

## 4. Relationships

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
  unique (person_id, organization_id),        -- one role per pair
  foreign key (tenant_id, person_id)       references persons (tenant_id, id) on delete cascade,
  foreign key (tenant_id, organization_id) references organizations (tenant_id, id) on delete cascade,
  foreign key (tenant_id, role_id)         references person_organization_roles (tenant_id, id)
);
create index po_tenant_person_idx on person_organizations (tenant_id, person_id);
create index po_tenant_org_idx    on person_organizations (tenant_id, organization_id);
alter table person_organizations enable row level security;
```

```sql
create table person_organization_duties (
  id                       uuid primary key default gen_random_uuid(),
  tenant_id                uuid not null references tenants(id),
  person_organization_id   uuid not null,
  duty_id                  uuid not null,
  created_at               timestamptz not null default now(),

  unique (person_organization_id, duty_id),   -- many people can hold one duty; one person, many duties
  foreign key (tenant_id, person_organization_id)
    references person_organizations (tenant_id, id) on delete cascade,
  foreign key (tenant_id, duty_id) references contact_duties (tenant_id, id)
);
alter table person_organization_duties enable row level security;
```

```sql
create table organization_relationships (
  id                     uuid primary key default gen_random_uuid(),
  tenant_id              uuid not null references tenants(id),
  from_organization_id   uuid not null,
  to_organization_id     uuid not null,
  relationship_type_id   uuid not null,
  active                 boolean not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  check (from_organization_id <> to_organization_id),
  unique (from_organization_id, to_organization_id, relationship_type_id),
  foreign key (tenant_id, from_organization_id) references organizations (tenant_id, id) on delete cascade,
  foreign key (tenant_id, to_organization_id)   references organizations (tenant_id, id) on delete cascade,
  foreign key (tenant_id, relationship_type_id) references organization_relationship_types (tenant_id, id)
);
alter table organization_relationships enable row level security;
```

**No Person ↔ Person relationship exists**, by table structure rather than a trigger — there is
no link table that could hold one. This was an explicit scope cut once painters and accounting
firms (which needed spouse/household links) left this spec's scope (§9).

**Organization ↔ Organization links are informational only.** They render on both organizations'
records (using `name` from one side, `inverse_name` from the other) and never affect who an
opportunity, quote, or job belongs to. If a broker-books-for-its-client flow is ever needed, that
is new scope requiring its own design — not something these rows drive today.

**`directory` view** — the single list the "Contacts" UI reads from:

```sql
create view directory with (security_invoker = true) as
  select id, tenant_id, 'person'::text as kind,
         trim(first_name || ' ' || coalesce(last_name, '')) as display_name,
         email, phone, category_id, lifecycle_status_id, created_at
    from persons
  union all
  select id, tenant_id, 'organization'::text as kind,
         name as display_name,
         email, phone, category_id, lifecycle_status_id, created_at
    from organizations;
```

`security_invoker = true` means the view enforces the querying user's own RLS grants on
`persons`/`organizations` — it carries no elevated access of its own.

## 5. Lifecycle Status Mechanics

**Only two transitions are automatic**, resolved by `system_key`, never by name or `position` —
so a tenant renaming or reordering statuses cannot change behavior:

| Event                                 | `source`      | Sets status to                                     |
| ------------------------------------- | ------------- | -------------------------------------------------- |
| Inquiry qualified into an Opportunity | `'qualified'` | the tenant's status with `system_key = 'prospect'` |
| Opportunity reaches Won               | `'won'`       | the tenant's status with `system_key = 'client'`   |
| A user edits it directly              | `'manual'`    | whatever the user picks; no guard applies          |

Lead and Inactive have no anchor. Nothing sets them automatically; they exist purely as
manual-only values, on the same footing as any custom status a tenant adds.

**Which record the event targets is decided by the caller, not this function** — this is the
piece that keeps status correct when a person is acting on an organization's behalf:

- The (future) Opportunity has `organization_id = null` → the event targets the **Person**.
- The Opportunity has `organization_id` set → the event targets the **Organization**, not the
  person who placed the order for it. A person who only ever orders as a contact of
  organizations may never accumulate their own lifecycle status — `lifecycle_status_id` staying
  `null` forever is valid.

**Forward-only reduces to one rule:** once a record is at the tenant's Client status, the
`'qualified'` event will not move it back to Prospect. There is nothing above Client for the
`'won'` event to protect against. This needs no position comparison and survives renaming or
reordering, unlike a numeric "position must increase" rule.

**Inactive is not shielded from either automatic event** (flagged as a judgment call, not
something explicitly discussed at length): re-qualifying an old Inactive lead moves it to
Prospect; a Won deal for an Inactive organization moves it to Client. Inactive is a manual label,
not a do-not-contact suppression flag — if a future need for actual suppression arises, that is
a different mechanism than lifecycle status.

```sql
create function set_lifecycle_status(
  p_tenant_id        uuid,
  p_person_id        uuid,        -- exactly one of person_id / organization_id is non-null
  p_organization_id  uuid,
  p_new_status_id    uuid,        -- resolved by the caller (system_key lookup for automatic sources)
  p_source           lifecycle_source,   -- 'manual' | 'qualified' | 'won'
  p_actor_id         uuid         -- always a real profile; no service-role path touches this
) returns void language plpgsql as $$
declare
  v_current_status_id uuid;
  v_client_status_id  uuid;
begin
  if p_person_id is not null then
    select lifecycle_status_id into v_current_status_id from persons
      where id = p_person_id and tenant_id = p_tenant_id for update;
  else
    select lifecycle_status_id into v_current_status_id from organizations
      where id = p_organization_id and tenant_id = p_tenant_id for update;
  end if;

  if p_source = 'qualified' then
    select id into v_client_status_id from lifecycle_statuses
      where tenant_id = p_tenant_id and system_key = 'client';
    if v_current_status_id = v_client_status_id then
      return; -- forward-only guard: never demote a Client back to Prospect
    end if;
  end if;

  if v_current_status_id is not distinct from p_new_status_id then
    return; -- idempotent no-op: no empty history row
  end if;

  if p_person_id is not null then
    update persons set lifecycle_status_id = p_new_status_id where id = p_person_id;
  else
    update organizations set lifecycle_status_id = p_new_status_id where id = p_organization_id;
  end if;

  insert into lifecycle_status_history
    (tenant_id, person_id, organization_id, from_status_id, to_status_id, source, actor_id)
  values
    (p_tenant_id, p_person_id, p_organization_id, v_current_status_id, p_new_status_id, p_source, p_actor_id);
end;
$$;
```

Called inside the same transaction as the qualify/Won write, once those exist — mirroring how
`StageHistory` is written today (ARCHITECTURE §4's audit-model decision).

```sql
create table lifecycle_status_history (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references tenants(id),
  person_id         uuid,
  organization_id   uuid,
  from_status_id    uuid,
  to_status_id      uuid,
  source            lifecycle_source not null,
  actor_id          uuid not null references profiles(id),
  created_at        timestamptz not null default now(),

  check (num_nonnulls(person_id, organization_id) <= 1),   -- see §7: <=1, not =1, to survive erasure
  foreign key (tenant_id, person_id)       references persons (tenant_id, id) on delete set null,
  foreign key (tenant_id, organization_id) references organizations (tenant_id, id) on delete set null
);
create index lsh_tenant_person_idx on lifecycle_status_history (tenant_id, person_id);
create index lsh_tenant_org_idx    on lifecycle_status_history (tenant_id, organization_id);
alter table lifecycle_status_history enable row level security;
-- RLS: authenticated select + insert scoped to tenant_id = current_tenant_id(); no update, no delete.
```

## 6. Opportunity & Job Contract (forward-looking)

Opportunity and Job are not built yet (Pipeline and Job Execution modules). This section is the
contract those future migrations must follow — not a redesign of tables outside this spec's
scope.

- **Columns:** `person_id uuid not null references persons`, `organization_id uuid references
organizations` (nullable). Replaces "a contact and a company" in PRD-007, PRD-031, PRD-044.
- **A trigger enforces that `organization_id`, when set, has a corresponding
  `person_organizations` row for that exact `(person_id, organization_id)` pair** — active or
  not (see the next point). Two independent foreign keys alone cannot express "this person must
  actually be related to this organization."
- **Qualification-time flow**, when an Opportunity's `organization_id` is set or changed:
  1. No `person_organizations` row exists for the pair → prompt to create one now, with a role
     required. Nothing is attached silently.
  2. A row exists, but no one linked to the organization holds the Primary-contact duty → prompt
     to assign it, defaulting to the person being qualified, but any existing linked person may
     be chosen instead.
  3. Only once both hold does the Opportunity write succeed.
- **Editable until Won, frozen after.** `person_id` and `organization_id` may change while the
  Opportunity is open — routing back through the flow above if `organization_id` changes. A
  trigger blocks changing either column once the Opportunity reaches Won, the same pattern as
  the `tenant_id`-immutable trigger on `profiles` (0002 migration). This is what makes PRD-044's
  "structurally indistinguishable" Won record actually stable, and gives Job a fixed value to
  inherit.
- **Job inherits, never edits.** At conversion (PRD-031), `Job.person_id` /
  `Job.organization_id` are copied once from the Won Opportunity and never changed after — no
  requirement calls for editing a job's customer post-creation.
- **Reorder (PRD-044) copies without re-checking.** It pulls `person_id`/`organization_id`
  directly from the source Job. Since that Job's Opportunity already passed the qualification
  checks above when it was Won, Reorder does not repeat them. If the person's link to the
  organization has since gone inactive, that is the same warn-don't-block case as any open record
  with a stale link (next point) — surfaced in the UI, never blocked.
- **An open Opportunity with an inactive link is allowed, and only warned about.** Concretely: a
  person's `person_organizations.active` can go `false` (they left the organization) while an
  Opportunity that names both is still open. The trigger above only checks that a link _existed_
  at write time, so this cannot retroactively break anything — the future Pipeline screen shows a
  banner (e.g. "this person is no longer linked to this organization"), and a rep can either
  leave it or swap in a different contact through the editable-until-Won flow. No schema captures
  this; it is UI behavior for whoever builds that screen.

## 7. Deletion, Duplicate Detection, and Access

- **Deleting a Person or Organization is blocked outright while any Opportunity or Job still
  references them** — plain `on delete restrict` on those future foreign keys (§6). This is
  stricter than PRD-008's current "warn before proceeding" wording, which assumed the delete
  could still proceed — flagged for the PRD-008 rewrite in §10. The record should be moved to the
  Inactive lifecycle status instead, which is what "warn" was standing in for in practice.
- **`lifecycle_status_history` survives its Person or Organization being deleted**, with the
  reference nulled (`on delete set null`, and the relaxed `<= 1` check in §5) — matching how
  ARCHITECTURE §7 already treats `StageHistory`/`QuoteStatusHistory` under erasure: keep the
  event skeleton, strip the identifying link.
- **Duplicate detection (PRD-010) is an application-level query, not a schema constraint.**
  "Warn, don't block" rules out a unique index on name/email/phone — that would reject
  legitimate duplicates (two different "John Smith"s). The create/qualify Server Action runs a
  lookup against the indexes in §2 before insert and shows candidates in a warning the user can
  dismiss. The check now matches **name, email, or phone** — extended from PRD-010's current
  "name or email" now that a Person can be phone-only.
- **RLS**, extending existing role boundaries:

  | Table group                                                                                                    | Read                                                                        | Write                                                                                                                                                                                         |
  | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `persons`, `organizations`, `person_organizations`, `person_organization_duties`, `organization_relationships` | Owner/Admin, Sales Manager, Sales Rep, Office Administrator (tenant-scoped) | Owner/Admin, Sales Manager, Sales Rep — full; Office Administrator — "contact/company basics" per existing PRD-027 wording, enforced at the Server Action/form layer, not by column-level RLS |
  | The five configurable lists (§3)                                                                               | Every tenant member                                                         | Owner/Admin only — extends PRD-026                                                                                                                                                            |
  | `lifecycle_status_history`                                                                                     | Every tenant member (tenant-scoped)                                         | Insert only, via `set_lifecycle_status`; no update, no delete                                                                                                                                 |
  | Operations role                                                                                                | No access to any of the above                                               | No access                                                                                                                                                                                     |

  **PRD-027 gap, resolved here:** it does not currently grant Sales Rep read/write on contact or
  company records, yet PRD-007 requires a Sales Rep to attach one while qualifying. Resolved as
  full read/write, matching Sales Manager — flagged for the PRD-027 wording fix in §10.

## 8. Policy Rules Summary

- **Deactivate, never delete, a list value that's in use.** Deleting one still referenced is
  refused by ordinary FK `restrict` — no custom trigger needed. A _deactivated_ value must still
  be blocked from being **newly** assigned while remaining valid on rows that already reference
  it; that half needs a trigger per referencing column, since a foreign key alone cannot express
  "must be active, unless already in use."
- **Anchored values (Prospect, Client, Primary contact) can be renamed but never deleted or
  deactivated.** A trigger on `lifecycle_statuses` and `contact_duties` blocks any update setting
  `active = false` or any delete where `system_key is not null`; renaming (`name`) is unaffected.
- **Only Owner/Admin edits the five configurable lists; every tenant member reads them.**
- **A user cannot invent a role, duty, category, or status value mid-workflow.** They pick from
  the list, with Employee as the role fallback when nothing fits — keeping the lists from filling
  with near-duplicates.
- **Primary contact is required only at the point of qualifying an order for an organization**,
  not as a standing requirement on every organization record (§6).
- **Duties follow their link.** Deleting a person's link to an organization removes their duties
  there; an inactive link's duties do not count toward the Primary-contact check.

## 9. Explicitly Out of Scope / Deferred

- **Painter's-company and accounting-firm variants.** This spec covers Print & Signage only, per
  PRD.md's sole validation vertical. A "separate variant" for another vertical would itself
  violate PRODUCT.md §7's rule that every vertical is served through configuration, not code —
  flagged, not built. Person ↔ Person relationships (needed for accounting firms' household/
  spouse links) are cut entirely, by table structure, not merely left unconfigured.
- **Direct booking with no Inquiry or Opportunity record at all.** Raised and confirmed in
  discussion, but this contradicts PRD-001/NFR-002's zero-leak-capture guarantee as currently
  written, and touches Capture & Triage and Job Execution — neither built. This spec does not
  design it. It requires a new PRODUCT.md §3A placeholder (§10) and its own future spec once
  those modules exist. Nothing in this spec blocks that later work — a direct-booked Job would
  still need the same `person_id`/`organization_id` shape from §6.
- **Notification emails and activity logging.** Notification sending is Workflow Automation
  (PRODUCT.md's staged, post-thin-core item); activity/communication logging is the Unified
  Communication Timeline (PRD.md §9, deferred not excluded). Neither is built here — but
  `person_organization_duties` (§4) is exactly the data both will read (who to notify, in what
  capacity) once they exist, so nothing here needs to change to support them later.

## 10. Downstream Document Changes Required

Not performed as part of this spec — listed so the follow-up doc-change pass has a checklist.

- **PRODUCT.md** — add Person/Organization/Contact to the glossary (currently has neither;
  reconcile with the existing "Account/Customer" entry); add a new §3A placeholder for direct
  booking without an Inquiry (§9).
- **PRD.md** — reword PRD-007, 008, 009, 022, 031, 044 (contact-and-company →
  person-and-optional-organization); PRD-008's delete behavior (§7); PRD-010 extends to phone
  (§7); PRD-027 gains the Sales Rep grant (§7). This design also needs **new requirement IDs**
  for categories, lifecycle status, roles/duties, and organization relationships — none of which
  exist today under any current PRD number; drafting them is implementation-planning work, not
  this spec.
- **ARCHITECTURE.md** — §2's entity table (`Contact`, `Company`, `ContactCompany`) is replaced by
  `Person`, `Organization`, and this spec's other tables; §7's data-classification row updates to
  match.
- **DATABASE.md** — stays a stub for this feature until the migration lands, per its own stated
  scope ("describes the model, not the DDL").

## 11. Testing Requirements

Per ENGINEERING-RULES.md §3, tenant isolation and rejected transitions are mandatory coverage,
not optional:

- Cross-tenant rejection on every tenant-carrying composite foreign key introduced here — a
  crafted request cannot attach another tenant's category, role, duty, status, or relationship
  type.
- A person cannot be assigned an organization-scoped category, and vice versa (the generated
  `category_applies_to` column).
- Forward-only: qualifying an already-Client record does not demote it to Prospect; a manual
  downgrade followed by re-qualification does advance it (proves manual edits are not "locked").
- Prospect, Client, and Primary contact cannot be deleted or deactivated (can be renamed); other
  list values can be deactivated (blocking new assignment, not existing references) or deleted
  when unreferenced.
- Delete is blocked while a linked Opportunity exists — deferred until Opportunity exists to test
  against, not skipped.
- Duplicate-check query returns candidates on name, email, or phone matches.

These require the local Supabase stack (`npx supabase start`), which is **not yet set up**
per CLAUDE.md's Project State — standing it up is a prerequisite this work will hit.

## 12. Implementation Notes

- **Migration sequencing** is an implementation-time call, not pinned here — the natural
  dependency order is lists (§3) → `persons`/`organizations` (§2) → relationships (§4) →
  history/triggers (§5), but whether that is one migration or several is for whoever writes the
  plan.
- **Tenant provisioning must seed the five starting-value lists** (§3) — it does not exist yet
  (DATABASE.md §6's open item). Until it does, a pilot tenant's lists are entered by hand.
- **The "active list value" trigger pattern (§8) applies to six referencing columns**
  (`persons.category_id`, `organizations.category_id`, `person_organizations.role_id`,
  `person_organization_duties.duty_id`, `organization_relationships.relationship_type_id`, and
  status assignment) — implemented once as a shared, parameterized check rather than six
  near-identical trigger functions.
