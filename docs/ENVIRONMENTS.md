# ENVIRONMENTS.md — Where the Database Runs

**Owner:** Viral Parikh
**Last updated:** 2026-08-11
**Source of truth for:** which Supabase environment development runs against, the working
rules that follow from that, and the plan for adopting the local Docker stack.

> Derived from: docs/TECH-STACK.md, docs/ARCHITECTURE.md
> Downstream: README.md (Prerequisites, Install & Run), docs/ENGINEERING-RULES.md §3

---

## Contents

- [1. Current State — Nothing Provisioned Yet](#1-current-state-nothing-provisioned-yet)
- [2. Plans & Cost](#2-plans-cost)
- [3. Working Rules](#3-working-rules)
- [4. Plan: Adopting the Local Docker Stack](#4-plan-adopting-the-local-docker-stack)
- [5. Production Onboarding](#5-production-onboarding--the-day-a-prod-project-exists)
- [6. Keeping This File Honest](#6-keeping-this-file-honest)

> **Section structure matches `RedyQuote:docs/ENVIRONMENTS.md` deliberately** — same file, same
> path, same six sections, so a developer moving between the repos finds the same information
> in the same place. **§1's content genuinely differs**, and that difference is a real
> engineering divergence, not drift: CuevikSync's mandatory tenant-isolation and
> worker-idempotency tests (docs/ENGINEERING-RULES.md §3) are destructive, so they require a
> disposable local stack. RedyQuote has no such requirement and runs hosted-only.

## 1. Current State

**The hosted development project exists and is linked** (project ref `tdxojcqkiozmgjkrbypm`,
confirmed 2026-08-12). Two migrations are applied — see CLAUDE.md § Project state for exactly
what they created. The local test stack is not set up **on the developer machine**; nothing there
needs it yet, since no test suite exists (docs/TECH-STACK.md §5). It does run in CI — see
"The local stack in CI" below.

CuevikSync uses **two** Supabase environments. They are not interchangeable.

| Environment     | What it is                                         | Used for                                       | Reset available                                                                           |
| --------------- | -------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Development** | A linked hosted Supabase project (`supabase link`) | All day-to-day development                     | **No.** A bad migration is repaired by a new migration, never by editing the applied one. |
| **Test / CI**   | The local stack (`supabase start`, Docker)         | Vitest, the GitHub Actions job, and future E2E | Yes — CI resets freely.                                                                   |

|                        | Intended                                                                        | Today                                                    |
| ---------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Dev database           | Hosted Supabase project                                                         | **Exists** — `tdxojcqkiozmgjkrbypm`                      |
| Local stack            | `npx supabase start` — tests and CI only, never for dev work                    | **Runs in CI, not on the developer machine** — see below |
| Migrations applied via | `npx supabase db push --linked` against the linked remote                       | `0001`, `0002` applied. See CLAUDE.md for content.       |
| Types generated via    | `npx supabase gen types typescript --linked`                                    | Real, generated `types.ts`                               |
| Prerequisite           | A Supabase account and project — **required to start**, not just at deploy time | Done                                                     |

### The local stack in CI

[.github/workflows/db-replay.yml](../.github/workflows/db-replay.yml) starts a local Postgres on
a GitHub runner and replays every migration from empty on each pull request that touches
`supabase/migrations/`, failing hard when the chain does not build. A runner has the Docker
daemon the Windows development machine does not, which is the whole reason it lives there.

**It closes one specific gap.** Migrations apply only after they merge (see Migration ordering
below), and a merged migration is immutable — so before this workflow, the first time a migration
met a real Postgres was after it could no longer be corrected in place. That gap was structural,
not accidental.

**It is not the local stack, and it does not postpone §4.** It validates that the chain builds.
It cannot let anyone iterate, and it runs as the superuser, so it asserts nothing about RLS,
`is_admin()`, or the guards in `0002`. The mandatory tenant-isolation and worker-idempotency
cases in docs/ENGINEERING-RULES.md §3 still need the stack in §4.

**Why the split.** The mandatory test cases in docs/ENGINEERING-RULES.md §3 — cross-tenant
read/write rejection and worker idempotency across redelivery — are destructive by construction.
They cannot run against the hosted development project, because there is no `db reset` there to
recover with. That is the whole reason a local stack is required here and is not in RedyQuote.

**Accepted risk:** tests prove behaviour on the local stack while `pgmq` and `pg_cron` run in
production on the hosted one. Revisit once the capture path is implemented.

## 2. Plans & Cost

**The project exists (linked 2026-08-12); which plan it's on is not recorded here.** Check the
Supabase dashboard before assuming either way. The constraint that decides which plan is
required is already fixed by NFR-010 and recorded in docs/TECH-STACK.md §7:

| Plan            | Price                         | Decision                                                                                                                                                                                                              |
| --------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Free**        | $0                            | Viable only before real data exists. Pauses after **1 week of inactivity**; limit of 2 active free projects per org. **No automated backups at all.**                                                                 |
| **Pro**         | $25/mo                        | Minimum for anything holding real tenant data. Daily backups, 7-day retention; removes auto-pause.                                                                                                                    |
| **PITR add-on** | +$100/mo per 7 days retention | **Required on the production project** — NFR-010 sets Recovery Point Objective ≤ 24 hours, and docs/TECH-STACK.md §7 states default daily backups MAY NOT meet it. **Cueserve does not own that project.** See below. |

### Who pays, and when — decided 2026-08-16

**Cueserve stays on the free tier of everything, for the whole of development.** Supabase and
Vercel both. There is no plan to buy Pro, PITR, database branching, or a paid Vercel plan, and
a proposal that assumes one is not a proposal for this project.

**The production project is never Cueserve's.** At production cutover the Supabase project and
the Vercel project are created under **the client's own account and ownership**, and everything
NFR-010 requires — Pro, PITR, a ≤24-hour Recovery Point Objective — is met there, on the
client's billing relationship. This is what resolves the contradiction this section used to
record: the durability requirement was never in conflict with the budget, because the two sit in
different accounts. NFR-010 is unchanged and remains binding on whoever runs production.

**So the real exposure is UAT, not production.** The window that matters is the one where a
client is exercising the app against a Cueserve-owned free project and generating data they
care about, before the transfer. Free has **no automated backups at all**, so during that window
the only recovery mechanism is the one you run yourself:

```bash
npx supabase db dump --linked -f backup-$(date +%Y%m%d).sql   # before destructive migrations
```

**Before UAT starts, that dump stops being a manual habit and becomes a scheduled job.** It is
the only thing standing between a client's UAT data and permanent loss. Nothing automates it
today.

**Two free-tier limits to plan around rather than discover:**

- **2 active free projects per org.** CuevikSync dev and RedyQuote dev already hold both slots.
  A third free project does not fit unless it lives in a different organisation.
- **A free project pauses after one week idle.** The first request after that fails until
  someone resumes it in the dashboard. Under a client-owned production project this stops being
  a concern; during UAT it is a real interruption.

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

**Step 4 already runs in CI, and `0001`–`0002` pass it** (§1, "The local stack in CI"). The
friction predicted above has not materialised, which is worth knowing: it means a future red is a
real defect rather than a backlog of known breakage, and step 4 will not be where this plan
stalls. Steps 5 through 7 still need a stack you can iterate on.

**Rollback:** `npx supabase stop` and restore the remote values in `.env.local`. Nothing in the
application code is environment-specific — the Supabase client reads URL and key from env
(`src/lib/config.ts`), so switching is a `.env.local` edit and a dev-server restart.

## 5. Production Onboarding — the day a prod project exists

**Nothing here has happened yet; there is no production project.** This is the checklist for
creating one, and it changed on 2026-08-16 when §2 settled who owns it.

**The operating model — ownership and operation are deliberately split.** The production
Supabase project and the production Vercel project are created **under the client's own account
and ownership**: they hold billing, and NFR-010's Pro + Point-in-Time Recovery obligation is met
there. **Cueserve operates that project** — invited into the client's Supabase organisation, and
running `/db-migrate prod` from a Cueserve machine. Development stays on Cueserve's own
free-tier project, which Cueserve owns outright.

**State the cost of that split before committing to it.** Cueserve ends up holding a credential
with standing access to a client's live system, and the client's production migration state
lands in Cueserve's GitHub Actions logs (step 4). That is a term of the engagement, not a side
effect of a commit. Agree it with the client in writing before step 3, and record the exit in
step 8.

| #   | Step                                                                                     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The client creates the project **in their own organisation**                             | Pro plan on their billing, with the PITR add-on enabled — NFR-010 sets Recovery Point Objective ≤ 24 hours and docs/TECH-STACK.md §7 states default daily backups alone MAY NOT meet it. §2's 2-active-free-projects limit does not apply here; this is not a free project and not in Cueserve's organisation.                                                                                                                                             |
| 2   | Cueserve is invited to that organisation at **the least role that can apply migrations** | Do not accept Owner for convenience. The grant must be revocable by the client without anyone touching this repository.                                                                                                                                                                                                                                                                                                                                    |
| 3   | Add the prod ref to `supabase/.project-refs.json` with `"label": "prod"`                 | **This is the only thing that makes prod reachable.** A ref absent from that file aborts `/db-migrate` Phase 0 — fail closed, never an assumed dev.                                                                                                                                                                                                                                                                                                        |
| 4   | **Know what step 3 also does**                                                           | `db-drift.yml`'s `discover` job builds its matrix from that same file. From that commit onward, every manual dispatch and every migration merge runs `db push --dry-run --linked` against the **client's production database**, and the pending-migration list appears in Cueserve's Actions logs. Read-only by construction, and that workflow's header forbids it ever gaining a write — but confirm the client accepts it before the commit, not after. |
| 5   | `SUPABASE_ACCESS_TOKEN` needs no change, **and that is the thing to notice**             | It is a Cueserve user token. Once you are a member of the client's organisation the same token reaches both projects; there is no per-project token. The secret's blast radius now includes client production — rotate it on any suspicion, and whenever anyone who has seen it leaves.                                                                                                                                                                    |
| 6   | `SUPABASE_DB_PASSWORD_PROD` **only if the token path is refused**                        | The `_PROD` suffix matches the `label`, upper-cased by the `discover` job. Every connection so far has succeeded on the access token alone — the CLI prints `Initialising login role...` and mints temporary Postgres access. No workflow edit either way.                                                                                                                                                                                                 |
| 7   | First apply: `/db-migrate prod`                                                          | `prod` is never the default — a prod-labelled ref without the argument aborts. Phase 3 escalates: a full dump **and** a data-only dump, both verified non-empty, abort if either fails, and the ref typed back rather than a plain yes.                                                                                                                                                                                                                    |
| 8   | **Write down the revocation path**                                                       | What Cueserve loses access to, how, and who executes it when the engagement ends. An access grant with no documented exit is the one that outlives the contract.                                                                                                                                                                                                                                                                                           |

**Re-read `/db-migrate`'s "Never" list against the prod context before the first run.** It was
written against a development project holding no real rows.

**Two rules from §3 get sharper here, not softer.** Rule 1 — never point a development branch at
the production project — now also means never pointing it at a database Cueserve does not own.
Rule 4 — schema changes are migrations, never dashboard edits — matters more on a client's
production database than anywhere else, because a dashboard edit there is both unreviewable and
unrepeatable.

## 6. Keeping This File Honest

- **§1 says nothing is provisioned. The moment a Supabase project is created, rewrite it.** A
  file that describes a non-existent environment as though it were running is the failure mode
  this section exists to prevent.
- **§5 is written entirely in the future tense and must be rewritten the day it is executed.** A
  prod-onboarding checklist that still reads as a plan after the project exists is the same
  failure mode as the bullet above.
- **§2's plan question was settled on 2026-08-16 and is no longer a live contradiction.** Free
  tier for everything Cueserve owns; the production project is created under the client's
  account, and NFR-010's Pro + PITR obligation is met there. If that model ever changes — if
  Cueserve ends up owning a production project — §2 is wrong again and this becomes the most
  urgent line in the file.
- The project names in §1 (`cueviksync-dev`, and a future `cueviksync-prod`) are an intended
  end state. Spelling is `cueviksync` — an infrastructure name with a typo survives into
  connection strings, CI secrets, and runbooks.
- Editing this file is a deliberate decision, like any `docs/` change (CLAUDE.md).
