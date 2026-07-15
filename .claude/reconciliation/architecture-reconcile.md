# Reconciliation: ARCHITECTURE.md — 2026-07-14

**Change summary:** Pinned the architecture to Supabase — Supabase Auth (GoTrue, JWT) for authentication, Postgres RLS as the tenant/ownership enforcement locus for authenticated user paths (service-role confined to Receiver/Worker/provisioning), Intake Receiver as a Supabase Edge Function, and pgmq (Supabase Queues) + pg_cron/Edge consumer for the intake buffer/worker.
**Branch:** docs/update/architecture
**PR/MR:** <link once opened>

## Downstream checklist

- [ ] `TECH-STACK.md` — required-update: ARCHITECTURE.md now names concrete products (Supabase Auth/GoTrue, Supabase Edge Functions, pgmq, pg_cron, Supabase Postgres, Next.js). TECH-STACK.md must formally record these with versions, config, and usage rules — including RLS policy conventions, bcrypt ≥12 for NFR-007, and pgmq visibility-timeout/dead-letter settings. Currently `Planned`.
      Next action: these decisions feed Step-05 directly when TECH-STACK.md is generated; if it already exists, run `/proj-init-doc-update TECH-STACK.md`.
- [ ] `AI-TOOL-GUIDE.md` — required-update: New non-negotiable constraints for AI tools — never use the Supabase service-role on authenticated user-request paths; tenant scope is enforced by RLS via the caller's JWT; service-role is limited to the Receiver, Worker, and provisioning, which must re-scope from a server-resolved `tenant_id`. Currently `Planned`.
      Next action: these constraints feed Step-06 directly when AI-TOOL-GUIDE.md is generated; if it already exists, run `/proj-init-doc-update AI-TOOL-GUIDE.md`.

## Completed
<!-- Move items here once resolved -->
