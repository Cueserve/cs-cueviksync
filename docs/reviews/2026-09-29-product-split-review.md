# Product Split Review — CuevikSync and CuevikFlow

**Owner:** Viral Parikh
**Date:** 2026-09-29
**Status:** Advisory review. Decisions recorded here take effect only through the source-of-truth
amendments listed in §7.

> Reviews the repository as of commit `318b049` against a new requirement: build two client
> products, not one. Advisory only — where this disagrees with a file under `docs/`, that file
> wins until it is amended.

---

## Contents

- [1. Context](#1-context)
- [2. Decisions](#2-decisions)
- [3. Architecture Review](#3-architecture-review)
- [4. Separation Strategy](#4-separation-strategy)
- [5. Common vs Product-Specific Layers](#5-common-vs-product-specific-layers)
- [6. Risks Accepted](#6-risks-accepted)
- [7. Follow-up Changes](#7-follow-up-changes)

## 1. Context

Two paying clients need a custom build each:

| Client          | Business                       | Product                                     | Center of the product                                             |
| --------------- | ------------------------------ | ------------------------------------------- | ----------------------------------------------------------------- |
| PrintWorks      | Print shop, United States (US) | **CuevikSync** — this repo, `cs-cueviksync` | Zero-leak inquiry capture → pipeline → quote → job                |
| SuperSmartPlans | Accounting firm, Australia     | **CuevikFlow** — new repo, `cs-cuevikflow`  | Recurring jobs, client document management, AI-assisted functions |

Both share Customer Relationship Management (CRM), jobs, and workflow ideas, but their data
capture, job structures, and operational workflows differ. PrintWorks's central problem — an
inbound inquiry slipping through — is not SuperSmartPlans's: an accounting practice earns mostly
from recurring work for existing clients, and wants only a lighter form of inquiry handling.

Commercial model: **custom build now, Software-as-a-Service (SaaS) maybe later.** Each client
pays once it sees the product working.

## 2. Decisions

Settled in the review session of 2026-09-29.

| #   | Decision                                                                                                                                                                             | Why                                                                                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | **Two repositories.** `cs-cueviksync` stays as is and becomes PrintWorks's product. `cs-cuevikflow` (already on GitHub, empty) becomes SuperSmartPlans's.                            | The shared core is small (§3.1); a monorepo would rework every tool that assumes one product per repo (§3.3) for little gain.                                                      |
| D2  | **Copy once, diverge freely.** No shared package. Extract one only when a third product arrives or drift demonstrably costs more than the package would.                             | One developer; a private package adds versioning and publishing overhead that nothing yet justifies.                                                                               |
| D3  | **CuevikFlow is a separate Cuevik product**, not a CuevikSync edition. Its own PRODUCT → PRD → ARCHITECTURE → TECH-STACK, authored through `cs-kickstart`.                           | Its center differs (§1); its stack needs AI and document management, which this repo's TECH-STACK §5 bans. A separate stack keeps that ban intact for PrintWorks.                  |
| D4  | **Both repos stay multi-tenant.** Each client production deployment holds one tenant, under the client's own account.                                                                | Tenancy is already paid for (`0002`); retrofitting it later is the most expensive retrofit there is, and it keeps the SaaS path open. docs/ENVIRONMENTS.md §5 stands as written.   |
| D5  | **Client specifics are tenant data, never code.** Stage names, fields, catalog, timezone — configuration for that client's tenant. A client-only branch in code is debt.             | Under "SaaS maybe later", every client-specific branch in code becomes a defect in the product.                                                                                    |
| D6  | **Development environments.** Pause RedyQuote dev to free a Supabase slot for CuevikFlow dev. Supabase and Vercel both move to paid plans before either client's first demo.         | The free tier allows two active projects, both taken. Vercel's Hobby plan is non-commercial (§6).                                                                                  |
| D7  | **Build both in parallel**, switching products only at a work-item boundary (a merged PR), never mid-item.                                                                           | Both clients answer slowly; working the other product while one is blocked is a hedge. A half-built item in each repo is where parallel work gets expensive.                       |
| D8  | **PrintWorks acceptance is the Phase 1 thin-core scope** (docs/PRODUCT.md §4), with Job workflow delivered first. Person/Organization (#41) is built first, then Job.                | PrintWorks wants to see jobs first; #41 is the Person/Organization base a Job attaches to.                                                                                         |
| D9  | **Direct booking is allowed.** A Job may be created without an Inquiry or Opportunity. Direct-booked Jobs stay outside zero-leak capture metrics but count in job-level KPIs.        | Jobs-first put docs/PRODUCT.md §3A on the critical path. Walk-in and phone orders are real in a print shop; forcing a pre-Won Opportunity would hide direct booking, not avoid it. |
| D10 | **Tenant-level `timezone`** on `tenants`, in a migration landing just before the Job migration. PrintWorks: `America/New_York`, one location. Currency stays pinned in code for now. | Dates currently format in UTC. With due dates, overdue flags, and the weekly KPI, that is a correctness bug, not a cosmetic one.                                                   |
| D11 | **No discovery sessions with SuperSmartPlans.** Requirements are brainstormed internally; questions go to the client in writing, phrased as assumptions to confirm or correct.       | The client will not give sessions. A confirm-or-correct statement gets answered faster than an open question.                                                                      |

## 3. Architecture Review

### 3.1 What is reusable

Little domain code exists yet — two applied migrations, no Server Actions, no tests — so most of
what carries over is foundation and design, not features.

| Area                                                                                            | Carries to CuevikFlow                          | Notes                                                                                                                                            |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Token layer (`globals.css`), 18 `ui/` primitives, layout shell                                  | **As is**                                      | `eslint.config.mjs` already bans app imports from `ui/` — the extraction boundary exists.                                                        |
| `src/lib/supabase/*`, `src/proxy.ts`, `config.ts`, `config.server.ts`                           | **As is**                                      | Session-bound and service-role clients, session refresh, validated env.                                                                          |
| `0001`, `0002` — tenants, profiles, `current_tenant_id()`, `is_admin()`, escalation guards, RLS | **As is, re-applied as that repo's own chain** | The Row-Level Security (RLS) and guard patterns are product-neutral. `user_role` is not (§3.2).                                                  |
| Person/Organization CRM (#41)                                                                   | **Port after it merges**                       | Accounting clients are organizations with directors as persons. Port the merged migrations and actions, not the in-flight branch.                |
| Custom-field catalog + JSON column (PRD-022)                                                    | **Pattern carries**                            | Not built yet here.                                                                                                                              |
| Toolchain — ESLint, Prettier, Husky, Vitest, CI, `db-replay.yml`, `db-drift.yml`, hooks         | **As is, after renaming**                      | See §3.3 for the repo names baked into it.                                                                                                       |
| Intake Receiver / Ingestion Worker, pgmq, zero-leak invariants                                  | **No**                                         | PrintWorks's center. CuevikFlow's inquiry handling is lighter and is its own design.                                                             |
| Quote, Job, WasteRework, weekly KPI                                                             | **No**                                         | Print-shaped aggregates. An accounting engagement — recurring periods, deadlines, document requests — is a different model, not a stretched one. |

### 3.2 Domain boundaries

ARCHITECTURE §1's modules hold as the internal boundaries **of this repo**: Capture & Triage,
CRM, Pipeline, Quoting, Job/Order Execution, Configuration, with authorization cross-cutting.
None needs to move. The boundary that changes is above them: the docs describe these modules as
a horizontal platform for seven verticals, and after D1 they are one product's modules.

### 3.3 Where the repo is tightly coupled

| Coupling                                                                                                                     | Consequence                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| PRODUCT.md §7 declares one horizontal platform, "not a vertical fork"                                                        | Contradicted by D1. Needs amending (§7, PR 1).                                                                           |
| The "non-negotiable invariants" in CLAUDE.md read as platform rules but are print rules (persist-raw, pgmq, Intake Receiver) | Correct for this repo, which is now PrintWorks's. Must **not** be copied into CuevikFlow as-is.                          |
| `user_role` is sales-shaped (`owner_admin`, `sales_manager`, `sales_rep`, `office_admin`; #41 adds `operations`)             | Fine here (PRD-024). CuevikFlow needs its own role set; only the `owner_admin` concept behind `is_admin()` carries over. |
| `src/lib/utils.ts` pins `en-US`, `USD`, and **`UTC`** for dates                                                              | UTC is wrong once jobs have due dates (D10).                                                                             |
| `.claude/commands/work/*.md` hardcode `Cueserve/cs-cueviksync` and project board 17                                          | Copying to CuevikFlow means rewriting these, or its work items land on this board.                                       |
| `supabase/.project-refs.json`, `db-drift.yml`, `/db-migrate` key on this repo's Supabase refs                                | Must be reset in the copy — a copied ref would point CuevikFlow's tooling at CuevikSync's database.                      |
| Brand assets, `brand-logo.tsx`, logo-anchored Tier-1 tokens                                                                  | CuevikFlow needs its own marks. Whether the Cueserve Tier-1 anchors stay is a CuevikFlow design-system decision.         |
| `docs/ENVIRONMENTS.md`, `docs/DATABASE.md` "match RedyQuote deliberately"                                                    | Precedent for hand-synced copies, and for the drift D2 accepts.                                                          |

### 3.4 Does the structure support multi-tenant or multi-product extensibility?

**Multi-tenant: yes, at the foundation.** `tenants`, `tenant_id` on `profiles`,
`current_tenant_id()`, default-deny RLS, and the tenant-immutability guard are all in place. Gaps:
`tenants` holds only `name` (no settings — D10 starts closing that), tenant provisioning is
undesigned, and no tenant-scoped configuration tables exist yet.

**Multi-product: no, and it should not be made to.** One app, one migration chain, one board,
one stack, and docs that assert configuration-only verticals. Making this repo host two products
would mean rebuilding every one of those. D1 answers the need without doing so.

## 4. Separation Strategy

| Pattern                                 | Verdict                       | Reason                                                                                                                                                                                                   |
| --------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Modular monorepo                        | **Rejected**                  | Its value scales with shared code, and the shared code is small (§3.1). Every tool in §3.3 assumes one product per repo; a monorepo parameterizes all of them. CuevikFlow's stack differs from this one. |
| Multi-repo with shared packages         | **Deferred** (D2)             | Right shape, wrong time. Revisit at a third product or on measured drift.                                                                                                                                |
| Domain-driven modularization            | **Adopted, inside each repo** | Not an alternative to the repo decision — it is how each repo is organized. This repo keeps ARCHITECTURE §1's modules; CuevikFlow defines its own.                                                       |
| Plugin- or feature-flag-based isolation | **Rejected**                  | Flags put both clients' code in both deployments, and every client-specific branch becomes SaaS debt (D5). Per-tenant configuration does the legitimate part of this job.                                |

**Chosen: two repositories, copy once, domain modules within each.**

How shared logic is handled:

- **Auth and tenancy** — copied verbatim: `src/lib/supabase/*`, `src/proxy.ts`, and the `0001`
  / `0002` schema as the first migrations of CuevikFlow's own chain.
- **CRM** — ported once #41 merges, as that repo's own migrations and Server Actions. Ported, not
  linked: after the copy, each repo owns its CRM.
- **Job engine** — **not shared, and not abstracted.** A generic job engine written for two
  unlike aggregates, before either exists, is the speculative abstraction PROJECT-STRUCTURE §2
  warns against. Each product builds its own.
- **Utilities** — formatters become tenant-settings-driven here first (D10), then copied, so
  CuevikFlow starts with Australian dollars and Sydney time as data rather than a code edit.

## 5. Common vs Product-Specific Layers

Inside each repo, three layers:

| Layer                       | Contents                                                                                   | Rule                                                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Shared-origin**        | The files in §3.1 marked "As is". Same origin in both repos.                               | A fix here is checked against the other repo in the same week. The trigger is a written register of these files, not memory.                        |
| **2. Product domain**       | Modules, migrations, Server Actions, screens. Different in each repo.                      | Owned outright by that repo. No attempt to keep it aligned.                                                                                         |
| **3. Tenant configuration** | Pipelines, stages, custom fields, catalog, value lists, timezone — one client's specifics. | Data, never code (D5). Applied by provisioning or seed, never inside a migration: a migration is schema for every tenant, not setup for one client. |

Patterns, kept deliberately small:

- **Shared libraries:** none (D2). The shared-origin register replaces a package until a third
  product justifies one.
- **Interfaces and adapters:** only at real external boundaries — outbound email (Resend) and
  document storage. No internal plugin interface.
- **Configuration-driven behaviour:** the FieldDefinition catalog plus JSON values (PRD-022),
  per-tenant value lists (#41), and tenant settings (D10). This is where client variation goes.

## 6. Risks Accepted

- **Intellectual property.** "SaaS maybe later" holds only if each contract leaves ownership
  with Cueserve and licenses the build to the client. Not verified in this review; check both
  contracts before significant code is written.
- **Vercel Hobby until the first demo.** Vercel's Hobby plan is for personal, non-commercial use;
  building for a client is likely commercial even before payment. Accepted by the owner until
  both platforms move to paid plans before the first demo (D6). Keep a local `npm run dev` demo
  ready as a fallback.
- **CuevikFlow built without discovery.** Requirements are inferred (D11); the first demo is the
  real discovery. "Working" has no agreed boundary for SuperSmartPlans yet, and under pay-on-working
  that is scope risk carried unpaid.
- **Drift between shared-origin files** (D2). Mitigated by the register in §5, not eliminated.
- **Parallel build** (D7). Mitigated by switching only at work-item boundaries.

## 7. Follow-up Changes

Each is a source-of-truth change, so each follows CONTRIBUTING.md "Documentation changes":
proposed as a diff, downstream documents named, approved, landed on its own.

**PR 1 — Product split**

- `docs/PRODUCT.md` §7 — this repo is the Print & Signage product; other verticals ship as separate
  Cuevik products rather than configurations of this one.
- `docs/ENVIRONMENTS.md` §2 — RedyQuote dev paused; CuevikFlow dev takes the slot; paid plans
  before the first demo.

**PR 2 — Direct booking**

- `docs/PRODUCT.md` §3A — mark "Direct booking with no Inquiry or Opportunity" resolved.
- `docs/PRD.md` PRD-031 — a Job's Opportunity is optional; direct-booked Jobs sit outside capture
  metrics and inside job-level KPIs.
- `docs/ARCHITECTURE.md` §5 — the Opportunity and Job contract: a direct-booked Job carries its own
  Person/Organization, and the pair-must-be-linked rule applies to the Job itself.

**Deferred to the Job work item, not decided here:** whether Reorder (PRD-044) still creates a Won
Opportunity now that direct booking exists; when a direct-booked Job's customer becomes frozen.

**Outside this repo:** create `cs-cuevikflow` through `cs-kickstart` in a separate session, with
the shared-origin register and the §3.3 renames.
