# ENVIRONMENTS.md — Where the Database Runs

**Owner:** Viral Parikh
**Last updated:** 2026-08-11
**Source of truth for:** which Supabase environment development runs against, the working
rules that follow from that, and the plan for adopting the local Docker stack.

> Derived from: docs/TECH-STACK.md, docs/ARCHITECTURE.md
> Downstream: README.md (Prerequisites, Install & Run), docs/ENGINEERING-RULES.md §3

---

> **Section structure matches `RedyQuote:docs/ENVIRONMENTS.md` deliberately** — same file, same
> path, same five sections, so a developer moving between the repos finds the same information
> in the same place. **§1's content genuinely differs**, and that difference is a real
> engineering divergence, not drift: CuevikSync's mandatory tenant-isolation and
> worker-idempotency tests (docs/ENGINEERING-RULES.md §3) are destructive, so they require a
> disposable local stack. RedyQuote has no such requirement and runs hosted-only.

## 1. Current State — Nothing Provisioned Yet

**Neither environment exists today.** The app is not scaffolded, and **no Supabase project has
been created or linked** (confirmed 2026-08-11). Everything below is the intended end state.
Do not read this file as a description of what is running.

CuevikSync uses **two** Supabase environments. They are not interchangeable.

| Environment     | What it is                                         | Used for                                       | Reset available                                                                           |
| --------------- | -------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Development** | A linked hosted Supabase project (`supabase link`) | All day-to-day development                     | **No.** A bad migration is repaired by a new migration, never by editing the applied one. |
| **Test / CI**   | The local stack (`supabase start`, Docker)         | Vitest, the GitHub Actions job, and future E2E | Yes — CI resets freely.                                                                   |

|                        | Intended                                                                        | Today                  |
| ---------------------- | ------------------------------------------------------------------------------- | ---------------------- |
| Dev database           | Hosted Supabase project, `cueviksync-dev`                                       | **Does not exist**     |
| Local stack            | `npx supabase start` — tests and CI only, never for dev work                    | **Not set up**         |
| Migrations applied via | `npx supabase db push --linked` against the linked remote                       | No migrations authored |
| Types generated via    | `npx supabase gen types typescript --linked`                                    | Placeholder `types.ts` |
| Prerequisite           | A Supabase account and project — **required to start**, not just at deploy time | Not created            |

**Why the split.** The mandatory test cases in docs/ENGINEERING-RULES.md §3 — cross-tenant
read/write rejection and worker idempotency across redelivery — are destructive by construction.
They cannot run against the hosted development project, because there is no `db reset` there to
recover with. That is the whole reason a local stack is required here and is not in RedyQuote.

**Accepted risk:** tests prove behaviour on the local stack while `pgmq` and `pg_cron` run in
production on the hosted one. Revisit once the capture path is implemented.

## 2. Plans & Cost

**No plan is selected, because no project exists.** The constraint is already fixed by
NFR-010 and recorded in docs/TECH-STACK.md §7:

| Plan            | Price                         | Decision                                                                                                                                              |
| --------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Free**        | $0                            | Viable only before real data exists. Pauses after **1 week of inactivity**; limit of 2 active free projects per org. **No automated backups at all.** |
| **Pro**         | $25/mo                        | Minimum for anything holding real tenant data. Daily backups, 7-day retention; removes auto-pause.                                                    |
| **PITR add-on** | +$100/mo per 7 days retention | **Required, not optional.** NFR-010 sets Recovery Point Objective ≤ 24 hours, and docs/TECH-STACK.md §7 states default daily backups MAY NOT meet it. |

**This is a budget commitment that has not been made.** Pro + PITR is ~$125/mo per environment
before the first customer. NFR-010 mandates it; nobody has approved the spend. Settle this
before creating the production project, not after — the alternative is discovering at cutover
that the durability requirement and the budget disagree.

While on Free with seed data only, the sole recovery mechanism is the one you run yourself:

```bash
npx supabase db dump --linked -f backup-$(date +%Y%m%d).sql   # before destructive migrations
```

## 3. Working Rules

1. **Never point a development branch at the production project.** Vercel preview deployments
   MUST NOT connect to the production Supabase project (docs/TECH-STACK.md §7); previews use a
   separate project or a database branch. Production credentials never reach a preview.
2. **The hosted development project has no reset.** A bad migration is repaired by a new
   migration. Editing an applied one is silently skipped on the next `db push` — see
   Migration ordering below.
3. **Destructive tests run locally only.** The mandatory cases in docs/ENGINEERING-RULES.md §3
   run against `npx supabase start`, never against the linked hosted project.
4. **Schema changes are migrations, never dashboard edits.** Tables, indexes, RLS policies,
   extension enablement, and history tables are all authored as
   `supabase/migrations/*.sql` (docs/TECH-STACK.md §7).
5. **Regenerate types after every applied migration.** `npm run db:types`. There is no ORM; the
   generated types are the type-safety path.
6. **A Free project pauses after a week idle.** The first request after that fails until you
   resume it in the dashboard. That is the plan working as designed, not a bug to debug.

### Migration ordering

Migrations are applied **after** a change merges to `main`, never before:

1. Author the migration on a branch and open the PR.
2. Merge to `main`.
3. From an up-to-date `main`, run `/db-migrate`, then regenerate types.

A migration present on `main` is therefore **already applied and immutable**. This is enforced
mechanically by `.claude/hooks/block-applied-migration.mjs`, which refuses edits to any
migration file present in `origin/main` or local `main`. Run `git fetch` before editing a
migration — a stale `origin/main` is the guard's one false-allow.

### Required configuration

The app and the capture path require these before `npm run dev`:

- Supabase project URL and keys — the **service-role key is server-side only** and MUST NOT be
  exposed to the browser, and MUST NOT carry the `NEXT_PUBLIC_` prefix.
- `pgmq` and `pg_cron` extensions enabled on the Supabase Postgres instance.
- Resend, Sentry, and PostHog keys — optional; required only for the features they back.

Concrete variable names are in `.env.example` and the README's Environment Setup table.

## 4. Plan: Adopting the Local Docker Stack

**Trigger:** the first test that touches the database. Under docs/ENGINEERING-RULES.md §3 that
is not optional work — tenant isolation and worker idempotency are mandatory coverage, and
neither can run without it.

### Prerequisites

- Docker Desktop for Windows (WSL2 backend), ~4 GB RAM free
- Ports 54321–54324 unused (`supabase start` binds API, DB, Studio, Inbucket)

### Steps

| #   | Step                                             | Command / Action                                                                                                                                      |
| --- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Install Docker Desktop, confirm the daemon runs  | `docker info` returns a server version                                                                                                                |
| 2   | Start the local stack                            | `npx supabase start` — prints the local API URL, anon key, and DB URL                                                                                 |
| 3   | Point the app at local                           | Set the Supabase URL/anon key in `.env.local` to the values step 2 printed; keep the remote values in a commented block                               |
| 4   | **Replay every migration from empty**            | `npx supabase db reset` — proves the migration chain builds a correct schema from scratch, which `db push` against a long-lived remote never verifies |
| 5   | Regenerate types from local                      | `npx supabase gen types typescript --local > src/lib/supabase/types.ts`                                                                               |
| 6   | Confirm `pgmq` and `pg_cron` are enabled locally | Both are extension enablements in `0001`; `db reset` should bring them up with the schema                                                             |
| 7   | Verify the app end to end                        | `npm run dev`, sign in, capture → triage → qualify an inquiry                                                                                         |
| 8   | Update the docs in the same change               | This file's §1, README Prerequisites + Install & Run, and TECH-STACK §7 if the workflow changes                                                       |

**Expected friction at step 4.** If `db reset` fails while the remote works, the migration chain
is not replayable — usually a migration that assumed state created by hand, or ordering that only
worked incrementally. Fixing that is the point of adopting local, not a setback.

**Rollback:** `npx supabase stop` and restore the remote values in `.env.local`. Nothing in the
application code is environment-specific — the Supabase client reads URL and key from env
(`src/lib/config.ts`), so switching is a `.env.local` edit and a dev-server restart.

## 5. Keeping This File Honest

- **§1 says nothing is provisioned. The moment a Supabase project is created, rewrite it.** A
  file that describes a non-existent environment as though it were running is the failure mode
  this section exists to prevent.
- **§2's PITR spend is an unapproved commitment.** NFR-010 mandates it; the budget has not
  agreed to it. That contradiction is live until someone resolves it.
- The project names in §1 (`cueviksync-dev`, and a future `cueviksync-prod`) are an intended
  end state. Spelling is `cueviksync` — an infrastructure name with a typo survives into
  connection strings, CI secrets, and runbooks.
- Editing this file is a deliberate decision, like any `docs/` change (CLAUDE.md).
