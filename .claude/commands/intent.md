---
description: Step 1 of 3 (Plan) — interrogate a work item until the problem is stated, then write intent.md
allowed-tools: Bash, Read, Glob, Grep, Write, Edit, Skill, AskUserQuestion
argument-hint: "[<issue#> | <free description>]"
---

# Intent

Step 1 of the three-step process ([docs/work/README.md](../../docs/work/README.md)). Produce
`intent.md`: the problem, stated, before anyone has proposed a solution to it.

**This command does not design and does not plan.** No schema, no file names, no components,
no libraries. The moment a solution appears in this session, the step has failed at the only
thing it exists to do — which is to stop you reaching for one. `/spec` designs. `/plan` plans.

**Every question is batched.** Ask them in groups, never one per message
([CLAUDE.md](../../CLAUDE.md), "Ask, don't assume").

Arguments (optional): `$ARGUMENTS` —

- **An issue number or URL** (`41`, `#41`, or the full GitHub URL) — work that is already on
  the board.
- **A free description** — work that is not. Phase 1 files the issue first.
- **Empty** — list the in-flight folders and ask which to resume.

---

## Phase 0 — Where are we

1. `ls docs/work/` and read the `**Status:**` line in each artifact of each folder.
2. Print the state table for the folder this run concerns (or all of them, if `$ARGUMENTS` is
   empty), in the format in `docs/work/README.md`.
3. If this work item already has a folder with an `intent.md`, **this is a resume**: read it,
   say which sections are thin or which open questions are still unanswered, and refine that
   file. Do not start a second one and do not clobber the first.

## Phase 1 — Resolve the work item

**Given an issue number:** read it —

```sh
gh issue view <n> --repo Cueserve/cs-cueviksync --json number,title,body,labels,url
```

**Given a free description:** grill first, file second. Run Phases 2-4 on the description, and
only once the problem is actually stated do you create the issue — a title and body written
before the interrogation is a title and body describing your first guess.

Creating the issue is a **write to GitHub that your team sees.** State the exact title, body,
and labels you intend, and wait for an explicit yes before running anything. Then:

```sh
gh issue create --repo Cueserve/cs-cueviksync --title "<title>" --body "<body>" --label "<labels>"
gh project item-add 17 --owner Cueserve --url <issue url>
```

Leave the board Status at its default. This command does not move cards.

**Given nothing:** list the folders under `docs/work/` whose `plan.md` is missing or `Draft`,
and ask which one to resume.

## Phase 2 — Pick the mode

Search the issue title and body for a `PRD-NNN` reference.

- **Found → slice contract.** The problem is already stated in
  [docs/PRD.md](../../docs/PRD.md); restating it produces a file that copies the PRD and
  teaches you nothing. The job here is the **cut**: why this slice now, what is in it, and —
  the part that actually earns the file — what is deliberately _not_ in it. `PRD-018: Quote
total` says nothing about whether tax and discount are in this pass. That is the gap this
  file closes.
- **Not found → problem statement.** Epics, anything labelled `decision-needed`, and anything
  you typed in by hand. Nothing upstream has stated the problem, so this file is where it gets
  stated for the first time.

Say which mode you are in and why, so it can be overruled.

## Phase 3 — Interrogate

Invoke `superpowers:brainstorming` for the questioning, with two overrides: batch the
questions, and the output path is this command's, not the skill's default.

Push on whichever of these the answers leave soft. These are the fields of the artifact, so a
soft answer here is a hole in the file:

- **Why now.** What changes if this waits a month? "It's next on the board" is not a reason.
- **Outcome.** What is observably true when this is done, that is not true today? State it as
  something a person can check, not as work completed.
- **The cut.** What is in this slice — and name at least one plausible thing that is _out_. A
  slice with nothing excluded has not been cut.
- **Affected users and systems.** Which roles, which existing routes and tables, which of the
  three service-role paths.
- **Constraints.** Every one must be **cited to a file** under `docs/` —
  `docs/ARCHITECTURE.md §2`, not "the architecture says". Read the file. Never recall it
  ([CLAUDE.md](../../CLAUDE.md), "Read before proposing").
- **Open questions.** What you do not know yet, and which of those must be settled before
  `/spec` can run.

Challenge the answers. Agreement before pressure-testing is worth nothing here.

## Phase 4 — The gate

**Every open question must be either answered or explicitly deferred with a reason.** An
unmarked open question stops this command: report which one, and write nothing. A deferral is
a decision and reads like one — "deferred: duplicate-merge UX, because nothing in this slice
creates duplicates" — not an empty bullet.

## Phase 5 — Write it

Slug the folder `docs/work/<YYYY-MM-DD>-<issue#>-<slug>/`, zero-padding the issue number to
three digits. The date is today.

```markdown
# <Title> — Intent

**Work item:** [#<n> <issue title>](<issue url>)
**Date:** <YYYY-MM-DD>
**Status:** Draft
**Mode:** slice contract | problem statement

> Transient per [docs/work/README.md](../README.md). Not a source-of-truth document: where
> this disagrees with a file under `docs/`, that file wins.

## 1. Problem

<Slice contract: why this cut, now. Problem statement: what is broken or missing, in plain
terms, with no solution in it.>

## 2. Outcome

<What is observably true when this is done. Checkable, not "implemented X".>

## 3. In this slice

- <...>

## 4. Explicitly not in this slice

- <...> — <why it is out>

## 5. Affected users and systems

- **Roles:** <...>
- **Existing surfaces:** <routes, tables, modules this touches>
- **Service-role paths:** <Intake Receiver / Ingestion Worker / provisioning, or none>

## 6. Constraints

- <constraint> — [docs/<FILE>.md](../../<FILE>.md) §<n>

## 7. Open questions

- **<question>** — answered: <answer>
- **<question>** — deferred: <reason it can wait past `/spec`>
```

## Phase 6 — Approve

Show the file. Ask whether it is approved.

On an explicit yes, and only then, change the header to `**Status:** Approved`. `/spec`
refuses to run against a `Draft`, so this flip is the gate — never set it on your own
initiative, and never because the file looks finished to you.

Report the path and stop. Do not invoke `/spec`. It is a separate session by design.
