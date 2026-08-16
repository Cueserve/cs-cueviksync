# TECH-STACK.md — Approved Technologies

**Owner:** Viral Parikh
**Last updated:** 2026-07-14
**Source of truth for:** the technologies approved for the CuevikSync Phase 1 thin-core release and the rules for how each may be used.

> Derived from: docs/PRD.md, docs/ARCHITECTURE.md
> Downstream: docs/ENGINEERING-RULES.md, README.md

---

## Contents

- [1. Languages & Frameworks](#1-languages-frameworks)
- [2. Datastores](#2-datastores)
- [3. Cloud & Infrastructure Services](#3-cloud-infrastructure-services)
- [4. Key Libraries / Tools](#4-key-libraries-tools)
- [5. Deliberately Not Used](#5-deliberately-not-used)
- [6. Selection Trade-offs](#6-selection-trade-offs)
- [7. Versions & Constraints](#7-versions-constraints)

## 1. Languages & Frameworks

Version columns record the approved major/minor line. Exact patch versions are pinned
in the lockfile when the repository is scaffolded (see §6).

| Technology           | Version                                | Reason                                                                                                                                                                                                                                                                                                                                                                                                          | Maps to PRD req  |
| -------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| TypeScript           | 5.x (strict)                           | One typed language across the Next.js app and the Supabase Edge Functions, so the client/server and capture-path contracts are checked at compile time.                                                                                                                                                                                                                                                         | PRD-025, NFR-008 |
| Next.js (App Router) | 16.x                                   | One modular monolith. Server Components read; Server Actions are the sole path for authenticated writes, and are the access-authority layer. A route handler is permitted only for an external Hypertext Transfer Protocol (HTTP) surface that cannot be a Server Action — an inbound webhook or third-party callback — never as an internal Application Programming Interface (API) layer for our own screens. | PRD-025, NFR-005 |
| React                | 19.x                                   | Renders the pipeline board, quote builder, and dynamic custom-field forms — Server Components by default, client components only where interaction requires it.                                                                                                                                                                                                                                                 | PRD-025, NFR-012 |
| Node.js              | 24 Long-Term Support (LTS) ("Krypton") | Runtime for the Next.js server on Vercel. The Active LTS line — v22 went to Maintenance on 2025-10-21.                                                                                                                                                                                                                                                                                                          | NFR-005          |
| Deno                 | Supabase-managed                       | Runtime for Supabase Edge Functions that run the Intake Receiver and Ingestion Worker.                                                                                                                                                                                                                                                                                                                          | PRD-001, PRD-030 |

## 2. Datastores

The domain is a connected relational graph (ARCHITECTURE §2), so the primary store is
relational. The durable Intake Buffer and quote documents also live in the Supabase data
plane, keeping one managed vendor for all persistence.

| Datastore                         | Version           | Role                                                                                                                        | Reason                                                                                                                                                               |
| --------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supabase Postgres                 | 17                | Primary store: records, tenant config, per-entity history, and JSON custom-field values, isolated by row-level `tenant_id`. | Relational graph fits ARCHITECTURE §2; row-level tenancy meets NFR-006 scale without per-tenant provisioning cost.                                                   |
| `pgmq` (Postgres queue extension) | latest for PG 17  | The durable Intake Buffer — raw web-form submissions persisted before any transformation.                                   | Persist-before-process point that makes a dropped submission physically hard (NFR-002); keeps the buffer inside the same managed Postgres, no separate queue vendor. |
| Postgres dead-letter table        | — (schema object) | Holds poison submissions parked after 3 failed transform attempts, retained for manual completion.                          | Makes PRD-030 "never silently dropped" concrete; surfaced for the dead-letter alert (ARCHITECTURE §9).                                                               |
| Supabase Storage                  | managed           | Stores generated printable/shareable quote documents.                                                                       | PRD-020 quote issuance needs a durable artifact store co-located with the tenant data.                                                                               |

## 3. Cloud & Infrastructure Services

| Service                       | Purpose                                                                            | Notes                                                                                                                                                                                                                                                                                                  |
| ----------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Vercel                        | Hosts the Next.js app, the authenticated Primary Application.                      | Deployed independently of the intake path; region co-located with the Supabase project to keep NFR-005 latency in budget.                                                                                                                                                                              |
| Supabase Platform             | Managed Postgres, Auth, Storage, and Edge Functions.                               | Managed infrastructure underpins the availability (NFR-003) and durability (NFR-010) targets; Point-in-Time Recovery (PITR) is a required add-on (see §6).                                                                                                                                             |
| Supabase Edge Functions       | Runs the public, unauthenticated **Intake Receiver** and the **Ingestion Worker**. | Deployed separately from the Vercel app so the receiver's uptime is independent of the authenticated application (NFR-002, NFR-003). Receiver persists raw payloads only — no business logic. Applies a coarse per-intake-key abuse ceiling (Postgres-native counter, §6) before enqueueing.           |
| `pg_cron`                     | Schedules the Ingestion Worker to drain `pgmq` on an interval.                     | Idempotent transform on submission id; bounded retries then dead-letter (PRD-001, PRD-030).                                                                                                                                                                                                            |
| Supavisor (connection pooler) | Pools direct Postgres connections.                                                 | **Not on the app's hot path** — `supabase-js`/PostgREST and the Edge Functions reach Postgres over REST/RPC and bypass Supavisor. Relevant only to direct-TCP clients (the Supabase CLI migration connection, §6), which MUST use transaction mode.                                                    |
| Supabase Auth (GoTrue)        | First-party credential store and identity for Role-Based Access Control (RBAC).    | Passwords hashed with bcrypt (meets NFR-007 fallback: work factor ≥ 12). Sessions carried as httpOnly cookies via `@supabase/ssr`; cookie flags in §6.                                                                                                                                                 |
| Resend                        | Optional outbound delivery of a quote document by email.                           | Delivery is optional per PRD-020; "mark sent" is an explicit user action decoupled from delivery. The only third-party egress; carries quote content only.                                                                                                                                             |
| Sentry                        | Application error tracking and interactive-latency monitoring.                     | Serves NFR-005 (p95/p99 per view) and surfaces worker/receiver exceptions.                                                                                                                                                                                                                             |
| PostHog                       | Product analytics — onboarding funnel and session replay.                          | Serves NFR-004 (3-day onboarding measurement) and UX debugging of capture/pipeline screens. Session replay MUST mask input fields and any element rendering contact/inquiry personal data (Confidential, ARCHITECTURE §7); replay MUST NOT capture PII in the clear.                                   |
| GitHub Actions                | Continuous integration on every PR to `main`.                                      | One blocking job gates merges: `lint`, `typecheck`, `format:check`, `test`. No second advisory job — there is no end-to-end suite (§5). A net under the human gate (CONTRIBUTING) — the checks run on the real merge state, not just staged files, and say nothing about whether anyone read the diff. |

## 4. Key Libraries / Tools

| Library / tool                  | Version                  | Used for                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tailwind CSS                    | 4.x                      | Utility styling system for all application screens.                                                                                                                                                                                                                                                                                                                      |
| shadcn/ui                       | CLI-pinned (Radix-based) | Accessible component primitives; the Radix foundation carries the keyboard/ARIA behavior that WCAG 2.1 AA (NFR-012) depends on.                                                                                                                                                                                                                                          |
| Zod                             | 4.x                      | Schema validation of record — one declaration yields the runtime check and the inferred TypeScript type. Backs custom-field validation against FieldDefinition (PRD-022), mandatory opportunity fields (PRD-012), input validation for the stored-XSS mitigation (ARCHITECTURE §7), and the intake payload schema shared by the Receiver check and the Worker transform. |
| `@supabase/supabase-js`         | 2.x                      | Postgres and Storage access. Authenticated user requests use the user-scoped client (session cookie via `@supabase/ssr`) so RLS applies. The service-role key is used **server-side only**, confined to the three system paths (Intake Receiver, Ingestion Worker, provisioning), and is **never shipped to the browser**.                                               |
| `@supabase/ssr`                 | 0.x                      | Supabase Auth session handling via httpOnly cookies in the Next.js server.                                                                                                                                                                                                                                                                                               |
| Supabase CLI                    | latest                   | Database migrations (`supabase/migrations/*.sql`) and Edge Function deploys, both against a **linked hosted Supabase project** (`--linked`). Also provides the **local stack (`supabase start`), used only by automated tests and CI** — not for development. Schema, RLS policies, extensions (`pgmq`/`pg_cron`), and history tables are versioned as SQL migrations.   |
| `supabase gen types typescript` | (Supabase CLI)           | Generates TypeScript types from the database schema for typed `supabase-js` access — the type-safety path in the no-ORM stack. Regenerated after each schema migration.                                                                                                                                                                                                  |
| `resend` (SDK)                  | 4.x                      | Resend API client for quote-email delivery.                                                                                                                                                                                                                                                                                                                              |
| `@react-pdf/renderer`           | 4.x                      | Server-side generation of the printable/shareable quote document (PRD-020). `renderToBuffer` in a Next.js route handler produces the `.pdf` stored in Supabase Storage (§2) and attachable to the Resend email. Chosen over browser-render (Puppeteer): ~2 MB vs. ~100 MB Chromium, which exceeds Vercel's 50 MB function limit — pure-JS, no headless browser.          |
| `@sentry/nextjs`                | 9.x                      | Sentry integration for the Next.js app and Edge Functions.                                                                                                                                                                                                                                                                                                               |
| `posthog-js` / `posthog-node`   | 1.x                      | PostHog event capture (client and server).                                                                                                                                                                                                                                                                                                                               |
| ESLint                          | 9.x                      | Linting via the ESLint CLI (`eslint`) with flat config (`eslint.config.mjs`). Next 16 removed `next lint` and `next build` no longer lints.                                                                                                                                                                                                                              |
| Prettier                        | 3.x                      | Code formatting; the single formatter of record.                                                                                                                                                                                                                                                                                                                         |
| Vitest                          | 4.x                      | Unit tests.                                                                                                                                                                                                                                                                                                                                                              |
| Husky                           | 9.x                      | Git hook management (pre-commit).                                                                                                                                                                                                                                                                                                                                        |
| lint-staged                     | 17.x                     | Runs Prettier and ESLint on staged files at commit time.                                                                                                                                                                                                                                                                                                                 |

## 5. Deliberately Not Used

Recorded so each absence reads as a decision rather than an oversight. Adding any of these
back is a change to this file first.

| Not used                                                                 | Why not                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TanStack Query (React Query)                                             | Needed only for an SPA/JSON-API split. With Server Actions plus `revalidatePath`/`revalidateTag`, cache invalidation is the framework's job; a second cache would have to be kept coherent with it by hand.                                                                                                                                                                 |
| Playwright / any end-to-end framework                                    | Cut for now. It was in the approved stack but never gained a config, a spec, or a script — an installed runner that runs nothing implies coverage that does not exist. NFR-012 asks for an automated WCAG 2.1 AA check, which therefore has no runner: an open gap, recorded rather than papered over. Re-adopting it means config, specs, script and CI job in one change. |
| Any Object-Relational Mapper (Prisma, Drizzle, TypeORM)                  | The stack is `supabase-js` plus generated types. An ORM would add a second source of schema truth alongside `supabase/migrations/*.sql`, which ARCHITECTURE §5 makes authoritative.                                                                                                                                                                                         |
| External queue vendors (Amazon SQS, Upstash)                             | The durable Intake Buffer is `pgmq` in the same managed Postgres — no new vendor, and persist-before-process is satisfied without a network hop. Vercel functions cannot _be_ the buffer: they are stateless and ephemeral.                                                                                                                                                 |
| Headless-browser PDF rendering (Puppeteer / Chromium)                    | Quote documents are generated with `@react-pdf/renderer`: ~2 MB against Chromium's ~100 MB, which exceeds Vercel's 50 MB function limit outright.                                                                                                                                                                                                                           |
| Large Language Model and vector-store technologies, including `pgvector` | Out of the approved stack for the thin-core release — the AI sales assistant is out of scope (PRD §9). Adding them requires an approved PRD update and a change to this file first. For forward reference only: the intended vector path is `pgvector`, enable-on-demand in the same Postgres, so deferring costs nothing.                                                  |

## 6. Selection Trade-offs

| Choice                                                                                    | Alternatives rejected                                                                                                                            | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Next.js on Vercel — Server Components for reads, Server Actions for writes                | Single-Page Application (SPA) plus an internal JSON API layer; server-rendered Multi-Page Application (MPA); split SPA + standalone API services | Server Components + Server Actions is the App Router idiom. An SPA-plus-JSON-API on App Router is the bespoke arrangement: it discards Server Component data loading, requires a hand-built client fetch layer, and needs a client-side cache library to re-solve caching the framework already handles via `revalidatePath`. A modular monolith on one host keeps ops trivial at 10 concurrent users (NFR-004/005). The server remains sole access authority (PRD-025) — that requirement is about _where_ authorization runs, not about the transport.                                                                                                                                                                             |
| Supabase managed platform                                                                 | Self-hosted Postgres + hand-rolled auth/storage; Firebase                                                                                        | One managed vendor delivers the NFR-003/010 posture for Postgres, Auth, Storage, and Edge Functions. Firebase's document model was rejected — the domain is a relational graph (ARCHITECTURE §2).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Supabase Auth as-is (JSON Web Token (JWT), bcrypt)                                        | Roll-own Argon2id session auth; external Identity Provider (IdP) / Auth0                                                                         | Reuse the managed auth already in the platform; bcrypt satisfies the NFR-007 fallback. The session posture is a cookie-carried JWT (httpOnly, via `@supabase/ssr`), reconciled into ARCHITECTURE §1/§4/§5/§7. External IdP stays rejected per ARCHITECTURE §4.                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Database-enforced RLS as the authorization locus + app-side route guards for admin config | App-layer-primary authz (service-role + manual `tenant_id` scoping on every query); browser-direct database access; RLS dropped entirely         | ARCHITECTURE §4/§5/§7 makes Postgres RLS the enforcement locus: the caller's JWT (httpOnly cookie, via `@supabase/ssr`) reaches Postgres through PostgREST as the `authenticated` role, and RLS decides tenant scope + row ownership. App-side route guards sit in front only to gate admin-only configuration (PRD-026). App-layer-primary was rejected — a single forgotten `tenant_id` filter is a silent cross-tenant leak, whereas under RLS the same bug returns zero rows. Browser-direct DB access was rejected (PRD-025 requires the server as sole authority). Dropping RLS was rejected — it removes the non-bypassable tenant guarantee. The PRD-027 ownership matrix is expressed in RLS policies plus JWT role claims. |
| `pgmq` + `pg_cron` for the capture path                                                   | Vercel stateless functions as the buffer; external queue (SQS / Upstash)                                                                         | Vercel functions are stateless and ephemeral, so they cannot _be_ the durable buffer. `pgmq` keeps the buffer in the same managed Postgres — no new vendor — and satisfies persist-before-process (NFR-002).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Postgres-native per-intake-key abuse ceiling at the Receiver                              | Upstash Redis rate-limiter; no intake limit at all (defer entirely per PRD §12)                                                                  | A coarse per-key request cap protects the NFR-003 intake SLA, the Edge Function quota, and cost from an anonymous flood — infrastructure self-protection, distinct from the spam/dedup _filtering_ that PRD §12 correctly defers to a later PRD. A Postgres counter reuses the round-trip the Receiver already makes to enqueue, adding no vendor — consistent with the `pgmq` rejection of Upstash above. Upstash was rejected here for the same vendor-minimalism reason and no perf need at thin-core scale; it becomes a candidate only if intake volume makes the Postgres check a measured bottleneck. This is a ceiling, not precision traffic-shaping.                                                                       |
| Resend for email                                                                          | Amazon SES; raw SMTP relay; SendGrid                                                                                                             | A simple transactional API is enough because delivery is optional (PRD-020); heavier providers add setup the release does not need.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Sentry + PostHog for observability                                                        | Single-vendor Application Performance Monitoring (Datadog); platform logs only                                                                   | Sentry covers app errors and interactive latency (NFR-005); PostHog covers the onboarding funnel (NFR-004). **Gap:** neither covers the capture service-level signals — buffer depth, worker lag, dead-letter count (ARCHITECTURE §9); those come from Supabase observability plus custom alerts on the `pgmq`/dead-letter tables.                                                                                                                                                                                                                                                                                                                                                                                                   |

## 7. Versions & Constraints

- Node.js MUST be on the **Active LTS** line — currently **24.x** (Vercel runtime). Pinned in
  `.nvmrc` and enforced by `engines.node` in `package.json`, made a hard install failure by
  `.npmrc engine-strict=true`. The policy is "track Active LTS", which means one deliberate
  review per October promotion: v24 enters Maintenance **2026-10-20** and v26 becomes LTS
  **2026-10-28**, so revisit this line then rather than drifting onto a Current (odd-numbered,
  non-LTS) release by accident.
- Next.js 16.x App Router only — the Pages Router MUST NOT be used.
- React 19.x; TypeScript 5.x with `strict` enabled.
- Tailwind CSS 4.x. No client-side server-state cache library (§5).
- Authenticated writes go through Server Actions. A route handler is permitted only for an
  external HTTP surface that cannot be a Server Action (inbound webhook, third-party callback);
  it MUST NOT be introduced as an internal API layer for the app's own screens. Adding one
  requires updating this file first.
- Supabase Postgres 17. The `pgmq` and `pg_cron` extensions MUST be enabled.
- Point-in-Time Recovery (PITR) MUST be enabled on the Supabase project to meet NFR-010
  (Recovery Point Objective (RPO) <= 24 hours); default daily backups alone MAY NOT.
- Transport Layer Security (TLS) 1.2 or higher MUST be enforced at both the Vercel and
  Supabase edges; plaintext HTTP MUST be rejected (NFR-009).
- The Supabase service-role key MUST be used server-side only and MUST NOT be exposed to
  the browser; its use is confined to the three system paths (Intake Receiver, Ingestion
  Worker, provisioning), which re-scope `tenant_id` in code.
- Secrets (service-role key, Resend/Sentry/PostHog keys, intake keys, DB credentials) live
  in Vercel Environment Variables (Vercel-hosted app) and Supabase Vault / project secrets
  (Edge Functions); they MUST NOT be committed to the repository. The service-role key — and
  any other server-only secret — MUST NOT carry the `NEXT_PUBLIC_` prefix, which would inline
  it into the client bundle. Only the Supabase URL and anon key may be public.
- Supabase anon and service-role keys are rotatable from the Supabase dashboard; rotation is
  a documented runbook step, performed on suspected compromise. No fixed rotation cadence is
  set for thin-core (no NFR or compliance obligation requires one — ARCHITECTURE §7); a
  scheduled policy is revisited if a future compliance scope (e.g. SOC 2) demands it.
- Vercel preview deployments MUST NOT connect to the production Supabase project; previews use
  a separate Supabase project or database branch. Production credentials are never exposed to
  a preview environment.
- The Supabase session cookie (issued via `@supabase/ssr`) MUST carry the `httpOnly`,
  `Secure`, and `SameSite` flags; these back the anti-CSRF posture in ARCHITECTURE §7.
- The password hash is bcrypt because Supabase Auth (GoTrue) provides it; the algorithm is
  not independently configurable. NFR-007 lists Argon2id first and bcrypt (work factor ≥ 12)
  as the accepted fallback — this stack takes the fallback by platform constraint. A future
  Argon2id mandate would require a platform-level change, not a config toggle.
- Authenticated application traffic reaches Postgres over PostgREST/`supabase-js` (REST),
  which pools internally and does **not** use Supavisor; no direct-TCP client is on the
  request path. The Intake Receiver enqueues to `pgmq` via a `supabase-js` RPC call, not a
  direct connection.
- Any direct Postgres (TCP) connection — the Supabase CLI migration path (§4), or any future
  raw-SQL / query-builder client — MUST use **Supavisor transaction mode (port 6543)** with
  prepared statements disabled (`prepare: false`). Session mode (port 5432) is for persistent
  backends only; direct connections are IPv6-only (Supavisor is IPv4). Adding a
  direct-connection client to the request path requires updating this file first.
- All schema changes — tables, indexes, RLS policies, extension enablement, and history
  tables — MUST be authored as Supabase CLI migrations in `supabase/migrations/` and applied
  to the linked hosted project via `supabase db push --linked`. Applying schema or RLS changes by hand in the Supabase dashboard is
  prohibited; the migration files are the authoritative schema (and the definition a PITR/DR
  restore rebuilds against, NFR-010/NFR-013).
- TypeScript types for database access are generated with `supabase gen types typescript` and
  regenerated after any schema migration; there is no ORM in the stack.
- The Intake Receiver MUST enforce a coarse per-intake-key request ceiling (a Postgres-native
  counter) and reject requests over the cap before enqueueing to `pgmq`. This is
  infrastructure self-protection for the NFR-003 SLA and Edge quota — not spam/dedup
  filtering, which stays deferred (PRD §12). It MUST NOT block or slow a within-limit
  submission (persist-before-process, NFR-002 is unaffected).
- Continuous integration runs on GitHub Actions for every pull request to `main` and on
  every push to `main`, in one blocking job: `lint`, `typecheck` (`tsc --noEmit`),
  `format:check`, and `test` (Vitest). There is no second advisory job, because there is no
  end-to-end suite (§5). CI complements the local Husky/lint-staged hooks; it replaces neither
  the CONTRIBUTING self-review checklist nor the approving review the repository ruleset
  requires, which together are the human gate.
- Quote-document fonts MUST be bundled/embedded locally and registered from local assets;
  `@react-pdf/renderer` MUST NOT fetch fonts over the network at render time. A runtime font
  fetch can time out or silently substitute a fallback on a serverless cold start, producing
  a wrong customer-facing document — a failure the PRD-020 human-send gate should not have to
  catch.
- Zod is the single schema-validation tool of record; ad-hoc hand-rolled validation MUST NOT
  be introduced in its place. All external input — API request bodies, the intake payload, and
  custom-field values — MUST be validated against a Zod schema server-side before it reaches a
  domain module or the datastore. The intake payload schema is defined once and shared by the
  Receiver's schema check and the Worker's transform. Validation is paired with output encoding
  of user-supplied and captured text at render (the stored-XSS mitigation, ARCHITECTURE §7);
  Zod validates input but does not by itself encode output.
- No browser-to-Postgres direct Create/Read/Update/Delete (CRUD). Every authenticated
  record read and write carries the caller's JWT to Postgres through PostgREST as the
  `authenticated` role, where RLS enforces tenant scope and row ownership (PRD-025,
  NFR-008); RLS is the primary control, fronted by app-side route guards for admin-only
  configuration.
- The package manager is `npm` (bundled with the approved Node.js 24 LTS); a different
  package manager MUST NOT be introduced without updating this file.
- ESLint 9.x + Prettier 3.x are the only linter and formatter. ESLint runs via the ESLint
  CLI (`eslint`, flat config); `next lint` was removed in Next 16 and `next build` no longer
  lints, so linting is an explicit script/CI step. Vitest 4.x runs unit tests; there is no
  end-to-end runner (§5), so the automated WCAG 2.1 AA check NFR-012 calls for has no home
  yet — an open gap, not a solved one. Husky 9.x + lint-staged 17.x enforce format/lint at
  commit time.
- Exact patch versions are pinned in the lockfile at scaffold time. This file records the
  approved major/minor line; changing a line requires updating this file first.
- Large Language Model (LLM) and vector-store technologies are **out of the approved
  stack** for the thin-core release — the AI sales assistant is out of scope (PRD §9).
  Adding them requires an approved PRD update and an update to this file first. For
  forward reference only: when an approved PRD adds AI, the vector path is `pgvector`
  (enable-on-demand in the same Postgres — no new vendor, no provisioning cost to deferring),
  so it MUST NOT be enabled in the thin-core release. This records the intended path without
  importing anything into scope.
