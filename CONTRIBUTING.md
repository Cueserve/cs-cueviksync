# Contributing to CuevikSync

This document defines the **governance layer** for CuevikSync: how work is branched,
committed, reviewed, and merged. Every contributor and AI tool follows these rules.

> The **tooling layer** (test/lint/build commands, hooks) is appended later, once the
> tech stack is decided (Step-05). Only governance is defined here.

CuevikSync is **solo / process-enforced**: one person holds both the Product Owner and
Architect hats. There is **no host-enforced required-reviewer policy** — no second
reviewer blocks a merge. The gate is the **self-review checklist** below, which the
author completes before merging.

---

## Branching strategy

- `main` only ever holds finalized, approved work. **Never push directly to `main`.**
- Every change is made on a branch created off an up-to-date `main`.
- Branch state _is_ draft-vs-final: work-in-progress lives on its branch; merging to
  `main` is what makes it final. There are no draft files or status frontmatter to track.

### Branch naming

- Ongoing work uses a short, descriptive prefix matching the commit type:
  `feat/<slug>`, `fix/<slug>`, `chore/<slug>`, `docs/<slug>`.

---

## Review flow

1. Create a branch off the latest `main`.
2. Do the work; commit using the convention below.
3. Open a **Pull Request (PR)** targeting `main` — one PR per branch.
4. Complete the self-review checklist.
5. Merge to `main`. **A merged change is the only "final" change.**

Open PRs from the CLI (`gh pr create`) or the GitHub web UI.

---

<!-- BEGIN DEVELOPMENT-PHASE-GOVERNANCE -->

## Development-phase governance

_Initiation is complete. The branching, review, and contribution rules for ongoing
development are the team's to define once dev-phase realities are known — team size,
review model, CI gates, release/versioning, environments. Fill this section in and
remove this note as a standalone documentation change (see Documentation changes below)._
<!-- END DEVELOPMENT-PHASE-GOVERNANCE -->

---

## Commit convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>: <short summary>
```

Common types: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `build:`, `ci:`.

Examples:

- `docs: add repo governance baseline`
- `feat: add sync retry queue`
- `fix: handle empty payload on push`

---

## Documentation changes

The source-of-truth documents in `docs/`, plus this file and `CLAUDE.md`, are authoritative.
Changing one is a **standalone change, never folded into feature work**:

1. Propose the edit as a diff.
2. Name the downstream documents it affects — each document's header carries a `Downstream:`
   line listing them.
3. Get explicit approval.
4. Land it in its own commit.

Keep acronyms defined on first use in any new document, and match the writing standard already
in `docs/`.

---

## Direct-push rule

- **Never push to `main`.** All changes land through a PR.
- Never force-push to shared branches.

---

## Branch protection

Branch protection on `main` (block direct push / require a PR before merge) is
**best-effort**. Enable it in GitHub repository settings if the plan allows; on free-plan
private repos it may be unavailable. If it cannot be set, the self-review checklist above
is the gate that matters — its absence does not weaken the process.

---

# Tooling layer

Added in Step-05 once the stack was locked. Every command below uses only technologies
approved in [`docs/TECH-STACK.md`](docs/TECH-STACK.md). Do not introduce a command for a
tool that is not listed there — add it to `TECH-STACK.md` first.

## Required versions

Match the versions pinned in `docs/TECH-STACK.md`:

- **Node.js** 24 Long-Term Support (LTS) — the Active LTS line, and the Vercel runtime.
  Pinned in `.nvmrc` and enforced by `engines.node` plus `.npmrc engine-strict=true`.
- **npm** — bundled with Node.js 24; the project package manager. Do not use pnpm or yarn.
- **Supabase CLI** — links the repo to the hosted project, applies migrations, deploys Edge
  Functions, and runs the local stack used by tests.
- **Docker** — required only to run the test suite (`npx supabase start`). Not needed for
  day-to-day development, which targets the hosted project.

## Run commands

| Task                                                           | Command                                      |
| -------------------------------------------------------------- | -------------------------------------------- |
| Install dependencies                                           | `npm install`                                |
| Link the repo to the hosted Supabase project (once, per clone) | `npx supabase link`                          |
| Apply pending migrations to the hosted project                 | `npx supabase db push --linked`              |
| Regenerate database types after a migration                    | `npx supabase gen types typescript --linked` |
| Run the app in development                                     | `npm run dev`                                |
| Build for production                                           | `npm run build`                              |
| Start the production build                                     | `npm run start`                              |
| Lint                                                           | `npm run lint`                               |
| Format                                                         | `npm run format`                             |
| Unit tests (Vitest)                                            | `npm run test`                               |
| Start the local Supabase stack — **tests / CI only**           | `npx supabase start`                         |
| Deploy an Edge Function (Intake Receiver / Ingestion Worker)   | `npx supabase functions deploy <name>`       |

The `dev`, `build`, and `start` scripts wrap Next.js (`next dev` / `next build` /
`next start`); `lint` wraps the ESLint CLI (`eslint`) — Next 16 removed `next lint`;
`format` wraps Prettier; `test` wraps Vitest. There is no `test:e2e`.

## Pre-commit hooks

Husky + lint-staged run on every commit:

- **lint-staged** runs Prettier (format) and ESLint (fix) on staged files.
- A commit MUST NOT be pushed if lint or format fails; fix and re-stage.

Install the hooks once after `npm install`:

```bash
npm run prepare
```

## Continuous integration

GitHub Actions runs on every PR to `main` (see `docs/TECH-STACK.md` §3). Two jobs:

- **Gate (blocking):** `npm run lint`, a TypeScript type-check (`tsc --noEmit`), and
  `npm run test` (Vitest). A failure here means the PR is not ready to merge.

CI is a self-discipline net: it runs the full suite on the actual merge state, catching what
the staged-files-only pre-commit hooks miss. It complements — does not replace — the
self-review checklist, which remains the merge gate for this solo / process-enforced repo.
The workflow file (`.github/workflows/`) is added when the repository is scaffolded.

## Environment

Which Supabase environment development runs against, the working rules that follow from that,
the migration-ordering rule, and the required configuration are in
[`docs/ENVIRONMENTS.md`](docs/ENVIRONMENTS.md).

Environment topology is not governance — it changes when infrastructure changes, not when
process changes — so it lives in `docs/` beside the other source-of-truth documents rather than
in the middle of this file. RedyQuote carries the same file at the same path.
