# AI-TOOL-GUIDE.md — Rules for AI Tools

**Owner:** Architect
**Last updated:** 2026-07-18
**Source of truth for:** how AI coding tools must behave when working on the CuevikSync codebase.

> Derived from: docs/ARCHITECTURE.md, docs/TECH-STACK.md
> Downstream: README.md, docs/BACKLOG.md

---

## 1. Project Context

CuevikSync thin-core is a multi-tenant Software-as-a-Service (SaaS) application for lead
capture, Customer Relationship Management (CRM), pipeline, and quoting. It is a **Next.js 16
App Router modular monolith on Supabase**, deployed on Vercel, with three runtime roles
sharing one Supabase Postgres 17 datastore:

- **Intake Receiver** — a public, unauthenticated Supabase Edge Function that durably persists
  raw web-form submissions to a `pgmq` buffer and acknowledges. It runs no business logic.
- **Ingestion Worker** — a `pg_cron`-scheduled consumer that transforms buffered submissions
  into tenant-scoped Inquiry records, idempotent on the submission identifier.
- **Primary Application** — the Next.js Single-Page Application (SPA) over a server JavaScript
  Object Notation (JSON) Application Programming Interface (API); holds the domain modules
  (Capture & Triage, CRM, Pipeline, Quoting, Configuration).

Tenant isolation is a database guarantee: every authenticated request carries the caller's
Supabase JSON Web Token (JWT) in an httpOnly cookie to Postgres, where Row-Level Security
(RLS) filters every row by `tenant_id`. The stack is TypeScript 5.x (strict), React 19,
Tailwind CSS 4, shadcn/ui, TanStack Query 5, Zod, and `@supabase/supabase-js` with generated
types — **there is no Object-Relational Mapper (ORM)**. Full detail lives in
[ARCHITECTURE.md](ARCHITECTURE.md) and [TECH-STACK.md](TECH-STACK.md); those two documents are
the authority whenever this summary is not enough.

## 2. Coding Conventions

- **Language:** TypeScript 5.x with `strict` enabled. New code MUST type-check under
  `tsc --noEmit`; `any` is a last resort with a stated reason.
- **Formatting & linting:** Prettier 3.x is the sole formatter and ESLint 9.x (flat config,
  `eslint.config.mjs`) the sole linter. Do not hand-format or add a competing tool. `next lint`
  was removed in Next 16 — lint via the ESLint Command-Line Interface (CLI).
- **Routing:** Next.js **App Router only**. The Pages Router MUST NOT be introduced.
- **Database access:** no ORM. Reach Postgres through `@supabase/supabase-js` /
  PostgREST. Regenerate types with `supabase gen types typescript` after any schema change and
  use the generated types.
- **Schema changes:** authored as Supabase CLI migrations under `supabase/migrations/*.sql` —
  tables, indexes, RLS policies, extensions, and history tables included. Editing schema by
  hand in the Supabase dashboard is prohibited.
- **Validation:** Zod is the single schema-validation tool of record. All external input
  (API bodies, the intake payload, custom-field values) MUST be validated against a Zod schema
  server-side before it reaches a domain module or the datastore.
- **File structure:** follow the Next.js App Router layout for the application, `supabase/` for
  migrations and Edge Functions, and `docs/` for the source-of-truth documents. Keep domain
  logic in its module (Capture & Triage, CRM, Pipeline, Quoting, Configuration); do not scatter
  a module's rules across unrelated files.
- **Package manager:** `npm` only (bundled with Node.js 22 Long-Term Support (LTS)). Do not use
  `pnpm` or `yarn`.

## 3. Scope Boundaries

**In bounds** without asking: implementing PRD-traced features inside an existing domain
module, writing Vitest/Playwright tests, adding Zod schemas, wiring API route handlers behind
the existing authorization path, and building SPA screens with shadcn/ui + Tailwind.

**Out of bounds** without explicit human instruction — stop and get approval (see §7). This
covers every area enumerated in §9 (Off-Limits Boundaries), plus the design-level contracts
below that aren't file paths:

- Any change to how the three service-role system paths (Intake Receiver, Ingestion Worker,
  provisioning) re-scope `tenant_id` in code.
- The capture path contract (`pgmq` enqueue, `pg_cron` drain, dead-letter handling).

When a task appears to need an out-of-bounds change, flag it and propose the change — do not
make it silently.

## 4. Banned Patterns

Each is banned because it breaks a decision in [ARCHITECTURE.md](ARCHITECTURE.md) or
[TECH-STACK.md](TECH-STACK.md):

- **Browser-to-Postgres direct Create/Read/Update/Delete (CRUD)** — every authenticated read
  and write MUST go through the server as sole access authority (PRD-025). The SPA holds no
  access authority.
- **App-layer-only tenant scoping** — never rely on a hand-written `tenant_id` filter as the
  sole guard on a user path. RLS is the enforcement locus; a forgotten filter must fail closed
  (zero rows), not leak.
- **Shipping the Supabase service-role key to the browser** — it is server-side only, confined
  to the three system paths, and MUST NOT carry the `NEXT_PUBLIC_` prefix.
- **Introducing an ORM** (Prisma, Drizzle, TypeORM, etc.) — the stack is `supabase-js` +
  generated types by decision (TECH-STACK §4).
- **Ad-hoc / hand-rolled input validation** — Zod only.
- **Hand-rolled authentication or a custom credential store** — authentication is Supabase Auth
  (GoTrue); do not re-implement it.
- **Entity-Attribute-Value tables or per-tenant physical columns for custom fields** — custom
  values live in the per-record JSON column validated against the FieldDefinition catalog.
- **Pages Router, `next lint`, or `next build`-time linting** — all removed/disallowed under
  Next 16.
- **Headless-browser PDF rendering (Puppeteer / Chromium)** — quote documents are generated
  with `@react-pdf/renderer`; a headless browser exceeds Vercel's 50 Megabyte (MB) function
  limit.
- **Network font fetches in `@react-pdf/renderer`** — fonts MUST be bundled and registered from
  local assets; a runtime fetch can produce a wrong customer-facing document.
- **External queue vendors (Amazon Simple Queue Service (SQS), Upstash) or Vercel functions as
  the buffer** — the durable buffer is `pgmq` in the same Postgres.
- **Last-write-wins updates on Opportunity or Quote** — use the optimistic-concurrency version
  check; a stale write MUST be rejected.
- **Auto-sending a quote** — "mark sent" is always an explicit human action, decoupled from
  delivery.
- **Bypassing the state machine** for quote-status or opportunity-terminal transitions — invalid
  transitions MUST be rejected centrally, not set field-by-field.
- **Adding Large Language Model (LLM) or vector-store technologies** (including `pgvector`) —
  out of the approved stack for thin-core; requires an approved PRD update first.

## 5. Testing Rules

- **Frameworks:** Vitest 3.x for unit tests; Playwright 1.x for end-to-end (E2E) and the
  automated Web Content Accessibility Guidelines (WCAG) 2.1 AA check. Do not introduce a
  competing test runner.
- A valid test asserts observable behavior against a PRD or Non-Functional Requirement (NFR),
  not implementation detail.
- **Tenant isolation MUST be tested:** a cross-tenant read/write attempt returns zero rows or is
  rejected. This is the NFR-008 guarantee and is not optional coverage.
- **Worker idempotency MUST be tested:** one IntakeSubmission yields exactly one Inquiry across
  redelivery/retry.
- State-machine tests MUST cover rejected invalid transitions, not only the happy path.
- Do not mock away the security boundary (RLS, authorization) to make a test pass — a test that
  green-lights a bypassed client is invalid.
- The blocking Continuous Integration (CI) gate is `lint` + `tsc --noEmit` + Vitest; E2E runs
  advisory/nightly. New feature work MUST land with unit tests in the gate. **There is no numeric
  line-coverage gate by decision** — coverage is judged by behavior, not line count: a feature is
  adequately tested when its PRD-traced behavior, its failure/rejection paths, and any mandatory
  cases in this section that apply (tenant isolation, worker idempotency, state-machine
  rejections) are asserted. A single happy-path test does not satisfy this.

## 6. Documentation Rules

- Comment **why**, not **what** — explain a non-obvious decision, constraint, or trade-off; do
  not narrate code the reader can see.
- The source-of-truth documents in `docs/` (and `CONTRIBUTING.md`) are authoritative. Do not
  contradict them in code comments or inline notes.
- Changing a source-of-truth document is a standalone change, never folded into feature work:
  propose the edit as a diff, name the downstream documents it affects (per the document's
  `Downstream:` line), get explicit approval, then land it in its own commit.
- Keep acronyms defined on first use in any new document; match the writing standard already in
  `docs/`.

## 7. Decision Escalation

Stop and get explicit human approval before doing any of the following — state the change and
its reason first. **Touching anything in §9 (Off-Limits Boundaries) always requires this**; the
triggers below are the ones that aren't file-scoped or are broader than a single path:

- **Adding or removing a package** — name the package, the reason, and the alternative
  rejected; wait for approval (also updates [TECH-STACK.md](TECH-STACK.md) first).
- **Any schema or migration change** — new/edited/dropped tables, indexes, RLS policies,
  extensions, or history tables (broader than the `supabase/migrations/` files in §9).
- **Breaking changes to a public API, database schema, or shared contract** — require sign-off
  before commit.
- **Adding a direct-Transmission Control Protocol (TCP) Postgres client** — must use Supavisor
  transaction mode and updates TECH-STACK.md first.
- **Introducing a new runtime role, LLM/vector technology, or any capability beyond the
  thin-core PRD.**

## 8. Agent Behavior Rules

- **Plan before execute** — for any non-trivial task, show a plan and wait for approval before
  writing code or editing files.
- **Ask, don't assume** — if the task is ambiguous, ask before proceeding rather than guessing.
  Keep clarifying questions minimal and batched, not a drip of one-at-a-time round trips. Never
  guess intent and proceed.
- **Scope discipline** — touch only what was explicitly asked. Flag out-of-scope issues without
  acting on them.
- **Stop and report** — if blocked or on a wrong path, say so immediately. Do not burn cycles on
  a dead end.
- **One change at a time** — when modifying existing files, propose one change, explain why, and
  wait for approval. No silent batch edits.
- **No invented scope** — do not add features, refactors, error handling, or abstractions beyond
  what was requested.
- **Uncertainty is explicit** — if unsure, say so. Never present a guess as a fact.

## 9. Off-Limits Boundaries

AI tools MUST NOT touch the following without explicit human instruction:

- **Secrets and env files** — `.env`, `.env.*`, and anything holding the Supabase
  service-role key, anon key, Resend/Sentry/PostHog keys, intake keys, or database
  credentials. Server-only secrets MUST NOT carry `NEXT_PUBLIC_`.
- **Lock files** — `package-lock.json` — a side-effect of `npm`, not a direct edit.
- **Database migrations** — never create, modify, or delete files under
  `supabase/migrations/` autonomously.
- **CI/CD config** — `.github/workflows/`, Vercel configuration, and deployment settings require
  human review.
- **Auth-related code** — RLS policies, JWT/role-claim handling, Supabase Auth wiring, session
  cookies (`@supabase/ssr`), route guards, and the service-role system paths.
- **Dependency changes** — do not add or remove packages; state the package and reason and get
  approval first.

## 10. Workflow Conventions

These mirror [`CONTRIBUTING.md`](../CONTRIBUTING.md); it is the governance authority — this
section MUST NOT diverge from it.

- **Branch creation** — a human action, not autonomous. Branch off an up-to-date `main` using
  the type prefix: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`, `docs/<slug>`.
- **Commit messages** — Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`,
  `test:`, `build:`, `ci:`).
- **Never push to `main`** — all changes land through a Pull Request (PR), one PR per branch.
- **PRs** — AI tools do not open, close, or comment on PRs without explicit instruction.
- **Pushing to remote** — never push to any remote branch without explicit human approval.
- **Self-review gate** — CuevikSync is solo / process-enforced: the author completes the
  `CONTRIBUTING.md` self-review checklist before merging. There is no second reviewer; the
  checklist is the gate.
- **Breaking changes** — any change to a public API, database schema, or shared contract requires
  human sign-off before commit.
