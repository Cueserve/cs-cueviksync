---
description: Step 3 of 3 (Build) — turn an approved spec.md into plan.md, a dependency-ordered task list an agent can execute cold
allowed-tools: Bash, Read, Glob, Grep, Write, Edit, AskUserQuestion
argument-hint: "[<issue#> | <folder>]"
---

# Plan

Step 3 of the three-step process ([docs/work/README.md](../../../docs/work/README.md)). Turn an
approved `spec.md` into `plan.md`: a dependency-ordered set of task blocks that a session with
no memory of this conversation can execute and turn into a Pull Request (PR).

**This command plans. It does not implement.** Not one line of the change is written here.

**Write for the coldest possible reader.** The executing session gets `plan.md` and the repo,
nothing else. Every task names its files and carries a command that proves it worked. A task
that says "wire up the form" is not a task.

Arguments (optional): `$ARGUMENTS` — an issue number or a folder name. Empty resolves to the
only folder with an approved `spec.md` and no `plan.md`; if there is more than one, ask.

---

## Phase 0 — Where are we

1. `ls docs/work/` and print the state table for this folder.
2. Read `spec.md` in full, and `intent.md` §4 for what is out of scope. Nothing else from the
   folder.

## Phase 1 — The gates

Two, both hard:

1. **`spec.md` exists and reads `**Status:** Approved`.** Missing or `Draft` → stop, and say to
   run `/work:2-spec`.
2. **Every box in `spec.md` §8 is ticked.** An unticked escalation trigger — a migration, a
   package, an auth or RLS change, a service-role path — means the human has not signed off on
   something the plan would tell an agent to do. Stop, name the unticked boxes, and ask. Do not
   plan around it, and do not plan it as a "pending approval" task. The issue should already
   carry `decision-needed` from `/work:2-spec`; add it if it does not.

Once both gates pass, drop `decision-needed` if it is there — the decision has been made:

```sh
gh issue edit <n> --repo Cueserve/cs-cueviksync --remove-label decision-needed
```

## Phase 2 — Read the code

Read every file the spec says this touches, and find the ones it missed. A plan written from
the spec alone will name files that do not exist and miss the ones that do.

Confirm placement for each new file against
[docs/PROJECT-STRUCTURE.md](../../../docs/PROJECT-STRUCTURE.md) §2 before it appears in a task.

## Phase 3 — Decompose

Break the work into tasks small enough that one agent holds the whole task in context. Then,
for each:

- **`depends-on`** — the task numbers whose output this one reads. Be honest and be minimal: a
  dependency that is really just "I'd do this first" serialises work that could have run in
  parallel. Two Zod schemas in two files depend on the migration, not on each other.
- **`files`** — every path it creates or edits. **Two tasks that can run in parallel must not
  name the same file.** If they do, they are one task or they are mis-split.
- **`proof`** — one command, copy-pasteable, that passes only if the task is done. `npx vitest
run src/lib/validation/person.test.ts`, not "tests pass".

**The proof command must fail before the task starts.** That is what makes it proof rather
than decoration, and it is test-driven development stated as a property of the plan
([docs/ENGINEERING-RULES.md](../../../docs/ENGINEERING-RULES.md) §3). Where a task's proof is a
test, writing that test is part of that task, not a later one.

Then group the tasks into waves: wave 1 is every task with no dependency, wave 2 is every task
whose dependencies are all in wave 1, and so on. The waves are what `superpowers:dispatching-parallel-agents`
consumes; a plan executed top-to-bottom by one agent gets the same result, slower.

## Phase 4 — Write it

```markdown
# <Title> — Plan

**Work item:** [#<n> <issue title>](<issue url>)
**Date:** <YYYY-MM-DD>
**Status:** Draft
**Derived from:** [spec.md](spec.md)
**Branch:** `feat/<slug>`

> Transient per [docs/work/README.md](../README.md). Not a source-of-truth document: where
> this disagrees with a file under `docs/`, that file wins.

## Execution contract

Read this before starting, and again whenever the repo does not look the way a task expects.

1. **A task is done when its `proof` command passes.** Not when the code looks right.
2. **When reality contradicts the plan, stop.** A file that is not where the plan says, an
   interface that does not match, a test that cannot be written the way the task describes —
   append the contradiction to §Deviations, open the PR as a **draft** titled with what
   blocked, and report. Do not improvise past a wrong plan: a plan that was wrong about one
   thing is evidence, not a rounding error.
3. **Scope is the task list.** No refactor, no error handling, no abstraction that no task
   asked for ([CLAUDE.md](../../CLAUDE.md), "No invented scope").
4. **Ship gate before the PR:** `npm run lint`, `npm run typecheck`, `npm run format:check`,
   `npm run test`. All four pass → regular PR. Any fail → **draft** PR titled with the failure,
   and stop. Never weaken a check to force green.
5. **Never push to `main`, never force-push, never merge or close the PR.** Enforced by
   `.claude/hooks/block-remote-writes.mjs`; stated here because the executing session reads
   this file first.
6. **Move the card twice.** Set Status to `Working` before task 1, and to `Reviewing` when the
   PR opens — nothing else knows when either happened. The exact calls and ids are in
   [docs/work/README.md](../README.md), "The board". `Done` is not yours: the human merges, so
   the human closes it out.

## Waves

- **Wave 1:** <task numbers> — no dependencies, dispatch in parallel
- **Wave 2:** <task numbers> — after wave 1
- ...

## Tasks

### Task 1 — <imperative title>

- **depends-on:** []
- **files:** `path/one.ts`, `path/two.ts`
- **do:** <what changes, precisely enough that two agents would write the same thing>
- **proof:** `<command>`

### Task 2 — <imperative title>

- **depends-on:** [1]
- **files:** `path/three.ts`
- **do:** <...>
- **proof:** `<command>`

## Risks

- <what could make this plan wrong, and the task it would surface at>

## Deviations

<Empty at planning time. The executing session appends here — what the plan said, what the
repo actually held, and which task it stopped at.>
```

## Phase 5 — Self-review, then approve

Before showing it, check:

1. **Cold-read** — does any task rely on something said in this session and not in the file?
2. **File collisions** — do two tasks in the same wave name the same file?
3. **Proof coverage** — does every task have a command, and does every behaviour in `spec.md`
   §1 end up asserted by at least one of them?
4. **Scope** — does any task do something neither `spec.md` nor `intent.md` asked for?
5. **Approvals** — does any task do something `spec.md` §8 flagged but that is still unticked?

Then show it and ask whether it is approved. On an explicit yes, and only then, set
`**Status:** Approved`.

Then move the board item to **`Ready`** — shaping is done and there is a plan to build
from. `Working` belongs to the session that starts building, not to this one.

### Moving the card

```sh
# 1. find the project item id for the issue (its `id` field, PVTI_...)
gh project item-list 17 --owner Cueserve --format json --limit 100

# 2. set Status to Ready
gh project item-edit --id <item id> --project-id PVT_kwDOAWKwws4BgZo3 --field-id PVTSSF_lADOAWKwws4BgZo3zhay328 --single-select-option-id 5c76395f
```

The two long ids are the project and its `Status` field; `5c76395f` is `Ready`.
If any is rejected, re-read them with `gh project field-list 17 --owner Cueserve --format json`
rather than guessing — a recreated project changes them.

Then drop `shaping` — the folder is complete, and the label means an open one:

```sh
gh issue edit <n> --repo Cueserve/cs-cueviksync --remove-label shaping
```

These are writes to the shared board. They prompt; let them.

## Phase 6 — Regenerate the folder README

Rewrite the work folder's `README.md` from the `**Status:**` header of each artifact, to the
template in [docs/work/README.md](../../../docs/work/README.md). All three rows are filled in
now; **Next** becomes executing the plan.

Report the path and stop. Executing the plan is a separate session — that is the point of
writing it down.
