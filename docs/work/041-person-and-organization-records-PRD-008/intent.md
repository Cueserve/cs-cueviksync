# Person and Organization records — Intent

**Work item:** [#41 PRD-008: Contact and company records (Must)](https://github.com/Cueserve/cs-cueviksync/issues/41)
**Date:** 2026-09-18
**Status:** Approved
**Mode:** slice contract

> Transient per [docs/work/README.md](../README.md). Not a source-of-truth document: where
> this disagrees with a file under `docs/`, that file wins.

## 1. Problem

CuevikSync has no way to store a customer.

The app has a shell, a login page, and two tables — `tenants` and `profiles`. Nothing else. An
inquiry has nobody to attach to, an opportunity has nobody to belong to, and a job has nobody to
deliver to. Person and Organization are the records everything else in the product hangs off, and
they do not exist.

This work item creates them.

**Why now.** No domain table in this repo carries `tenant_id` yet. Migration `0002` built the
tenancy machinery — `tenants`, `profiles`, `current_tenant_id()`, and Row-Level Security (RLS) —
and nothing uses it. Person and Organization are the first tables that will. Every table after
them copies the same pattern, so it costs less to settle here than to correct in eight places
later.

**Why it cannot be smaller.** PRD-008 asks only for person and organization records. That alone
will not run. A Person must have a category, and categories are one of five lists a tenant
configures — so the lists are part of this work whether or not PRD-008 mentions them.

## 2. Outcome

With the local Supabase stack running, `npx vitest run` proves all four:

- a Server Action creates a Person with a category in tenant A;
- a session scoped to tenant B reads **zero rows** for that Person;
- a deactivated list value is refused on a new record;
- an organization-only category is refused on a Person.

That turns NFR-008 from a claim into a checked property, and gives the next eight tables a tested
pattern to copy.

## 3. In this slice

- **The tables.** The five configurable lists; `persons` and `organizations`;
  `person_organizations` and the duties held on each link; organization-to-organization
  relationships; and the lifecycle-status history table with its forward-only rule.
- **RLS** on every one of them, scoped to the tenant.
- **One shared check for deactivated list values**, covering all six columns that reference a
  list, rather than six near-identical triggers.
- **Zod schemas** in `src/lib/validation/` and **Server Actions** in `src/server/actions/` to
  create, read, update, and delete a Person and an Organization. Neither directory exists yet.
- **Seeding a tenant's five lists**, because a tenant with no categories cannot hold a Person.
- **Standing up the local Docker stack** per [docs/ENVIRONMENTS.md](../../ENVIRONMENTS.md) §4.
  The required tests cannot exist without it.
- **Vitest coverage** for the four proofs in §2.

## 4. Explicitly not in this slice

- **The `/contacts` screen.** The sidebar links to it and the route does not exist. It stays that
  way. Stopping at the Server Action puts the RLS pattern under test without adding a user
  interface review to the same Pull Request (PR).
- **The screens for #42 (PRD-009, multi-organization) and #43 (PRD-010, duplicate detection).**
  The tables and indexes both need land here; the screens are theirs.
- **Blocking a delete while an Opportunity references the record.** There is no Opportunity table
  to reference it. PRD-008's delete rule is therefore only half-satisfiable here, deliberately.
- **Working authentication** (#70–#74). RLS is tested by setting session claims directly. The
  real login path is not proven.
- **Creating tenants.** This seeds lists for a tenant that already exists.
- **Person-to-Person relationships, other verticals, direct booking with no Inquiry, notification
  emails, and activity logging.** Each is out of scope for the Print & Signage vertical this
  release validates.

## 5. Affected users and systems

- **Roles:** all four of `user_role` — `owner_admin`, `sales_manager`, `sales_rep`,
  `office_admin` — read Person and Organization. Who may edit the lists is a PRD-026 and PRD-027
  question, settled in the spec, not here.
- **Existing surfaces:** nothing existing is modified. `tenants` and `profiles` are referenced by
  foreign key only. The Contacts nav item stays a dead link.
- **Service-role paths: none.** Every Person needs an email or a phone number, which means the
  Ingestion Worker cannot create one from a bare web-form submission. A Person is created by a
  user at triage or qualification. The Inquiry still keeps the raw submission (PRD-004), so
  capture reliability (NFR-002) is untouched.

## 6. Constraints

- RLS is where tenant scope is enforced. A forgotten filter must return zero rows, never leak —
  [docs/PRD.md](../../PRD.md) NFR-008.
- Server Actions are the only authenticated write path, there is no Object-Relational Mapper
  (ORM), and every external input is validated against a Zod schema on the server —
  [docs/ENGINEERING-RULES.md](../../ENGINEERING-RULES.md) §1.
- Custom-field values go in the per-record JSON column. Entity-Attribute-Value tables and
  per-tenant columns are banned — [docs/ENGINEERING-RULES.md](../../ENGINEERING-RULES.md) §2.
- Tenant isolation must be tested, and database tests run on the local stack, never against the
  hosted project — [docs/ENGINEERING-RULES.md](../../ENGINEERING-RULES.md) §3.
- The local stack needs Docker Desktop with the WSL2 backend and about 4 GB free.
  **`docker` is not on this machine today** — [docs/ENVIRONMENTS.md](../../ENVIRONMENTS.md) §1
  and §4.
- `db-replay.yml` proves the migration chain builds, but it runs as the superuser, so it proves
  nothing about RLS — [docs/ENVIRONMENTS.md](../../ENVIRONMENTS.md) §1.
- Schema changes are Supabase Command-Line Interface (CLI) migration files, and **running one is
  never an agent action** — [docs/ENGINEERING-RULES.md](../../ENGINEERING-RULES.md) §1 and
  [CLAUDE.md](../../../CLAUDE.md) "Off-limits".

## 7. Open questions

- **Is `last_name` required?** — answered: **no, it stays optional.** A walk-in who gives one
  name is a real record, and the email-or-phone rule keeps them reachable.
- **Who installs Docker Desktop?** — answered: **a human, before any test can run.** It is in
  scope for this work, but it is software installation on a development machine, not an agent
  action. `spec.md` and `plan.md` can both be written without it. Nothing in the plan can be
  _proved_ until it is done.
- **Do PRD-024 and PRD-027's five roles match the database?** — **open, and `spec.md` must settle
  it.** Both name an `Operations` role. `user_role` in `0001_extensions_and_types.sql` has four
  and does not include it. RLS policies implement PRD-027, so the design cannot be written around
  the gap.
- **One migration file or several?** — deferred to `plan.md`. Nothing in the design depends on
  the answer.
- **Is PRD-008's delete rule satisfiable?** — deferred: only half, and only once Opportunity
  exists. `spec.md` records which half is met.
- **Does the real login path change any RLS conclusion?** — deferred: #70–#74 are
  `decision-needed` and unscheduled. Setting session claims directly proves the policies. It does
  not prove the wiring that will carry the claims.
