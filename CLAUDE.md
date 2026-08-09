# CLAUDE.md — CuevikSync

Claude Code reads this file automatically from the repo root. Claude Code is the **only** AI
coding tool used on this project.

## Project rules

@docs/AI-TOOL-GUIDE.md

The line above **imports** the project's engineering rules into every session — coding
conventions, scope boundaries, banned patterns, testing rules, decision escalation, agent
behavior, off-limits files, and workflow. They are not restated here. If a rule changes, edit
`docs/AI-TOOL-GUIDE.md`; never add a competing copy to this file.

[`CONTRIBUTING.md`](CONTRIBUTING.md) is the governance authority — branching, commit
convention, review flow, the self-review gate, and the only approved list of run commands.

## Authority order

When two sources disagree, the higher one wins:

1. The filesystem and `git` — a document claiming a file exists loses to `ls`.
2. `CONTRIBUTING.md` for anything about process or commands.
3. `docs/` by lineage: PRODUCT → PRD → ARCHITECTURE → TECH-STACK → AI-TOOL-GUIDE. Each
   document's header names its own `Derived from:` / `Downstream:` files.
4. This file, for the Claude-Code-specific rules below that it owns.
5. `README.md` and `docs/BACKLOG.md` — they restate, they own nothing.

## Claude Code specifics

- **Read before proposing.** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and
  [`docs/TECH-STACK.md`](docs/TECH-STACK.md) are the authority on structure and stack. Read
  the relevant one first — never derive an architecture or stack decision from memory or from
  what a similar project does.
- **Commands.** Run only what the `CONTRIBUTING.md` Tooling layer defines. Do not invent an
  `npm` script, and do not introduce a tool absent from `docs/TECH-STACK.md`.
- **Slash commands.**
  - `/db-migrate` — applies pending Supabase migrations to the linked hosted project, then
    regenerates types and verifies.
  - `/doc-audit` — audits the documentation set for drift, gaps, and duplication.
- **Migration guard.** `.claude/hooks/block-applied-migration.mjs` denies edits to any
  migration file already present in `origin/main`, because merged means applied to the hosted
  project and applied migrations are immutable. If it fires, author a **new** migration — do
  not work around the hook.
- **Secrets.** `.claude/settings.json` denies reads and edits of `.env*` outright. That is the
  mechanical backstop for AI-TOOL-GUIDE §9, not a substitute for it.
- **Repository state.** The app is not scaffolded — there is no `package.json`, `app/`, or
  `supabase/` on `main`. Do not assume a command, script, or path exists; check first, and say
  so plainly when something is missing rather than inventing a plausible substitute.

## When blocked

Stop and say so. Do not guess, do not proceed on an assumption, and do not silently narrow the
task. Name what is ambiguous, state the options, and wait. Escalation triggers are in
AI-TOOL-GUIDE §7.
