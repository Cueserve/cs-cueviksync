# CLAUDE.md — CuevikSync

Claude Code reads this file automatically from the repo root. Claude Code is the **only** AI
coding tool used on this project, and this file is the authority on how it must behave here.

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
5. `README.md` and `docs/BACKLOG.md` — they restate, they own nothing.

## Scope boundaries

**In bounds** without asking: implementing PRD-traced features inside an existing domain module,
writing Vitest/Playwright tests, adding Zod schemas, wiring API route handlers behind the
existing authorization path, and building SPA screens with shadcn/ui + Tailwind.

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

## Claude Code specifics

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
- **Repository state.** The app is not scaffolded — there is no `package.json`, `app/`, or
  `supabase/` on `main`. Do not assume a command, script, or path exists; check first, and say so
  plainly when something is missing rather than inventing a plausible substitute.

## When blocked

Stop and say so. Do not guess, do not proceed on an assumption, and do not silently narrow the
task. Name what is ambiguous, state the options, and wait.
