---
description: Step 2 of 3 (Design) — turn an approved intent.md into spec.md, with policy applied as it is written
allowed-tools: Bash, Read, Glob, Grep, Write, Edit, Skill, AskUserQuestion
argument-hint: "[<issue#> | <folder>]"
---

# Spec

Step 2 of the three-step process ([docs/work/README.md](../../docs/work/README.md)). Turn an
approved `intent.md` into `spec.md`: requirements and design in one pass, with this repo's
policy applied while it is written rather than discovered in review.

**This command designs. It does not sequence work and does not name a branch.** That is
`/plan`. It also does not revisit whether the thing should be built — `intent.md` settled that,
and reopening it here means going back to `/intent`, not arguing it in the spec.

Arguments (optional): `$ARGUMENTS` — an issue number or a folder name. Empty resolves to the
only folder with an approved `intent.md` and no `spec.md`; if there is more than one, ask.

---

## Phase 0 — Where are we

1. `ls docs/work/` and print the state table for this folder.
2. Read `intent.md` in full. **Read only that.** The session that wrote it is gone, and its
   conversation is not available to you — if the file does not carry something, that something
   does not exist yet. Say so rather than filling the gap from inference.

## Phase 1 — The gate

`intent.md` must exist and its header must read `**Status:** Approved`.

Missing, or still `Draft` → **stop**. Report which, and say to run `/intent`. Do not offer to
write the intent yourself in this session; the steps are separate so that each one is read
cold, and collapsing them defeats the only reason there are three.

## Phase 2 — Load the policy

A spec is only worth writing if it is constrained. Read the files that constrain this slice
before designing anything — never recall them ([CLAUDE.md](../../CLAUDE.md), "Read before
proposing"):

- [docs/PRD.md](../../docs/PRD.md) for every `PRD-NNN` the intent cites, plus the
  Non-Functional Requirements (NFRs) that apply.
- [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) for the module this lands in.
- [docs/PROJECT-STRUCTURE.md](../../docs/PROJECT-STRUCTURE.md) §2, for where every new file
  goes. This is not optional and its answer goes in the spec.
- [docs/ENGINEERING-RULES.md](../../docs/ENGINEERING-RULES.md) §2 for the banned patterns this
  design could walk into, and §3 for which mandatory test cases apply.
- [docs/DESIGN-SYSTEM.md](../../docs/DESIGN-SYSTEM.md) and `src/components/ui/`, if a screen is
  involved.
- Any approved spec in `docs/specs/` covering the same entities.

Then read the code the slice actually touches. A spec written against the docs alone will
describe a repo that does not exist — `CLAUDE.md`'s "Project state" is a dated snapshot and
says so.

## Phase 3 — Design

Batch the questions ([CLAUDE.md](../../CLAUDE.md)). Where two designs are genuinely open,
state the trade-off and let the human pick — do not silently choose.

**If this slice is UI-bearing, run `/impeccable shape` here**, inside this step. CLAUDE.md's
UI order puts shaping after the problem is settled and before anything is built, which is
exactly this phase. `/impeccable craft` stays banned; nothing but shadcn writes UI in this
repo.

Resolve every value to a design token before any markup appears in the spec.

## Phase 4 — Apply policy as you write

The spec is where a governance problem is supposed to surface, not the PR. Walk
[CLAUDE.md](../../CLAUDE.md)'s "Decision escalation" and "Off-limits" against this design and
**flag every trigger in §8 of the artifact** — a schema or migration change, a new or removed
package, a change to a service-role path, anything touching auth or Row-Level Security (RLS),
a new runtime role.

Flagging is not approval. §8 is a list of what the human has to sign off before `/plan` runs,
and `/plan` reads it.

## Phase 5 — Write it

Write `spec.md` beside `intent.md`.

```markdown
# <Title> — Spec

**Work item:** [#<n> <issue title>](<issue url>)
**Date:** <YYYY-MM-DD>
**Status:** Draft
**Derived from:** [intent.md](intent.md)

> Transient per [docs/work/README.md](../README.md). Not a source-of-truth document: where
> this disagrees with a file under `docs/`, that file wins.

## 1. Behaviour

<Numbered, testable statements. Each traces to a `PRD-NNN` where one exists, or is marked
`(new)` where it does not — a new requirement is a `docs/PRD.md` change and belongs in §7.>

## 2. Data model

<Tables, columns, types, indexes. The RLS policy for each new table, and which of
`tenant_id = current_tenant_id()` / `is_admin()` it uses. "No schema change" is a valid and
common answer — say it explicitly.>

## 3. Server surface

<Server Actions by name and file, per PROJECT-STRUCTURE §2. The Zod schema each validates
against, and its file. Which Supabase client each uses, and why.>

## 4. User interface

<Routes, route-private components, and which of the 18 primitives in `src/components/ui/` each
screen is built from. Any primitive that has to be added, and whether a `cva` variant on an
existing one would do instead. Every colour, radius, and type size named as a token.>

## 5. Rejected alternatives

<What else was considered, and the reason it lost. A spec with no rejected alternative was not
a design session.>

## 6. Tests

<The behaviour from §1 that gets asserted, and the failure and rejection paths. Then the
mandatory cases from ENGINEERING-RULES §3 that apply here — tenant isolation, worker
idempotency, state-machine rejections — or an explicit statement that none do, with the
reason.>

## 7. Downstream document changes

<Which files under `docs/` this makes stale, and what each needs. Each lands in its own Pull
Request (PR) per CONTRIBUTING.md. "None" is a valid answer.>

## 8. Requires human approval before `/plan`

- [ ] <trigger from CLAUDE.md "Decision escalation" or "Off-limits">, because <reason>

## 9. Out of scope

<Carried forward from intent.md §4, plus anything this design ruled out on its own.>
```

## Phase 6 — Self-review, then approve

Read the file with fresh eyes before showing it:

1. **Placeholders** — any `TBD`, `TODO`, or empty section. Fill them.
2. **Contradictions** — does §3 match §2, does §4 match §1.
3. **Ambiguity** — any requirement two people would read two ways. Pick one and say so.
4. **Docs conflict** — anything here that a file under `docs/` contradicts. The doc wins; fix
   the spec, or move the disagreement to §7 as a documentation change.

Then show it and ask whether it is approved. On an explicit yes, and only then, set
`**Status:** Approved`.

Report the path and stop. Do not invoke `/plan`.
