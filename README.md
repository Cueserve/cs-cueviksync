# CuevikSync

> An AI-powered platform that helps small and mid-sized businesses capture every inbound inquiry and turn it into revenue.

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24_LTS-339933.svg)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Platform-3ecf8e.svg)](https://supabase.com/)

## Project Overview

CuevikSync gives you one workspace to capture every inbound inquiry — phone, email,
web form, or walk-in — into a single shared queue. Each inquiry moves through a
configurable pipeline until it is won, so no deal leaks or stalls.

The _**Phase-01 (Thin-Core release)**_ covers omnichannel capture and triage, unified
contact/company management, adaptive pipelines, basic quotation, and role-based custom
fields. See [PRODUCT.md](docs/PRODUCT.md) for the full product concept and scope.

Under the hood, CuevikSync is a multi-tenant Next.js modular monolith app backed by Supabase
(Postgres, Auth, and Edge Functions). The inbound-capture path is split into two isolated runtime
roles, so a lead is never dropped even when the main app is degraded — see [ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Key Concepts

- **Inquiry** — an inbound request at intake or triage, before it is qualified (informal:
  "lead"). Capturing every inquiry with zero leaks is the one failure the product exists
  to prevent.
- **Opportunity** — a qualified inquiry in the pipeline, with a stage, owner, next
  action, and expected value/date (informal: "deal").
- **Zero-leak capture** — the core flow. A public Intake Receiver saves each raw
  web-form submission to a durable queue _before_ any processing (persist-before-process).
  A scheduled Ingestion Worker then turns it into an Inquiry, retrying on failure so
  nothing is silently dropped.
- **Tenant isolation via RLS** — every authenticated request carries the caller's
  Supabase JSON Web Token (JWT) to Postgres, where Row-Level Security (RLS) filters every
  row by `tenant_id`. The database — not the application code — enforces this, so a
  forgotten filter fails closed (returns zero rows) rather than leaking across tenants.
- **Configuration is data, not code** — pipelines, stages, custom fields, and the catalog
  are read from tenant configuration at runtime. Changing them takes effect with no deploy.

## Prerequisites

- Node.js 24 LTS (Active LTS) — pinned in `.nvmrc`; `nvm use` picks it up
- npm (bundled with Node.js 24 LTS) — the only approved package manager; do not use pnpm or yarn
- Supabase CLI (latest) — links this clone to the hosted project, applies migrations, deploys
  Edge Functions, and runs the local test stack
- **No Docker required.** Development runs against a hosted Supabase project, not the local
  stack — see [ENVIRONMENTS.md](docs/ENVIRONMENTS.md)
- Git
- A Supabase account and project (Postgres 17) — this is your **development** database, not just
  a deploy target. `pgmq` and `pg_cron` are enabled by the migration that first needs them, not
  up front; neither is on yet
- A Vercel account (hosts the Next.js app)
- Optional accounts, only if the corresponding feature is enabled: Resend (quote-email
  delivery), Sentry (error tracking), PostHog (product analytics)

## Environment Setup

```bash
cp .env.example .env.local
```

Then fill each value. Secrets MUST NOT be committed. Server-only secrets MUST NOT carry
the `NEXT_PUBLIC_` prefix (that prefix inlines a value into the client bundle) — only the
Supabase URL and anon key may be public.

| Variable                        | Required | Description                                                                                                                                                            | Where to obtain                                                                           |
| ------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | yes      | Supabase project URL; safe to expose to the browser.                                                                                                                   | Supabase dashboard → Project Settings → API                                               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes      | Supabase anonymous (public) key for user-scoped, RLS-enforced client access.                                                                                           | Supabase dashboard → Project Settings → API                                               |
| `SUPABASE_SERVICE_ROLE_KEY`     | yes      | Server-only key for the three system paths (Intake Receiver, Ingestion Worker, provisioning). Bypasses RLS — never expose to the browser, never prefix `NEXT_PUBLIC_`. | Supabase dashboard → Project Settings → API (shared via the Cuevik team, never committed) |
| `SUPABASE_DB_URL`               | yes      | Direct Postgres connection for Supabase CLI migrations. MUST use Supavisor transaction mode (port 6543) with `prepare: false`.                                         | Supabase dashboard → Project Settings → Database (Connection pooling)                     |
| `INTAKE_KEY_SECRET`             | yes      | Server-side secret backing per-tenant intake-key resolution at the public Intake Receiver.                                                                             | Cuevik team (shared secret)                                                               |
| `RESEND_API_KEY`                | no       | Resend API key for optional outbound quote-document email. Omit to disable email delivery.                                                                             | Resend dashboard → API Keys                                                               |
| `SENTRY_DSN`                    | no       | Sentry Data Source Name for server-side error tracking.                                                                                                                | Sentry dashboard → Project Settings → Client Keys (DSN)                                   |
| `NEXT_PUBLIC_SENTRY_DSN`        | no       | Sentry DSN for the browser client.                                                                                                                                     | Sentry dashboard → Project Settings → Client Keys (DSN)                                   |
| `NEXT_PUBLIC_POSTHOG_KEY`       | no       | PostHog project API key for product analytics (onboarding funnel, session replay).                                                                                     | PostHog dashboard → Project Settings                                                      |
| `NEXT_PUBLIC_POSTHOG_HOST`      | no       | PostHog ingestion host.                                                                                                                                                | PostHog dashboard → Project Settings                                                      |

## Install & Run

```bash
npm install
npx supabase link              # link this clone to the hosted project (once)
npx supabase db push --linked  # apply migrations from supabase/migrations/
npm run dev                    # start the Next.js app locally
```

## Everyday Checks

These four are exactly what CI runs on every PR to `main` and every push to `main`
([.github/workflows/ci.yml](.github/workflows/ci.yml)):

```bash
npm run lint
npm run typecheck
npm run format:check
npm run test
```

`npm run build` exists but is **not** in the workflow — run it locally when you want the
production compile checked.

**The `test` step passes on an empty suite, and there are no test files yet.** `npm run test`
is `vitest run --passWithNoTests`, so zero tests exit `0`. Until the first Vitest suite lands
the step gates nothing; the other three are the real signal. What that first suite must cover
is not negotiable — see [ENGINEERING-RULES.md](docs/ENGINEERING-RULES.md) §3.

There is no end-to-end suite: no `e2e/`, no `playwright.config.ts`, no `test:e2e`, by decision
([TECH-STACK.md](docs/TECH-STACK.md) §5). The automated WCAG 2.1 AA check PRD NFR-012 calls for
therefore has no runner — an open gap, not a delegated one.

Fonts are Archivo (all text) and IBM Plex Mono (tabular numerics only), self-hosted via
[`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) — no
external request, no layout shift. See [DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) §8.

## Claude Code Setup

Optional — skip it if you don't use Claude Code. The repo declares three shared plugins so
every developer gets the same UI/UX guidance instead of whatever they happen to have installed
locally.

**Nothing to run.** `.claude/settings.json` declares the marketplaces, enables all three, and
pins impeccable's context directory to `docs/` (`IMPECCABLE_CONTEXT_DIR`) so it reads
[PRODUCT.md](docs/PRODUCT.md) from there. Claude Code reads it on open and prompts you to trust
the workspace; accept, and the plugins install themselves.

| Plugin                                    | Job                                                    |
| ----------------------------------------- | ------------------------------------------------------ |
| `frontend-design@claude-plugins-official` | Optional taste input on a new screen. Picks no values. |
| `impeccable@impeccable`                   | **`shape` + audit only.** Never builds UI.             |
| `superpowers@claude-plugins-official`     | Process guidance. Not a design tool.                   |

Sources: [frontend-design](https://github.com/anthropics/claude-plugins-official) and
[superpowers](https://github.com/anthropics/claude-plugins-official) (Anthropic) ·
[impeccable](https://github.com/pbakaus/impeccable) (Apache 2.0)

**No plugin builds UI here — shadcn does.** This is a shadcn project ([components.json](components.json),
`shadcn@4`), and the primitives in `src/components/ui/` are shadcn components adapted to our
tokens. Reuse or extend one before running `npx shadcn@latest add`.

**[CLAUDE.md](CLAUDE.md) § "Building UI" is the authority on the order a UI change follows** —
when `/impeccable shape` is required, why `/impeccable craft` is banned, which work is exempt,
and how the design system, shadcn, and the audit sequence. That order is deliberately not
restated here; a second copy is a copy free to drift.

Three things to know before you install:

- **No plugin overrules this repo's design system.** [DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md)
  and the semantic tokens in `src/app/globals.css` win every time, and `eslint.config.mjs`
  rejects a hex literal or a raw Tailwind color class on sight. A suggestion that fails
  `npm run lint` was never a valid suggestion.
- **`npx shadcn add` output passes lint by construction.** shadcn names its tokens exactly as
  `globals.css` defines them (`background`, `card`, `primary`, `muted`, `border`, `ring`,
  `chart-1`–`5`, `sidebar-*`). Read the diff anyway — a hardcoded color in generated output is
  a bug, not a starting point.
- **Don't install the same tool twice.** All three come from the plugin system. If you
  previously installed one by hand (`npx impeccable skills install` or `claudekit`), delete the
  local copy so you aren't loading two versions of one skill.

You can also run the auditor outside Claude Code:

```bash
npx impeccable detect src/          # exit 0 = clean, exit 2 = findings
npx impeccable detect --json src/   # machine-readable, for CI
```

A source scan is **blind to contrast** — impeccable's contrast rules need two resolved colors
and our semantic tokens resolve at runtime, so `detect src/` skips the WCAG AA check rather
than passing it. CLAUDE.md § "Building UI" step 4 has what to run instead. If you ever
establish that a finding contradicts [DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md), suppress it with
`npx impeccable ignores add-rule <rule>` — never by changing a token.

Plugins install to `~/.claude/plugins/cache/`, outside the repo, so there is no local payload to
ignore — a `.claude/skills/` directory should not exist, and if one appears you hand-installed
something (see the bullet above) and it **will** be committed. There is no `.impeccable/`
directory in the repo today: `config.local.json` is gitignored as per-developer machine state,
and a `config.json` would be committed if a team-wide suppression is ever agreed.

You can also run the auditor outside Claude Code:

```bash
npx impeccable detect src/          # exit 0 = clean, exit 2 = findings
npx impeccable detect --json src/   # machine-readable, for CI
```

## Documentation Audit — `/doc-audit`

This repo is built against its docs: `CLAUDE.md` and `docs/` are loaded into Claude Code's context
and drive what gets written. A stale line there isn't a typo — it's a wrong instruction that ends
up in code. `/doc-audit` ([.claude/commands/doc-audit.md](.claude/commands/doc-audit.md)) reads the
whole doc corpus once and checks it three ways.

| Pass          | Question it answers                                                          | Run it as           |
| ------------- | ---------------------------------------------------------------------------- | ------------------- |
| **A. Align**  | Do terms, metrics, goals, and acceptance criteria cohere? What's missing?    | `/doc-audit align`  |
| **B. Drift**  | Do the docs contradict each other, or contradict the code?                   | `/doc-audit drift`  |
| **C. Absorb** | Is the same fact written twice? Which copy is better? Can a spec be deleted? | `/doc-audit absorb` |

**The letters are the run order.** `/doc-audit` with no argument runs all three, A → B → C, in one
report.

Start with `align` because it builds the terminology register — once concept names are settled, the
other two passes produce sharper findings. Run `drift` next, since it's the pass that catches
instructions that would produce wrong code. Save `absorb` for last: it's the only pass that proposes
deleting files, and it's the least useful while terms are still unsettled.

**When to run it:** after landing a spec, after applying a migration, after any `docs/` edit, and
before starting a feature that spans several docs. It's a read-heavy command — it's not a
pre-commit check.

Other arguments, combinable:

```bash
/doc-audit docs-only          # skip all code probes — fast, prose only
/doc-audit fix                # apply the Safe fix tier (README, dead links, stale dates)
/doc-audit align docs/PRD.md  # scope to one file
```

**What it will and won't change.** Fixes are split in two tiers:

- **Safe** — `README.md` wording, broken relative links, stale date stamps. Applied only when you
  pass `fix`. README owns no facts, so correcting it is transcription, not a decision.
- **Approval** — anything touching `docs/`, `CLAUDE.md`, or `.claude/settings.json`, every
  terminology rename, and **every Pass C finding**. These are shown as a diff and stop for your
  approval, even under `fix`. Editing a source-of-truth doc is a deliberate decision
  ([CLAUDE.md](CLAUDE.md), "Editing source-of-truth docs") — the audit proposes, you decide.

**Reading the output.** Each finding carries two ratings, because they're different questions:
`P0`–`P2` is correctness (would following this produce wrong code?) and `High`/`Medium`/`Low` is
product impact (what does it cost a user or an engineer?). A finding can be `P2 · High`.

## Project Structure

> This layout follows [ARCHITECTURE.md](docs/ARCHITECTURE.md) and
> [ENGINEERING-RULES.md](docs/ENGINEERING-RULES.md) §1, and every directory below exists today.
> [PROJECT-STRUCTURE.md](docs/PROJECT-STRUCTURE.md) §1 is the authoritative tree and marks the
> parts that are still unbuilt; this is the orientation copy.

```text
src/app/         Next.js App Router — routes, layouts, and route-private `_components/`
src/components/  Shared UI: `ui/` primitives and `layout/` app chrome
src/lib/         Framework-free modules: Supabase clients, config, validation, utils
supabase/        Supabase CLI migrations (migrations/*.sql) and Edge Functions (Intake Receiver, Ingestion Worker)
docs/            Source-of-truth documents (PRODUCT, PRD, ARCHITECTURE, TECH-STACK, ENGINEERING-RULES)
.github/         GitHub Actions CI workflows
.claude/         Claude Code settings, migration guard hook, and slash commands
CLAUDE.md        Claude Code rules — agent behavior, scope, escalation, and off-limits paths
```

The application lives under `src/`; the `@/*` TypeScript alias resolves to `./src/*`.

## Further Reading

The complete document set, listed in the order each derives from the one above it:

- [PRODUCT.md](docs/PRODUCT.md) — what we are building and why, problem statement, scope, success criteria
- [PRD.md](docs/PRD.md) — testable requirements and feature scope
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — system structure and design decisions
- [TECH-STACK.md](docs/TECH-STACK.md) — approved technologies and usage rules
- [ENGINEERING-RULES.md](docs/ENGINEERING-RULES.md) — coding conventions, banned patterns, testing
- Backlog / work items — tracked in the
  [Cueserve GitHub Project](https://github.com/orgs/Cueserve/projects/17), not in this repo.
- [CONTRIBUTING.md](CONTRIBUTING.md) — branching, commits, review flow, and run commands
- [CLAUDE.md](CLAUDE.md) — how Claude Code must behave in this repository

Every document names its own upstream and downstream files in its header (`Derived from:` /
`Downstream:`). Check those before changing one — this list is an index, not a dependency map.

## Open Decisions

One decision gates work here, and it is not a coding task:

- **Tenant provisioning is undecided and undesigned.** A new `auth.users` row gets no `profiles`
  row and nothing auto-creates a tenant. Self-serve vs. invited, and what happens to a new
  tenant's first user, are both open ([CLAUDE.md](CLAUDE.md) § Project state).

The Supabase plan question that used to sit beside it was settled on 2026-08-16: Cueserve stays
on the free tier, and the production project — with the Pro plan and Point-in-Time Recovery
NFR-010 requires — is created under the client's own account at cutover
([ENVIRONMENTS.md](docs/ENVIRONMENTS.md) §2).

The hosted development project **is** linked (`tdxojcqkiozmgjkrbypm`) and the brand palette **is**
ratified ([DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) §1) — both were open decisions here until
2026-08-12.

Product-level placeholders are tracked in [PRODUCT.md](docs/PRODUCT.md) §3A.

---

> _Last updated:_ 2026-08-15 · _Owner:_ Viral Parikh
