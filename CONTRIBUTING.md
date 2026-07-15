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
