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
- Branch state *is* draft-vs-final: work-in-progress lives on its branch; merging to
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

<!-- BEGIN INITIATION-ONLY -->
## Initiation branching & self-review gate

_This section governs producing the initiation documents only. Step-09
(`/proj-init-finalize`) removes everything between the `INITIATION-ONLY` markers,
markers included, once initiation completes._

### Initiation branch naming

Initiation work uses `init/<step>`:

- `init/repo-setup` · `init/product` · `init/prd` · `init/architecture` ·
  `init/techstack` · `init/aitoolguide` · `init/readme` · `init/backlog`

### Self-review checklist

Before merging any initiation PR, the author self-certifies:

- [ ] At least a few hours — ideally a full day — have passed since writing the change
      (fresh-eyes pass).
- [ ] The change covers everything its step guide / task requires.
- [ ] No upstream document changed after this branch was created.
- [ ] A PR was opened — no direct push to `main`.

Solo / process-enforced: the author completes this checklist before merging. There is no
second reviewer to block the merge — the checklist is the gate.
<!-- END INITIATION-ONLY -->

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

- **Node.js** >= 22 Long-Term Support (LTS) — the Vercel runtime line.
- **npm** — bundled with Node.js 22; the project package manager. Do not use pnpm or yarn.
- **Supabase CLI** — for local Postgres, Auth, Storage, and Edge Functions.

## Run commands

| Task | Command |
| --- | --- |
| Install dependencies | `npm install` |
| Start local Supabase (Postgres, Auth, Storage, Edge Functions) | `npx supabase start` |
| Run the app in development | `npm run dev` |
| Build for production | `npm run build` |
| Start the production build | `npm run start` |
| Lint | `npm run lint` |
| Format | `npm run format` |
| Unit tests (Vitest) | `npm run test` |
| End-to-end + WCAG 2.1 AA checks (Playwright) | `npm run test:e2e` |
| Deploy an Edge Function (Intake Receiver / Ingestion Worker) | `npx supabase functions deploy <name>` |

The `dev`, `build`, `start`, and `lint` scripts wrap Next.js (`next dev` / `next build` /
`next start` / `next lint`); `format` wraps Prettier; `test` wraps Vitest; `test:e2e`
wraps Playwright.

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
- **E2E + accessibility (advisory / nightly):** `npm run test:e2e` (Playwright end-to-end
  plus the WCAG 2.1 AA check). It stands up the app and a Supabase instance, so it is the
  slower, flakier surface and does **not** block a merge on its own — review its result as
  part of the self-review checklist.

CI is a self-discipline net: it runs the full suite on the actual merge state, catching what
the staged-files-only pre-commit hooks miss. It complements — does not replace — the
self-review checklist, which remains the merge gate for this solo / process-enforced repo.
The workflow file (`.github/workflows/`) is added when the repository is scaffolded.

## Environment

The app and the capture path require these before `npm run dev`:

- Supabase project URL and keys — the **service-role key is server-side only** and MUST
  NOT be exposed to the browser.
- `pgmq` and `pg_cron` extensions enabled on the Supabase Postgres instance.
- Resend API key (optional — required only for in-app quote-email delivery).
- Sentry and PostHog keys (optional in local development).

Concrete environment-variable names and setup steps are documented in `README.md` (Step-07).
