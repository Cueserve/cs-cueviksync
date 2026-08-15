# CLAUDE.md — CuevikSync

Claude Code reads this file automatically from the repo root. Claude Code is the **only** AI
coding tool used on this project, and this file is the authority on how it must behave here.

## Source-of-truth docs

CuevikSync's product, requirements, architecture, and stack decisions live in `docs/`.
**Read the relevant one before proposing a change; never derive architecture or stack decisions
from memory.**

- [docs/PRODUCT.md](docs/PRODUCT.md) - what we are building and why
- [docs/PRD.md](docs/PRD.md) - testable requirements and feature scope
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - system structure and design decisions
- [docs/TECH-STACK.md](docs/TECH-STACK.md) - approved technologies and usage rules
- [docs/ENGINEERING-RULES.md](docs/ENGINEERING-RULES.md) - coding conventions, banned patterns, testing
- [docs/PROJECT-STRUCTURE.md](docs/PROJECT-STRUCTURE.md) - directory layout and file-placement rules
- [docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md) - which Supabase environment dev runs against, and why
- [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) - brand tokens, the semantic-token rule, the WCAG AA floor
- [docs/DATABASE.md](docs/DATABASE.md) - the data model. **Stub: not yet authored.**
- Backlog and work-item tracking lives in the
  [Cueserve GitHub Project](https://github.com/orgs/Cueserve/projects/17), not in `docs/`.

**Approved design specs** - same authority as the docs above for the slice they cover, but
**transient**: each is deleted when its content lands in whatever it feeds. They live in
`docs/specs/`, dated-filename-first.

_None currently._ When one lands, add it to this list in the same change, and remove it in the
change that deletes it.

**Everything else in `docs/*.md` is permanent.**

**Before creating any new route, Server Action, component, `src/lib/` module, or migration,
consult [docs/PROJECT-STRUCTURE.md](docs/PROJECT-STRUCTURE.md) for where it goes** - its §2
"Four Placement Questions" decides the location. If reality has to diverge from that layout,
update that file in the same change (see its §6).

## Engineering rules

@docs/ENGINEERING-RULES.md

The line above **imports** the project's coding conventions, banned patterns, and testing rules
into every session. They are not restated here. If one changes, edit
`docs/ENGINEERING-RULES.md`; never add a competing copy to this file.

[`CONTRIBUTING.md`](CONTRIBUTING.md) is the governance authority — branching, commit
convention, review flow, the self-review gate, the documentation-change process, and the only
approved list of run commands.

## Authority order

When two sources disagree, the higher one wins:

1. The filesystem and `git` — a document claiming a file exists loses to `ls`.
2. `CONTRIBUTING.md` for anything about process, governance, or commands.
3. `docs/` by lineage: PRODUCT → PRD → ARCHITECTURE → TECH-STACK → ENGINEERING-RULES. Each
   document's header names its own `Derived from:` / `Downstream:` files.
4. This file, for the Claude-Code behavior rules below that it owns.
5. `README.md` — it restates, it owns nothing.

## Project state

**Last verified: 2026-08-15.** Confirm a file or script still exists before relying on this
section - it is a snapshot, and a stale one is worse than none.

**Built - the bare-minimum app, plus tenancy, auth, and a concept dashboard.** The `@/*` alias
resolves to `./src/*`.

- **Shell and token layer** - `src/app/globals.css` (three-tier tokens, enforced by
  `eslint.config.mjs`), the root layout, `global-error.tsx`, the `(app)` shell with
  sidebar/topbar/user-menu (nav grouped Sales/Jobs/Settings, with a co-branded tenant/product
  logo slot via `src/components/brand-logo.tsx`), `(auth)/login`, a placeholder `/inquiries`
  route, and the 18 primitives in `src/components/ui/`.
- **A `/dashboard` route that is a pitch mockup, not a real screen** -
  `src/app/(app)/dashboard/` renders hardcoded sample data for Sales/Jobs/Finance KPIs. Its own
  header comment is explicit: Jobs is grounded in the committed PRD-043 weekly summary, Sales
  and Finance are speculative and have no data model in this repo. Nothing here talks to
  Postgres; treat it as a concept artifact, not scaffolding to wire up.
- **Supabase plumbing, unwired to any UI** - `src/lib/supabase/` (browser, server, service-role,
  session refresh), `src/proxy.ts`, `src/lib/config.ts` and `src/lib/config.server.ts`.
- **Toolchain** - Prettier, ESLint, Husky + lint-staged, Vitest, and a CI workflow.
- **A linked Supabase project** (`tdxojcqkiozmgjkrbypm`), with two applied migrations:
  `0001_extensions_and_types.sql` (pgcrypto, the four-role `user_role` enum) and
  `0002_tenants_profiles_and_auth.sql` (`tenants`, `profiles` with `tenant_id`, `is_admin()`,
  `current_tenant_id()`, the role-escalation and tenant-immutability guards, and RLS scoped to
  `tenant_id = current_tenant_id()`). RLS verified enabled on both tables. Neither `pgmq` nor
  `pg_cron` is enabled yet - deferred to the migration that first uses them.
- **`src/lib/supabase/types.ts` is real, generated output** - `npm run db:types` against the
  applied schema, not the hand-authored placeholder it used to be.
- **`docs/DATABASE.md` exists but is barely authored** - only §4's conventions block and the two
  applied migrations are real; §§1-3, 5, 6 are still unwritten. Check `supabase/migrations/` for
  what actually exists, not this doc.

**Not built.** No Server Actions, no domain screens wired to data, no tests, no
tenant-provisioning flow. A new `auth.users` row gets no `profiles` row - provisioning
(self-serve vs. invited, what happens to a new tenant's first user) is undecided and
undesigned; nothing auto-creates a tenant. Nothing in the app reads or writes data yet - the
login route renders but does not authenticate.

**CI is not red on the empty test suite.** `.github/workflows/ci.yml` runs four checks - `lint`,
`typecheck`, `format:check`, `test` - no `build` step exists in the workflow despite
README.md's "Everyday Checks" table listing five. `package.json`'s `test` script is
`vitest run --passWithNoTests` (true since the very first commit, not a recent change), so an
empty suite exits `0` rather than failing - the "CI is red, deliberately" claim previously here
does not match the source. There are still zero test files (`src/**/*.test.ts`) - correct if
this is stale.

## Approved stack

[docs/TECH-STACK.md](docs/TECH-STACK.md) is the authority; this is the short form.

- **Next.js 16** (App Router) · **React 19** · **TypeScript 5** · **Node.js 24 LTS** (Active
  LTS; `.nvmrc` + `engines.node` + `.npmrc engine-strict=true`)
- **Supabase** - Postgres 17 + Auth + Storage + Edge Functions. **Multi-tenant**, row-level
  `tenant_id` with RLS as the enforcement locus.
- **Server Actions are the sole authenticated mutation path.** A route handler under
  `src/app/api/` is only for an external HTTP surface that cannot be a Server Action.
- **npm only** - do not use pnpm or yarn.
- **Not used:** TanStack Query, Playwright/E2E, any ORM, external queue vendors,
  headless-browser PDF rendering, LLM/vector stores. Each with its reason in TECH-STACK.md §5.

## Operating the codebase

Facts written nowhere else. Everything already documented stays where it is - `package.json`
owns the script list, [docs/PROJECT-STRUCTURE.md](docs/PROJECT-STRUCTURE.md) owns placement - so
follow the pointer rather than expecting a copy here.

- **`npm run dev` serves on port 3001**, not 3000 (`next dev --port 3001`; `.claude/launch.json`
  matches).
- **Run one test file:** `npx vitest run src/lib/foo.test.ts`; `npx vitest` watches. The include
  glob is `src/**/*.test.ts` only (`vitest.config.ts`), so a `*.spec.ts` is never collected.
- **A test that touches the database runs on the local stack** (`npx supabase start`), never
  against the linked hosted project - the mandatory cases are destructive
  ([docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md) §1). That stack is not set up yet.
- **Which Supabase client:** `server.ts` in Server Components and Server Actions, `client.ts` in
  client components, `service-role.ts` only in the three system paths. The first two carry the
  caller's JWT, so RLS scopes the query for you; `service-role.ts` bypasses RLS and the caller
  MUST set `tenant_id` itself.
- **A new Server Action** lives in `src/server/actions/<aggregate>.ts` under
  `import 'server-only'`, validates its input against a Zod schema from `src/lib/validation/`,
  reads and writes through the session-bound client, and invalidates with
  `revalidatePath`/`revalidateTag` - there is no client-side cache library. Neither directory
  exists yet; the first one of each is yours to create.

## Non-negotiable invariants

Structural guarantees, not conventions - do not write code that breaks them.

- **Tenant scope is enforced by the database.** Every authenticated request carries the caller's
  JWT to Postgres, where RLS filters by `tenant_id`. A forgotten filter must fail closed (zero
  rows), never leak (NFR-008).
- **The three service-role paths re-scope `tenant_id` in code.** Intake Receiver, Ingestion
  Worker, and provisioning bypass RLS. `src/lib/supabase/service-role.ts` is `server-only` and
  separate from the user-scoped client precisely so this is never accidental.
- **Persist raw before processing.** The Intake Receiver durably enqueues to `pgmq` before any
  transformation and runs no business logic inline (NFR-002).
- **State changes go through the state machine.** Invalid transitions are rejected centrally,
  not field by field.
- **Audit in the same transaction.** A stage move or status change and its history row commit
  together.
- **Server-side is the source of truth for access.** A bypassed client must still be denied.

## Scope boundaries

**In bounds** without asking: implementing PRD-traced features inside an existing domain module,
writing Vitest tests, adding Zod schemas, writing Server Actions behind the existing
authorization path, and building screens with shadcn/ui + Tailwind.

**Out of bounds** without explicit human instruction — stop and get approval. This covers
everything under **Off-limits** below, plus these design-level contracts that aren't file paths:

- Any change to how the three service-role system paths (Intake Receiver, Ingestion Worker,
  provisioning) re-scope `tenant_id` in code.
- The capture path contract (`pgmq` enqueue, `pg_cron` drain, dead-letter handling).

When a task appears to need an out-of-bounds change, flag it and propose it — never make it
silently.

## Decision escalation

Stop and get explicit human approval before any of the following. State the change and its
reason first. **Touching anything under Off-limits always requires this**; the triggers here are
the ones that aren't file-scoped or are broader than a single path:

- **Adding or removing a package** — name the package, the reason, and the alternative rejected;
  wait for approval. Updates [`docs/TECH-STACK.md`](docs/TECH-STACK.md) first.
- **Any schema or migration change** — new, edited, or dropped tables, indexes, RLS policies,
  extensions, or history tables.
- **Breaking changes to a public API, database schema, or shared contract** — sign-off before
  commit.
- **Adding a direct-TCP Postgres client** — must use Supavisor transaction mode, and updates
  `docs/TECH-STACK.md` first.
- **Introducing a new runtime role, LLM/vector technology, or any capability beyond the
  thin-core PRD.**

## Off-limits

Never touch the following without explicit human instruction:

- **Secrets and env files** — `.env`, `.env.*`, and anything holding the Supabase service-role
  key, anon key, Resend/Sentry/PostHog keys, intake keys, or database credentials. Server-only
  secrets MUST NOT carry `NEXT_PUBLIC_`. `.claude/settings.json` denies these reads outright;
  that is the mechanical backstop, not a substitute for the rule.
- **Lock files** — `package-lock.json` is a side-effect of `npm`, not a direct edit.
- **Database migrations** — never create, modify, or delete files under `supabase/migrations/`
  autonomously.
- **CI/CD config** — `.github/workflows/`, Vercel configuration, and deployment settings require
  human review.
- **Auth-related code** — RLS policies, JWT/role-claim handling, Supabase Auth wiring, session
  cookies (`@supabase/ssr`), route guards, and the service-role system paths.
- **Dependency changes** — do not add or remove packages; state the package and reason and get
  approval first.

## Agent behavior

- **Plan before execute** — for any non-trivial task, show a plan and wait for approval before
  writing code or editing files.
- **Ask, don't assume** — if the task is ambiguous, ask before proceeding rather than guessing.
  Keep clarifying questions minimal and batched, not a drip of one-at-a-time round trips.
- **Scope discipline** — touch only what was explicitly asked. Flag out-of-scope issues without
  acting on them.
- **Stop and report** — if blocked or on a wrong path, say so immediately. Do not burn cycles on
  a dead end.
- **One change at a time** — when modifying existing files, propose one change, explain why, and
  wait for approval. No silent batch edits.
- **No invented scope** — do not add features, refactors, error handling, or abstractions beyond
  what was requested.
- **Uncertainty is explicit** — if unsure, say so. Never present a guess as a fact.

## Workflow

`CONTRIBUTING.md` owns branch naming, commit convention, the review flow, and the self-review
gate. Those rules are **not restated here** — read them there. These are the constraints
specific to working as an agent:

- **Branch creation is a human action** — never create a branch autonomously.
- **PRs** — never open, close, or comment on a Pull Request without explicit instruction.
- **Pushing to remote** — never push to any remote branch without explicit human approval. This
  includes the branch you are currently working on, not just `main`.

## Claude Code-specific config

- **Read before proposing.** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and
  [`docs/TECH-STACK.md`](docs/TECH-STACK.md) are the authority on structure and stack. Read the
  relevant one first — never derive an architecture or stack decision from memory or from what a
  similar project does.
- **Commands.** Run only what the `CONTRIBUTING.md` Tooling layer defines. Do not invent an
  `npm` script, and do not introduce a tool absent from `docs/TECH-STACK.md`.
- **Slash commands.**
  - `/db-migrate` — applies pending Supabase migrations to the linked hosted project, then
    regenerates types and verifies.
  - `/doc-audit` — audits the documentation set for drift, gaps, and duplication.
- **Migration guard.** `.claude/hooks/block-applied-migration.mjs` denies edits to any migration
  file already present in `origin/main`, because merged means applied to the hosted project and
  applied migrations are immutable. If it fires, author a **new** migration — do not work around
  the hook.
- **Repository state.** The app is scaffolded — `package.json`, `src/`, and `supabase/` all
  exist on `main`. **Project state** above says what is built and what is not; it is a dated
  snapshot, not a guarantee. Do not assume a command, script, or path exists; check first, and
  say so plainly when something is missing rather than inventing a plausible substitute.

## Building UI

**The design system decides how it looks - always.**
[docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) -> the tokens in `src/app/globals.css` -> the
`no-restricted-syntax` rule in `eslint.config.mjs`. Every color, font, radius, and type size
comes from there. Never a hex literal, never a raw Tailwind color class (`bg-slate-100`), never
a font other than the two declared in `src/lib/fonts.ts`. Adding a token is a DESIGN-SYSTEM.md
change requiring approval.

**The Tier-1 brand anchors are the ratified Cueserve logo colors** (DESIGN-SYSTEM.md §1).
`--clay-600` and `--moss-600` are the literal logo hexes and are load-bearing - do not touch
either. Everything below Tier 1 is settled.

### The order on a UI-bearing change

A new route, screen, or user-facing component follows these steps in order. **Backend-only work
(a migration, a Server Action, a `src/lib/` module) is exempt and starts at step 5.** This
section is the authority on the order; README's "Claude Code Setup" covers installing the
plugins and nothing else.

1. **`/impeccable shape` first, and confirm the brief before building.** Required, not optional.
   If the _problem_ is still open - what the screen is for, whether it should exist at all -
   `superpowers:brainstorming` runs before this. Shaping settles how a screen behaves and looks,
   never whether to build it.
2. **Design system.** Resolve every value to a token before writing markup, per the rule above.
3. **shadcn builds it - no plugin does.** This is a shadcn project
   ([components.json](components.json), style `radix-nova`, `cssVariables: true`), and the 18
   primitives in `src/components/ui/` are shadcn components already adapted to our tokens.
   - **Reuse before you add.** Check `src/components/ui/` first, then extend a primitive with a
     `cva` variant before pulling in a new one.
   - **Adding a primitive:** `npx shadcn@latest add <name>`. Its output is compatible by
     construction - shadcn names its tokens exactly as `globals.css` defines them. Read the diff
     anyway: a hardcoded color in generated output is a bug, not a starting point.
   - **`src/components/ui/` must stay app-agnostic.** `eslint.config.mjs` bans imports from
     `@/server/*`, `@/lib/supabase/*`, and `@/app/*` there. It is the extraction boundary for a
     future shared Cuevik library.
4. **Audit the rendered route, not the source.** A source scan cannot check contrast - our
   semantic tokens resolve at runtime, so `npx impeccable detect src/` _skips_ WCAG rather than
   passing it. Run `npm run dev` and audit the URL instead:
   `npx impeccable detect http://localhost:3001/<route>`. Because `eslint.config.mjs` already
   bans the raw palette classes most of its detectors key on, anything it reports got past
   `npm run lint` and is a real finding - fix it, never silence it by changing a token.
5. **Ship gate:** `npm run lint` and `npm run typecheck`. A suggestion that fails lint was never
   a valid suggestion.

**`/impeccable craft` is banned** - it builds as well as plans, and nothing but shadcn writes UI
in this repo.

## When blocked

Stop and say so. Do not guess, do not proceed on an assumption, and do not silently narrow the
task. Name what is ambiguous, state the options, and wait.
