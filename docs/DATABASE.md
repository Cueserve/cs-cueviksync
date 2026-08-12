# DATABASE.md — Data Model

**Owner:** Viral Parikh
**Last updated:** 2026-08-11
**Source of truth for:** CuevikSync's entities, their columns and constraints, and the design
decisions behind why each table looks the way it does.

> Derived from: docs/PRD.md, docs/ARCHITECTURE.md, docs/PRODUCT.md, docs/TECH-STACK.md
> Downstream: `src/lib/supabase/types.ts`

**This file describes the model, not the DDL.** The SQL that implements it lives in
`supabase/migrations/*.sql`, which docs/ARCHITECTURE.md §5 makes the authoritative schema.

---

> **Not yet authored.** No Supabase project exists or is linked
> ([docs/ENVIRONMENTS.md](ENVIRONMENTS.md) §1), no migrations have been written, and
> `src/lib/supabase/types.ts` is a hand-authored placeholder that types every table as empty.
> The section skeleton below matches `RedyQuote:docs/DATABASE.md` so a developer moving between
> the repos finds the same information in the same place; each section is filled as the
> corresponding tables are designed.
>
> **Do not infer a model from this file's existence.** Check `supabase/migrations/` for what
> actually exists — which today is nothing.

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

_Not yet authored._ Two conventions are already fixed by decisions upstream of this file and
apply to every table added here:

- **Tenant isolation is by row-level `tenant_id` with RLS as the enforcement locus**
  (docs/ARCHITECTURE.md §5, NFR-008). Every tenant-scoped table carries the column, and its
  policies filter on it. A table with RLS enabled but no tenant predicate enforces row
  ownership and nothing else, which is the exact failure NFR-008 exists to prevent.
- **The three service-role system paths** — Intake Receiver, Ingestion Worker, provisioning —
  bypass RLS and MUST re-apply `tenant_id` in code from a server-resolved value.

## 5. Design Decisions

_Not yet authored._

## 6. Open Items

_Not yet authored._ The blocking prerequisite is not a schema question: no Supabase project
exists. See [docs/ENVIRONMENTS.md](ENVIRONMENTS.md) §1 and §2, including the unmade budget
commitment that NFR-010's Point-in-Time Recovery requirement implies.
