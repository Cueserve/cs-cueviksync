---
description: Step 1 of 7 (Requirements) — explore an idea until it can be decided, then write docs/work/brainstorming/<NNN>-<topic>.md
allowed-tools: Bash, Read, Glob, Grep, Write, Edit, Skill, AskUserQuestion
argument-hint: '["<topic>" | <idea#>]'
---

# Brainstorm

Step 1 of the seven-step process ([docs/work/README.md](../../../docs/work/README.md)). Produce
`docs/work/brainstorming/<NNN>-<topic>.md`: an idea explored until a person can say whether it
should exist, and in what shape.

**This command does not write requirements and does not design.** No `PRD-NNN`, no schema, no
file names, no libraries. Options are explored at the level of what a user would see and why it
matters. `/work:2-audit-prd` turns an approved idea into requirements; `/work:5-spec` designs.

**Every question is batched.** Ask them in groups, never one per message
([CLAUDE.md](../../../CLAUDE.md), "Ask, don't assume"). Keep asking, round after round, until
nothing in Phase 3 is soft — there is no question budget, only the gate in Phase 4.

Arguments (optional): `$ARGUMENTS` —

- **A topic** (`"repeat-order reminders"`) — a working name for the idea. It seeds the slug.
- **An idea number** (`7` or `007`) — resume that idea.
- **Empty** — fine. The topic comes from the description in Phase 1.

---

## Phase 0 — Where are we

1. `git fetch origin`, then list every idea and its `**Status:**` line:

   ```sh
   git ls-tree --name-only origin/main docs/work/brainstorming/
   git branch -r --list 'origin/docs/idea-*'
   git show origin/docs/idea-<NNN>-<slug>:docs/work/brainstorming/<NNN>-<slug>.md   # per branch
   ```

2. If `$ARGUMENTS` is an idea number, or names the topic of an idea that is still `Draft`,
   **this is a resume**: check out its branch, read the file, say which sections are thin or
   which open questions are unanswered, and refine that file. Do not start a second one.
3. If it matches one that is `Approved`, `Rejected`, or `Ratified`, say so and stop — that idea
   has been decided. A new angle on it is a new idea with its own number.

## Phase 1 — The idea, in your words

**Always ask for two or three sentences describing the idea**, even when a topic was given. A
topic is a label; the description is the claim the rest of the session tests. Keep the
sentences exactly as written — they go into §1 of the file unedited.

## Phase 2 — Read before asking

Read [docs/PRODUCT.md](../../../docs/PRODUCT.md) and [docs/PRD.md](../../../docs/PRD.md) in
full, and every existing file in `docs/work/brainstorming/`. Never recall them
([CLAUDE.md](../../../CLAUDE.md), "Read before proposing").

Report what you found before the first question: the `PRD-NNN` items this idea overlaps,
extends, or contradicts; the PRODUCT.md section it lands in or pushes against; and any earlier
idea that covers the same ground. An idea that duplicates an existing requirement is worth
knowing about before twenty minutes of questions.

## Phase 3 — Interrogate

Invoke `superpowers:brainstorming` for the questioning, with three overrides: batch the
questions, the output path is this command's, and stop short of design — the skill's own
design and plan steps belong to later commands.

Push on whichever of these the answers leave soft. These are the fields of the file, so a soft
answer here is a hole in it:

- **Problem.** What is broken or missing today, for whom. No solution in the statement.
- **Who.** Which of the roles in PRD.md, and which kind of customer business.
- **Why it matters.** What changes for the user if this exists, and what it costs them that it
  does not. "Competitors have it" is not a reason on its own.
- **Options.** At least two shapes the idea could take, including the smallest useful one, each
  with what it is for and against it.
- **Recommendation.** Which option, and why it beat the others.
- **Out of scope.** At least one plausible thing this idea deliberately does not include.
- **Open questions.** What is still unknown.

Challenge the answers. Agreement before pressure-testing is worth nothing here.

## Phase 4 — The gate

**Every open question must be answered or explicitly deferred with a reason** — and the only
valid reason to defer is that `/work:2-audit-prd` can settle it against the PRD. An unmarked
open question stops this command: report which one, and write nothing.

## Phase 5 — Number, branch, write

1. **Number.** `NNN` is one more than the highest number found in Phase 0 across
   `origin/main` and the `docs/idea-*` branches, zero-padded to three digits. Counting the
   branches is what stops two ideas in flight from taking the same number.
2. **Slug.** Kebab-case, at most five words, from the topic or — with none given — from the
   description.
3. **Branch** from the latest `main`, named per [CONTRIBUTING.md](../../../CONTRIBUTING.md):

   ```sh
   git switch -c docs/idea-<NNN>-<slug> origin/main
   ```

   Stop if the working tree is not clean; say what is in the way rather than stashing it.

4. **Write** `docs/work/brainstorming/<NNN>-<slug>.md`:

```markdown
# <Title> — Brainstorm

**Idea:** <NNN>
**Date:** <YYYY-MM-DD>
**Status:** Draft
**Branch:** `docs/idea-<NNN>-<slug>`

> Pre-decision exploration per [README.md](README.md). Never authoritative: where this
> disagrees with a file under `docs/`, that file wins, and nothing here is a reason to write
> code until `/work:2-audit-prd` ratifies it into `docs/PRD.md`.

<One plain sentence: what this idea is.>

## 1. The idea

<The two or three sentences from Phase 1, exactly as written.>

## 2. Problem and who has it

## 3. Why it matters

## 4. Options explored

- **<option>** — <what it is>. For: <...>. Against: <...>.

## 5. Recommendation

## 6. Fit with the product

- **PRODUCT.md:** <section it extends or pushes against, cited>
- **PRD.md:** <`PRD-NNN` it overlaps, extends, or contradicts; the §6 sections it lands in>

## 7. Out of scope

- <...> — <why it is out>

## 8. Open questions

- **<question>** — answered: <answer>
- **<question>** — deferred: <what `/work:2-audit-prd` will settle it against>

## 9. Ratified as

<Empty. `/work:2-audit-prd` fills this in.>
```

## Phase 6 — Decide

Show the file. Ask for one of three answers:

- **Approved** — the idea should exist in the recommended shape. Set `**Status:** Approved`.
- **Rejected** — it should not. Set `**Status:** Rejected` and add one line under §5 saying
  why. A rejected idea is still a record: the next person with the same idea finds it.
- **Not yet** — leave it `Draft`; a later run resumes it.

Only an explicit answer sets a status. Never set one on your own initiative, and never because
the file looks finished to you. `/work:2-audit-prd` refuses anything but `Approved`.

## Phase 7 — Commit and push

```sh
git add docs/work/brainstorming/<NNN>-<slug>.md
git commit -m "docs(work): brainstorm idea <NNN> — <title>"
git push -u origin docs/idea-<NNN>-<slug>
```

Push even a `Draft`: the branch is how Phase 0 of the next run counts numbers in flight, and
how a cloud session for step 2 sees the file at all — it clones the remote, not your disk.

**No pull request here.** The file rides in the docs PR that `/work:2-audit-prd` opens on this
same branch, alongside the PRD change it produced. A `Rejected` idea gets its own small docs PR
only if you want the record on `main`; otherwise delete the branch.

Report the file path, the branch, and what to run next:

- `Approved` → `/work:2-audit-prd <NNN>`, here or in the cloud with
  `claude --cloud "/work:2-audit-prd <NNN>"` from a terminal on this branch.
- `Draft` → `/work:1-brainstorm <NNN>` to resume.

Then stop. Do not invoke `/work:2-audit-prd`. It is a separate session by design.
