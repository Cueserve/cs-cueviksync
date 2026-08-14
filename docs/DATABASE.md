# DATABASE.md — Data Model

**Owner:** Viral Parikh
**Last updated:** 2026-08-14
**Source of truth for:** CuevikSync's entities, their columns and constraints, and the design
decisions behind why each table looks the way it does.

> Derived from: docs/PRD.md, docs/ARCHITECTURE.md, docs/PRODUCT.md, docs/TECH-STACK.md
> Downstream: `src/lib/supabase/types.ts`

**This file describes the model, not the DDL.** The SQL that implements it lives in
`supabase/migrations/*.sql`, which docs/ARCHITECTURE.md §5 makes the authoritative schema.

---

> **Barely authored, as of 2026-08-14.** Two migrations are applied — `0001` (extensions, the
> `user_role` enum, the shared `set_updated_at` trigger) and `0002` (`tenants`, `profiles`, the
> tenancy helpers, and RLS on both). They created the tenancy substrate, not the domain: no
> Inquiry, Opportunity, Quote, or Configuration table exists yet. §4's conventions block is
> real and binding; §§1–3, 5, 6 are still unwritten.
>
> The section skeleton below matches `RedyQuote:docs/DATABASE.md` so a developer moving between
> the repos finds the same information in the same place; each section is filled as the
> corresponding tables are designed.
>
> **Do not infer a model from this file's existence.** Check `supabase/migrations/` for what
> actually exists.

## Contents

- [1. System Summary](#1-system-summary)
- [2. Entity List](#2-entity-list)
- [3. ERD](#3-erd)
- [4. Table Definitions](#4-table-definitions)
- [5. Design Decisions](#5-design-decisions)
- [6. Open Items](#6-open-items)

## 1. System Summary

_Not yet authored._

## 2. Entity List

_Not yet authored._ The domain modules that will own tables are named in
[docs/ENGINEERING-RULES.md](ENGINEERING-RULES.md) §1: Capture & Triage, CRM, Pipeline, Quoting,
and Configuration.

## 3. ERD

_Not yet authored._

## 4. Table Definitions

_Per-table column tables are not yet authored._ The conventions below are already fixed, are
followed by `0001` and `0002`, and apply to every table added here.

**Design conventions applied throughout:**

- `uuid` primary keys via `gen_random_uuid()` (`pgcrypto`). A natural or singleton PK is
  permitted only where the table is not a public entity; record the reason in its column table.
  `profiles.id` is the standing exception — it is `auth.users(id)`, not a generated value.
- `created_at` / `updated_at` (`timestamptz`) on every mutable table; `updated_at` maintained by
  the shared `set_updated_at()` trigger from `0001`, never by application code.
- **No `deleted_at` soft-delete column anywhere.** Where the product needs a soft-delete
  equivalent, it is a domain-specific `active` boolean — the row stays visible and joinable,
  just not selectable for new work. Every other table either forbids delete outright
  (append-only audit tables) or has no deletion requirement.
- Every foreign-key column is explicitly indexed. Postgres does not do this automatically.
- RLS is enabled on **every** table (`alter table ... enable row level security`).
- Every tenant-scoped table carries `tenant_id uuid not null`, and its RLS policies filter on
  it. A table without `tenant_id` must state in its column table why it is global.

Two consequences of decisions upstream of this file:

- **Tenant isolation is by row-level `tenant_id` with RLS as the enforcement locus**
  (docs/ARCHITECTURE.md §5, NFR-008). A table with RLS enabled but no tenant predicate enforces
  row ownership and nothing else, which is the exact failure NFR-008 exists to prevent.
- **The three service-role system paths** — Intake Receiver, Ingestion Worker, provisioning —
  bypass RLS and MUST re-apply `tenant_id` in code from a server-resolved value.

## 5. Design Decisions

_Not yet authored._

## 6. Open Items

_Not yet authored._ Two items are open and neither is a schema question:

- **Tenant provisioning is undesigned.** A new `auth.users` row gets no `profiles` row, and
  nothing creates a tenant. Self-serve versus invited, and what happens to a new tenant's first
  user, are undecided — see CLAUDE.md § Project state.
- **The PITR spend is an unapproved commitment.** NFR-010 sets Recovery Point Objective ≤ 24
  hours, which default daily backups may not meet; nobody has approved the add-on. See
  [docs/ENVIRONMENTS.md](ENVIRONMENTS.md) §2.
