# CuevikSync

> An AI-powered platform that helps small and mid-sized businesses capture every inbound inquiry and turn it into revenue.

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22_LTS-339933.svg)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Platform-3ecf8e.svg)](https://supabase.com/)

## Project Overview

CuevikSync gives you one workspace to capture every inbound inquiry — phone, email,
web form, or walk-in — into a single shared queue. Each inquiry moves through a
configurable pipeline until it is won, so no deal leaks or stalls.

The _**Phase-01 (Thin-Core release)**_ covers omnichannel capture and triage, unified
contact/company management, adaptive pipelines, basic quotation, and role-based custom
fields. See [PRODUCT.md](docs/PRODUCT.md) for the full product concept and scope.

Under the hood, CuevikSync is a Next.js modular monolith backed by Supabase (Postgres,
Auth, and Edge Functions). The inbound-capture path is split into two isolated runtime
roles, so a lead is never dropped even when the main app is degraded — see
[ARCHITECTURE.md](docs/ARCHITECTURE.md).

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

> **Pending scaffold — unverified.** The app is not scaffolded in this repository yet —
> no `package.json`, `.env.example`, or `supabase/` directory exists on `main`. The
> versions below are the approved stack from [TECH-STACK.md](docs/TECH-STACK.md). The
> exact list will be confirmed and tested once we scaffold the app.

- Node.js 22 LTS or higher
- npm (bundled with Node.js 22 LTS) — the only approved package manager; do not use pnpm or yarn
- Supabase CLI (latest) — links this clone to the hosted project, applies migrations, deploys
  Edge Functions, and runs the local test stack
- Docker — required only to run the test suite (`npx supabase start`); not needed for development
- Git
- A Supabase account and project (Postgres 17, with the `pgmq` and `pg_cron` extensions enabled)
  — this is your **development** database, not just a deploy target
- A Vercel account (hosts the Next.js app)
- Optional accounts, only if the corresponding feature is enabled: Resend (quote-email
  delivery), Sentry (error tracking), PostHog (product analytics)

## Environment Setup

> **Pending scaffold — unverified.** No `.env.example` exists in the repository yet. The
> keys below come from [TECH-STACK.md](docs/TECH-STACK.md) §6. The real `.env.example`
> will be added when we scaffold the app, and this table reconciled against it — no
> undocumented keys. The commands here have not been run yet.

```bash
cp .env.example .env
```

Then fill each value. Secrets MUST NOT be committed. Server-only secrets MUST NOT carry
the `NEXT_PUBLIC_` prefix (that prefix inlines a value into the client bundle) — only the
Supabase URL and anon key may be public.

| Variable | Required | Description | Where to obtain |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL; safe to expose to the browser. | Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anonymous (public) key for user-scoped, RLS-enforced client access. | Supabase dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Server-only key for the three system paths (Intake Receiver, Ingestion Worker, provisioning). Bypasses RLS — never expose to the browser, never prefix `NEXT_PUBLIC_`. | Supabase dashboard → Project Settings → API (shared via the Cuevik team, never committed) |
| `SUPABASE_DB_URL` | yes | Direct Postgres connection for Supabase CLI migrations. MUST use Supavisor transaction mode (port 6543) with `prepare: false`. | Supabase dashboard → Project Settings → Database (Connection pooling) |
| `INTAKE_KEY_SECRET` | yes | Server-side secret backing per-tenant intake-key resolution at the public Intake Receiver. | Cuevik team (shared secret) |
| `RESEND_API_KEY` | no | Resend API key for optional outbound quote-document email. Omit to disable email delivery. | Resend dashboard → API Keys |
| `SENTRY_DSN` | no | Sentry Data Source Name for server-side error tracking. | Sentry dashboard → Project Settings → Client Keys (DSN) |
| `NEXT_PUBLIC_SENTRY_DSN` | no | Sentry DSN for the browser client. | Sentry dashboard → Project Settings → Client Keys (DSN) |
| `NEXT_PUBLIC_POSTHOG_KEY` | no | PostHog project API key for product analytics (onboarding funnel, session replay). | PostHog dashboard → Project Settings |
| `NEXT_PUBLIC_POSTHOG_HOST` | no | PostHog ingestion host. | PostHog dashboard → Project Settings |

## Install & Run

> **Pending scaffold — unverified.** These commands assume the standard Next.js 16 + npm
> and Supabase CLI setup from [TECH-STACK.md](docs/TECH-STACK.md). They have **not** been
> run yet, and will be tested and corrected when we scaffold the app.

```bash
npm install
npx supabase link              # link this clone to the hosted project (once)
npx supabase db push --linked  # apply migrations from supabase/migrations/
npm run dev                    # start the Next.js app locally
```

## Run Tests

> **Pending scaffold — unverified.** Test scripts do not exist yet. The frameworks below
> are fixed by [TECH-STACK.md](docs/TECH-STACK.md): Vitest for unit tests, and Playwright
> for end-to-end and the automated WCAG 2.1 AA check. Exact script names will be confirmed
> when we scaffold the app.

```bash
npm run test          # Vitest unit tests (the blocking CI gate, with lint + tsc --noEmit)
npm run test:e2e      # Playwright end-to-end + WCAG 2.1 AA check (advisory / nightly)
```

## Project Structure

> The app directories (`app/`, `supabase/`) and `.github/` are the intended layout from
> [ARCHITECTURE.md](docs/ARCHITECTURE.md) and [ENGINEERING-RULES.md](docs/ENGINEERING-RULES.md)
> §1. They are created when we scaffold the app. `docs/`, `.claude/`, and `CLAUDE.md` exist today.

```text
app/         Next.js App Router application — SPA client, server JSON API, and domain modules
supabase/    Supabase CLI migrations (migrations/*.sql) and Edge Functions (Intake Receiver, Ingestion Worker)
docs/        Source-of-truth documents (PRODUCT, PRD, ARCHITECTURE, TECH-STACK, ENGINEERING-RULES, BACKLOG)
.github/     GitHub Actions CI workflows
.claude/     Claude Code settings, migration guard hook, and slash commands
CLAUDE.md    Claude Code rules — agent behavior, scope, escalation, and off-limits paths
```

## Further Reading

The complete document set, listed in the order each derives from the one above it:

- [PRODUCT.md](docs/PRODUCT.md) — what we are building and why
- [PRD.md](docs/PRD.md) — testable requirements and feature scope
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — system structure and design decisions
- [TECH-STACK.md](docs/TECH-STACK.md) — approved technologies and usage rules
- [ENGINEERING-RULES.md](docs/ENGINEERING-RULES.md) — coding conventions, banned patterns, testing
- [BACKLOG.md](docs/BACKLOG.md) — epics and stories manifest
- [CONTRIBUTING.md](CONTRIBUTING.md) — branching, commits, review flow, and run commands
- [CLAUDE.md](CLAUDE.md) — how Claude Code must behave in this repository

Every document names its own upstream and downstream files in its header (`Derived from:` /
`Downstream:`). Check those before changing one — this list is an index, not a dependency map.

---

> _Last updated:_ 2026-07-18 · _Maintainer:_ Cuevik team
