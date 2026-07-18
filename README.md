# CuevikSync

An AI-ready, multi-tenant platform that captures every inbound inquiry a small or
mid-sized business receives and moves it through a pipeline the team controls — from
first contact to a closed order — without a consultant or custom code. Phase 1 is a
thin-core release validated against Print & Signage operations.

## Project Overview

Small and mid-sized businesses lose revenue not from lack of demand but because
inquiries slip through the cracks across phone, email, web form, and walk-in — and
enterprise CRMs are too heavy, rigid, and expensive for a lean team to actually use.
CuevikSync is a single workspace where every inbound request lands in one shared queue,
becomes a tracked record, and moves through a configurable pipeline until it is won —
so no deal leaks or stalls. The Phase 1 thin-core release delivers omnichannel inquiry
capture and triage, unified contact/company management with duplicate detection,
adaptive pipelines, basic quotation, and configurable custom fields with role-based
access. A team of ten or fewer can be onboarded and running its live pipeline within
three days.

The system is a Next.js modular monolith on Supabase, with the inbound-capture path
deliberately split into two isolated runtime roles so a lead is never dropped even when
the main application is degraded. See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for the
full design.

## Key Concepts

- **Inquiry** — an inbound request at intake/triage, before qualification (informal:
  "lead"). Capturing every inquiry with zero leaks is the one failure the product exists
  to prevent.
- **Opportunity** — a qualified inquiry in the pipeline, with a stage, owner, next
  action, and expected value/date (informal: "deal").
- **Zero-leak capture** — the defining flow: a public Intake Receiver persists each raw
  web-form submission to a durable queue *before* any processing (persist-before-process),
  and a scheduled Ingestion Worker later transforms it into an Inquiry, retrying on
  failure so nothing is silently dropped.
- **Tenant isolation via RLS** — every authenticated request carries the caller's
  Supabase JSON Web Token (JWT) to Postgres, where Row-Level Security (RLS) filters every
  row by `tenant_id`. The database — not application code — is the enforcement locus, so a
  forgotten filter fails closed (zero rows) rather than leaking across tenants.
- **Configuration is data, not code** — pipelines, stages, custom fields, and the catalog
  are read from tenant configuration at runtime; changing them takes effect with no deploy.

## Prerequisites

> **Pending scaffold — unverified.** The application has not been scaffolded in this
> repository yet (no `package.json`, `.env.example`, or `supabase/` directory exists on
> `main` at the time of writing). The versions below are the approved stack from
> [TECH-STACK.md](docs/TECH-STACK.md); the exact prerequisite list will be confirmed and
> tested against the real scaffold before this section is treated as final.

- Node.js 22 LTS or higher
- npm (bundled with Node.js 22 LTS) — the only approved package manager; do not use pnpm or yarn
- Supabase CLI (latest) — for the local dev stack, migrations, and Edge Function deploys
- Git
- A Supabase account and project (Postgres 17, with the `pgmq` and `pg_cron` extensions enabled)
- A Vercel account (hosts the Next.js app)
- Optional accounts, only if the corresponding feature is enabled: Resend (quote-email
  delivery), Sentry (error tracking), PostHog (product analytics)

## Environment Setup

> **Pending scaffold — unverified.** No `.env.example` exists in the repository yet. The
> keys below are derived from [TECH-STACK.md](docs/TECH-STACK.md) §6 and record the
> variables the app is designed to read. The authoritative `.env.example` will be added
> with the application scaffold, and this table reconciled against it — no undocumented
> keys. The commands here have not been run against a real scaffold.

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
> executed against a real scaffold and will be tested and corrected when the application
> is scaffolded.

```bash
npm install
supabase start        # local Supabase stack (Postgres, Auth, Edge Functions)
supabase db push      # apply migrations from supabase/migrations/
npm run dev           # start the Next.js app locally
```

## Run Tests

> **Pending scaffold — unverified.** Test scripts do not exist yet. The frameworks below
> are fixed by [TECH-STACK.md](docs/TECH-STACK.md) (Vitest for unit tests; Playwright for
> end-to-end and the automated WCAG 2.1 AA check); exact script names will be confirmed
> with the scaffold.

```bash
npm run test          # Vitest unit tests (the blocking CI gate, with lint + tsc --noEmit)
npm run test:e2e      # Playwright end-to-end + WCAG 2.1 AA check (advisory / nightly)
```

## Project Structure

> The application directories (`app/`, `supabase/`) are the intended layout from
> [ARCHITECTURE.md](docs/ARCHITECTURE.md) and [AI-TOOL-GUIDE.md](docs/AI-TOOL-GUIDE.md)
> §2; they are created with the application scaffold. `docs/`, `.github/`, and `.claude/`
> exist today.

```text
app/         Next.js App Router application — SPA client, server JSON API, and domain modules
supabase/    Supabase CLI migrations (migrations/*.sql) and Edge Functions (Intake Receiver, Ingestion Worker)
docs/        Source-of-truth documents (PRODUCT, PRD, ARCHITECTURE, TECH-STACK, AI-TOOL-GUIDE, BACKLOG)
.github/     GitHub Actions CI workflows and Copilot instructions
.claude/     Claude Code project configuration and rules
```

## Further Reading

- [PRD.md](docs/PRD.md) — requirements and feature scope
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — system structure and design decisions
- [TECH-STACK.md](docs/TECH-STACK.md) — approved technologies and usage rules
- [AI-TOOL-GUIDE.md](docs/AI-TOOL-GUIDE.md) — rules and constraints for AI tools

---

> _Last updated:_ 2026-07-18 · _Maintainer:_ Cuevik team
