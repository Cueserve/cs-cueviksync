# TECH-STACK.md — Approved Technologies

**Owner:** Architect
**Last updated:** 2026-07-14
**Source of truth for:** the technologies approved for the CuevikSync Phase 1 thin-core release and the rules for how each may be used.

> Derived from: docs/PRD.md, docs/ARCHITECTURE.md
> Downstream: docs/AI-TOOL-GUIDE.md, README.md, docs/BACKLOG.md

## Document References

| # | Document | Role |
| --- | --- | --- |
| 1 | PRODUCT.md | What we are building and why |
| 2 | PRD.md | Testable requirements |
| 3 | ARCHITECTURE.md | System structure & design decisions |
| 4 | TECH-STACK.md | Approved technologies & usage rules |
| 5 | AI-TOOL-GUIDE.md | Rules & constraints for AI tools |
| 6 | README.md | Setup, env config, how to run |
| 7 | BACKLOG.md | Epics/stories manifest |

---

## 1. Languages & Frameworks

Version columns record the approved major/minor line. Exact patch versions are pinned
in the lockfile when the repository is scaffolded (see §6).

| Technology | Version | Reason | Maps to PRD req |
| --- | --- | --- | --- |
| TypeScript | 5.x (strict) | One typed language across the Next.js app and the Supabase Edge Functions, so the client/server and capture-path contracts are checked at compile time. | PRD-025, NFR-008 |
| Next.js (App Router) | 16.x | Hosts the Single-Page Application (SPA) and the server JSON Application Programming Interface (API) as one modular monolith; App Router server route handlers are the sole access-authority layer. | PRD-025, NFR-005 |
| React | 19.x | Renders the SPA client — pipeline board, quote builder, and dynamic custom-field forms. | PRD-025, NFR-012 |
| Node.js | 22 Long-Term Support (LTS) | Runtime for the Next.js server on Vercel. | NFR-005 |
| Deno | Supabase-managed | Runtime for Supabase Edge Functions that run the Intake Receiver and Ingestion Worker. | PRD-001, PRD-030 |

## 2. Datastores

The domain is a connected relational graph (ARCHITECTURE §2), so the primary store is
relational. The durable Intake Buffer and quote documents also live in the Supabase data
plane, keeping one managed vendor for all persistence.

| Datastore | Version | Role | Reason |
| --- | --- | --- | --- |
| Supabase Postgres | 17 | Primary store: records, tenant config, per-entity history, and JSON custom-field values, isolated by row-level `tenant_id`. | Relational graph fits ARCHITECTURE §2; row-level tenancy meets NFR-006 scale without per-tenant provisioning cost. |
| `pgmq` (Postgres queue extension) | latest for PG 17 | The durable Intake Buffer — raw web-form submissions persisted before any transformation. | Persist-before-process point that makes a dropped submission physically hard (NFR-002); keeps the buffer inside the same managed Postgres, no separate queue vendor. |
| Postgres dead-letter table | — (schema object) | Holds poison submissions parked after 3 failed transform attempts, retained for manual completion. | Makes PRD-030 "never silently dropped" concrete; surfaced for the dead-letter alert (ARCHITECTURE §9). |
| Supabase Storage | managed | Stores generated printable/shareable quote documents. | PRD-020 quote issuance needs a durable artifact store co-located with the tenant data. |

## 3. Cloud & Infrastructure Services

| Service | Purpose | Notes |
| --- | --- | --- |
| Vercel | Hosts the Next.js app (SPA + JSON API), the authenticated Primary Application. | Deployed independently of the intake path; region co-located with the Supabase project to keep NFR-005 latency in budget. |
| Supabase Platform | Managed Postgres, Auth, Storage, and Edge Functions. | Managed infrastructure underpins the availability (NFR-003) and durability (NFR-010) targets; Point-in-Time Recovery (PITR) is a required add-on (see §6). |
| Supabase Edge Functions | Runs the public, unauthenticated **Intake Receiver** and the **Ingestion Worker**. | Deployed separately from the Vercel app so the receiver's uptime is independent of the authenticated application (NFR-002, NFR-003). Receiver persists raw payloads only — no business logic. |
| `pg_cron` | Schedules the Ingestion Worker to drain `pgmq` on an interval. | Idempotent transform on submission id; bounded retries then dead-letter (PRD-001, PRD-030). |
| Supavisor (connection pooler) | Pools direct Postgres connections. | **Not on the app's hot path** — `supabase-js`/PostgREST and the Edge Functions reach Postgres over REST/RPC and bypass Supavisor. Relevant only to direct-TCP clients (the Supabase CLI migration connection, §6), which MUST use transaction mode. |
| Supabase Auth (GoTrue) | First-party credential store and identity for Role-Based Access Control (RBAC). | Passwords hashed with bcrypt (meets NFR-007 fallback: work factor ≥ 12). Sessions carried as httpOnly cookies via `@supabase/ssr`; cookie flags in §6. |
| Resend | Optional outbound delivery of a quote document by email. | Delivery is optional per PRD-020; "mark sent" is an explicit user action decoupled from delivery. The only third-party egress; carries quote content only. |
| Sentry | Application error tracking and interactive-latency monitoring. | Serves NFR-005 (p95/p99 per view) and surfaces worker/receiver exceptions. |
| PostHog | Product analytics — onboarding funnel and session replay. | Serves NFR-004 (3-day onboarding measurement) and UX debugging of capture/pipeline screens. |

## 4. Key Libraries / Tools

| Library / tool | Version | Used for |
| --- | --- | --- |
| Tailwind CSS | 4.x | Utility styling system for all SPA screens. |
| shadcn/ui | CLI-pinned (Radix-based) | Accessible component primitives; the Radix foundation carries the keyboard/ARIA behavior that WCAG 2.1 AA (NFR-012) depends on. |
| TanStack Query (React Query) | 5.x | Client-side server-state cache for the queue, pipeline board, and quote views; keeps perceived interaction latency low (NFR-005). |
| `@supabase/supabase-js` | 2.x | Postgres and Storage access. Authenticated user requests use the user-scoped client (session cookie via `@supabase/ssr`) so RLS applies. The service-role key is used **server-side only**, confined to the three system paths (Intake Receiver, Ingestion Worker, provisioning), and is **never shipped to the browser**. |
| `@supabase/ssr` | 0.x | Supabase Auth session handling via httpOnly cookies in the Next.js server. |
| `resend` (SDK) | 4.x | Resend API client for quote-email delivery. |
| `@sentry/nextjs` | 9.x | Sentry integration for the Next.js app and Edge Functions. |
| `posthog-js` / `posthog-node` | 1.x | PostHog event capture (client and server). |
| ESLint | 9.x | Linting, run through `next lint` (Next-bundled config). |
| Prettier | 3.x | Code formatting; the single formatter of record. |
| Vitest | 3.x | Unit tests. |
| Playwright | 1.x | End-to-end tests and the automated WCAG 2.1 AA check (NFR-012). |
| Husky | 9.x | Git hook management (pre-commit). |
| lint-staged | 16.x | Runs Prettier and ESLint on staged files at commit time. |

## 5. Selection Trade-offs

| Choice | Alternatives rejected | Why |
| --- | --- | --- |
| Next.js on Vercel (SPA + JSON API in one app) | Server-rendered Multi-Page Application (MPA); split SPA + standalone API services | ARCHITECTURE §4 chose an SPA with the API as sole access authority; a modular monolith on one host keeps ops trivial at 10 concurrent users (NFR-004/005). |
| Supabase managed platform | Self-hosted Postgres + hand-rolled auth/storage; Firebase | One managed vendor delivers the NFR-003/010 posture for Postgres, Auth, Storage, and Edge Functions. Firebase's document model was rejected — the domain is a relational graph (ARCHITECTURE §2). |
| Supabase Auth as-is (JSON Web Token (JWT), bcrypt) | Roll-own Argon2id session auth; external Identity Provider (IdP) / Auth0 | Reuse the managed auth already in the platform; bcrypt satisfies the NFR-007 fallback. The session posture is a cookie-carried JWT (httpOnly, via `@supabase/ssr`), reconciled into ARCHITECTURE §1/§4/§5/§7. External IdP stays rejected per ARCHITECTURE §4. |
| Database-enforced RLS as the authorization locus + app-side route guards for admin config | App-layer-primary authz (service-role + manual `tenant_id` scoping on every query); browser-direct database access; RLS dropped entirely | ARCHITECTURE §4/§5/§7 makes Postgres RLS the enforcement locus: the caller's JWT (httpOnly cookie, via `@supabase/ssr`) reaches Postgres through PostgREST as the `authenticated` role, and RLS decides tenant scope + row ownership. App-side route guards sit in front only to gate admin-only configuration (PRD-026). App-layer-primary was rejected — a single forgotten `tenant_id` filter is a silent cross-tenant leak, whereas under RLS the same bug returns zero rows. Browser-direct DB access was rejected (PRD-025 requires the server as sole authority). Dropping RLS was rejected — it removes the non-bypassable tenant guarantee. The PRD-027 ownership matrix is expressed in RLS policies plus JWT role claims. |
| `pgmq` + `pg_cron` for the capture path | Vercel stateless functions as the buffer; external queue (SQS / Upstash) | Vercel functions are stateless and ephemeral, so they cannot *be* the durable buffer. `pgmq` keeps the buffer in the same managed Postgres — no new vendor — and satisfies persist-before-process (NFR-002). |
| Resend for email | Amazon SES; raw SMTP relay; SendGrid | A simple transactional API is enough because delivery is optional (PRD-020); heavier providers add setup the release does not need. |
| Sentry + PostHog for observability | Single-vendor Application Performance Monitoring (Datadog); platform logs only | Sentry covers app errors and interactive latency (NFR-005); PostHog covers the onboarding funnel (NFR-004). **Gap:** neither covers the capture service-level signals — buffer depth, worker lag, dead-letter count (ARCHITECTURE §9); those come from Supabase observability plus custom alerts on the `pgmq`/dead-letter tables. |

## 6. Versions & Constraints

- Node.js MUST be >= 22 LTS (Vercel runtime).
- Next.js 16.x App Router only — the Pages Router MUST NOT be used.
- React 19.x; TypeScript 5.x with `strict` enabled.
- Tailwind CSS 4.x; TanStack Query 5.x.
- Supabase Postgres 17. The `pgmq` and `pg_cron` extensions MUST be enabled.
- Point-in-Time Recovery (PITR) MUST be enabled on the Supabase project to meet NFR-010
  (Recovery Point Objective (RPO) <= 24 hours); default daily backups alone MAY NOT.
- Transport Layer Security (TLS) 1.2 or higher MUST be enforced at both the Vercel and
  Supabase edges; plaintext HTTP MUST be rejected (NFR-009).
- The Supabase service-role key MUST be used server-side only and MUST NOT be exposed to
  the browser; its use is confined to the three system paths (Intake Receiver, Ingestion
  Worker, provisioning), which re-scope `tenant_id` in code.
- The Supabase session cookie (issued via `@supabase/ssr`) MUST carry the `httpOnly`,
  `Secure`, and `SameSite` flags; these back the anti-CSRF posture in ARCHITECTURE §7.
- Authenticated application traffic reaches Postgres over PostgREST/`supabase-js` (REST),
  which pools internally and does **not** use Supavisor; no direct-TCP client is on the
  request path. The Intake Receiver enqueues to `pgmq` via a `supabase-js` RPC call, not a
  direct connection.
- Any direct Postgres (TCP) connection — the Supabase CLI migration path (§4), or any future
  raw-SQL / query-builder client — MUST use **Supavisor transaction mode (port 6543)** with
  prepared statements disabled (`prepare: false`). Session mode (port 5432) is for persistent
  backends only; direct connections are IPv6-only (Supavisor is IPv4). Adding a
  direct-connection client to the request path requires updating this file first.
- No browser-to-Postgres direct Create/Read/Update/Delete (CRUD). Every authenticated
  record read and write carries the caller's JWT to Postgres through PostgREST as the
  `authenticated` role, where RLS enforces tenant scope and row ownership (PRD-025,
  NFR-008); RLS is the primary control, fronted by app-side route guards for admin-only
  configuration.
- The package manager is `npm` (bundled with the approved Node.js 22 LTS); a different
  package manager MUST NOT be introduced without updating this file.
- ESLint 9.x + Prettier 3.x are the only linter and formatter. Vitest 3.x runs unit tests;
  Playwright 1.x runs end-to-end tests and the automated WCAG 2.1 AA check (NFR-012).
  Husky 9.x + lint-staged 16.x enforce format/lint at commit time.
- Exact patch versions are pinned in the lockfile at scaffold time. This file records the
  approved major/minor line; changing a line requires updating this file first.
- Large Language Model (LLM) and vector-store technologies are **out of the approved
  stack** for the thin-core release — the AI sales assistant is out of scope (PRD §9).
  Adding them requires an approved PRD update and an update to this file first.
