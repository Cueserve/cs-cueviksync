# ENGINEERING-RULES.md — Coding Conventions, Banned Patterns, Testing

**Owner:** Viral Parikh
**Last updated:** 2026-08-09
**Source of truth for:** the engineering rules every change to the CuevikSync codebase must
follow, whoever or whatever writes it.

> Derived from: docs/ARCHITECTURE.md, docs/TECH-STACK.md
> Downstream: README.md

---

## 1. Coding Conventions

- **Language:** TypeScript 5.x with `strict` enabled. New code MUST type-check under
  `tsc --noEmit`; `any` is a last resort with a stated reason.
- **Formatting & linting:** Prettier 3.x is the sole formatter and ESLint 9.x (flat config,
  `eslint.config.mjs`) the sole linter. Do not hand-format or add a competing tool. `next lint`
  was removed in Next 16 — lint via the ESLint Command-Line Interface (CLI).
- **Routing:** Next.js **App Router only**. The Pages Router MUST NOT be introduced.
- **Mutation path:** Server Actions are the sole path for authenticated writes. Server
  Components read; Server Actions write. A route handler under `src/app/api/` is permitted
  **only** for an external Hypertext Transfer Protocol (HTTP) surface that cannot be a Server
  Action — an inbound webhook or a third-party callback — never as an internal Application
  Programming Interface (API) layer for the app's own screens. There is no client-side
  server-state cache library: `revalidatePath` / `revalidateTag` is the invalidation mechanism.
- **Database access:** no Object-Relational Mapper (ORM). Reach Postgres through
  `@supabase/supabase-js` / PostgREST. Regenerate types with `supabase gen types typescript`
  after any schema change and use the generated types.
- **Schema changes:** authored as Supabase CLI migrations under `supabase/migrations/*.sql` —
  tables, indexes, RLS policies, extensions, and history tables included. Editing schema by
  hand in the Supabase dashboard is prohibited.
- **Validation:** Zod is the single schema-validation tool of record. All external input
  (API bodies, the intake payload, custom-field values) MUST be validated against a Zod schema
  server-side before it reaches a domain module or the datastore.
- **File structure:** the application lives under `src/` — routes in `src/app/` (App Router),
  shared UI in `src/components/`, framework-free modules in `src/lib/`. The `@/*` alias resolves
  to `./src/*`. `supabase/` holds migrations and Edge Functions; `docs/` holds the
  source-of-truth documents. Keep domain logic in its module (Capture & Triage, CRM, Pipeline,
  Quoting, Configuration); do not scatter a module's rules across unrelated files. See
  `docs/PROJECT-STRUCTURE.md` for the full placement rules.
- **Package manager:** `npm` only (bundled with Node.js 24 Long-Term Support (LTS)). Do not use
  `pnpm` or `yarn`.
- **Comments:** comment **why**, not **what** — explain a non-obvious decision, constraint, or
  trade-off; do not narrate code the reader can see.
- **Do not contradict the docs:** the source-of-truth documents in `docs/` and `CONTRIBUTING.md`
  are authoritative. A code comment or inline note that disagrees with one is a defect in the
  comment, not in the document. Changing a source-of-truth document has its own process — see
  `CONTRIBUTING.md`.

## 2. Banned Patterns

Each is banned because it breaks a decision in [ARCHITECTURE.md](ARCHITECTURE.md) or
[TECH-STACK.md](TECH-STACK.md):

- **Browser-to-Postgres direct Create/Read/Update/Delete (CRUD)** — every authenticated read
  and write MUST go through the server as sole access authority (PRD-025). The browser holds no
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

## 3. Testing Rules

- **Frameworks:** Vitest 4.x for unit tests. Do not introduce a competing test runner.
  There is **no end-to-end framework** in the approved stack: no Playwright, no `e2e/`, no
  `test:e2e`. Adding one is a `docs/TECH-STACK.md` change first.
- **Where tests run:** against the **local** Supabase stack (`npx supabase start`), never
  against the linked hosted development project — the mandatory cases below are destructive.
  See `docs/ENVIRONMENTS.md`.
- A valid test asserts observable behavior against a PRD or Non-Functional Requirement (NFR),
  not implementation detail.
- **Tenant isolation MUST be tested:** a cross-tenant read/write attempt returns zero rows or is
  rejected. This is the NFR-008 guarantee and is not optional coverage.
- **Worker idempotency MUST be tested:** one IntakeSubmission yields exactly one Inquiry across
  redelivery/retry.
- State-machine tests MUST cover rejected invalid transitions, not only the happy path.
- Do not mock away the security boundary (RLS, authorization) to make a test pass — a test that
  green-lights a bypassed client is invalid.
- The blocking Continuous Integration (CI) gate is `lint` + `tsc --noEmit` + `format:check`
  - Vitest. New feature work MUST land with unit tests in the gate. **There is no numeric
    line-coverage gate by decision** — coverage is judged by behavior, not line count: a feature is
    adequately tested when its PRD-traced behavior, its failure/rejection paths, and any mandatory
    cases in this section that apply (tenant isolation, worker idempotency, state-machine
    rejections) are asserted. A single happy-path test does not satisfy this.
