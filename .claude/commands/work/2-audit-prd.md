---
description: Step 2 of 7 (Requirements) — audit PRODUCT.md and PRD.md against an approved idea, decide the requirement changes with you, and open the docs PR
allowed-tools: Bash, Read, Glob, Grep, Write, Edit, Skill, AskUserQuestion
argument-hint: "<idea#>"
---

# Audit PRD

Step 2 of the seven-step process ([docs/work/README.md](../../../docs/work/README.md)). Take an
approved idea from `docs/work/brainstorming/`, audit [docs/PRODUCT.md](../../../docs/PRODUCT.md)
and [docs/PRD.md](../../../docs/PRD.md) against it, and turn it into requirements: new
`PRD-NNN` items, changes to existing ones, or both — then open the docs PR that lands them.

**This command decides requirements. It does not design and does not file issues.** No schema,
no file names, no components. `/work:3-epic` files the issues once this PR merges;
`/work:5-spec` designs.

**You decide; this command makes the decision cheap.** Every change to a source-of-truth
document follows [CONTRIBUTING.md](../../../CONTRIBUTING.md) "Documentation changes": shown as
a diff, downstream files named, explicit approval, its own commit.

Arguments (required): `$ARGUMENTS` — an idea number (`7` or `007`). **Empty → stop and ask for
one.**

**Local or cloud.** `echo "$CLAUDE_CODE_REMOTE"` — `true` means a cloud session. The steps are
the same in both: nothing here touches the project board, which the cloud cannot reach. Unlike
`/work:7-execute`, this command is **never unattended** — in the cloud you answer its questions
in the session at claude.ai/code, and an unanswered question means nothing is written.

---

## Phase 0 — Resolve the idea

1. Zero-pad the number to three digits. `git fetch origin`.
2. Find `docs/work/brainstorming/<NNN>-*.md` on the current branch. Not there → find the one
   `origin/docs/idea-<NNN>-*` branch and `git switch` to it. None, or more than one → stop and
   report what matched.
3. The file's header reads `**Status:** Approved`. `Draft` → stop, say to finish it with
   `/work:1-brainstorm <NNN>`. `Rejected` or `Ratified` → stop; it has been decided.

Read the idea file in full. **Read only that from the brainstorm** — the session that wrote it
is gone. If the file does not carry something, it does not exist yet; say so rather than
inferring it.

## Phase 1 — Read the documents

Read [docs/PRODUCT.md](../../../docs/PRODUCT.md) and [docs/PRD.md](../../../docs/PRD.md) in
full. Never recall them ([CLAUDE.md](../../../CLAUDE.md), "Read before proposing"). Note, from
the files themselves:

- the highest `PRD-NNN` in use, and every retired one — they survive only as `(was PRD-NNN)`
  in PRD.md §9 and are **never reused**;
- the §6 capability sections, and which existing `PRD-NNN` sit in each;
- each file's `Downstream:` line — the documents this step may make stale;
- the release the PRD covers. PRD.md holds the **Phase 1 thin-core release** only; PRODUCT.md
  §4 and §7 hold what comes after it.

## Phase 2 — Audit

Report findings before proposing anything:

- **Covered** — existing `PRD-NNN` that already deliver part of the idea, quoted.
- **Changed** — existing `PRD-NNN` the idea would alter, and how.
- **New** — capability the idea needs that no requirement states.
- **Conflicts** — with PRD.md §9 Out of Scope, PRODUCT.md §6 Anti-Patterns, an NFR, or another
  requirement. A conflict is a decision for you, never resolved silently.
- **Release fit** — thin-core, a later release on the PRODUCT.md §7 roadmap, or wish-list. An
  idea that belongs after thin-core becomes a PRODUCT.md change and **no `PRD-NNN`**.

## Phase 3 — Decide the change set

Propose the change set as one table — **New**, **Changed**, **Prerequisite**, and any
**PRODUCT.md** change — and ask about it in one batch
([CLAUDE.md](../../../CLAUDE.md), "Ask, don't assume"). Where two cuts are genuinely open,
state the trade-off and let the human pick.

**Granularity — one `PRD-NNN` is one testable capability:**

- it sits in exactly one §6 capability section;
- it is small enough to become one work item — one `docs/work/` folder, one PR;
- it has one acceptance path. Two independent ways to pass it means two requirements;
- it states behaviour (`The system MUST …`), never implementation;
- it carries a MoSCoW priority — Must, Should, or Could.

**Prerequisites come first.** If a new requirement cannot be built until another exists — new
or changed — that one is a prerequisite: number it lower, list it first, and record the
dependency in its text and in §10 Dependencies & Assumptions.

Ask until the table is settled. Nothing is written before you approve it.

## Phase 4 — Write it, one document at a time

For each document the approved table touches — PRODUCT.md first, then PRD.md, because PRD.md
derives from PRODUCT.md:

1. Draft the edit:
   - **PRD.md §6** — new items appended to their capability section, numbered from the
     highest `PRD-NNN` + 1 in the order of the table (prerequisites first), in the section's
     exact form:
     `- **PRD-NNN** — _**<Title>**_ _(Must)_ — The system MUST …`.
     A changed item keeps its ID; a retired one moves to §9 as `(was PRD-NNN)`.
   - **PRD.md §4 / §5 / §7 / §8 / §9 / §10** — the feature line, user story, NFR, acceptance
     criterion, exclusion, and dependency each change implies. Every new requirement gets an
     acceptance criterion in §8; §5 says every feature maps to at least one story.
   - **The header** — the `Last updated:` date of each file touched.
2. Show it as a diff, name every file on that document's `Downstream:` line it may make stale,
   and wait for an explicit yes.
3. Commit it on its own:
   `docs(prd): <what changed> (idea <NNN>)` or `docs(product): <what changed> (idea <NNN>)`.

A downstream file that needs a change is **not** edited here unless `/doc-audit` (Phase 5)
names it — it is listed in the PR as follow-up.

## Phase 5 — `/doc-audit` (mandatory)

Invoke the `doc-audit` skill with no arguments: all three lenses, the whole corpus. This is not
optional and not skippable for a small change — a requirement edit is the change most likely to
leave ARCHITECTURE.md or TECH-STACK.md describing something the PRD no longer says.

Sort every finding into two groups:

- **Caused by this change set** — propose the fix as a diff, and on your yes commit it on its
  own, under the same Phase 4 rule. Then re-run `/doc-audit` on the files fixed.
- **Already there** — do not fix it here. It goes in the PR description under "Pre-existing
  findings", for a docs PR of its own.

If `/doc-audit` cannot run, stop: report why, and open no PR.

## Phase 6 — Ratify the idea

Fill §9 of the idea file, then set `**Status:** Ratified`:

```markdown
## 9. Ratified as

- **New:** PRD-053 — <title> (<§6 section>, Must)
- **Changed:** PRD-008 — <what changed>
- **Prerequisite:** PRD-053 before PRD-054
- **PRODUCT.md:** <section changed, or "none">
- **Not in PRD.md:** <anything placed on the PRODUCT.md roadmap instead, or "none">
- **Docs PR:** <filled in after Phase 7>
```

An idea fully covered by existing requirements is still ratified — `**Covered:** PRD-012,
PRD-014` and nothing new — so the next person finds the answer. `/work:3-epic` reads this list,
and gates on it being on `origin/main`, so `Ratified` means nothing until the PR merges.

Commit: `docs(work): ratify idea <NNN> as <PRD-NNN list>`.

## Phase 7 — Push and open the docs PR

```sh
git push -u origin docs/idea-<NNN>-<slug>
gh pr create --repo Cueserve/cs-cueviksync --base main --title "docs(prd): <idea title> (idea <NNN>)" --body "<body>"
```

Never force-push, never push to `main`, never merge.

The body carries:

- **What** — one paragraph: the idea, and what it became.
- **Change set** — the Phase 3 table, with final `PRD-NNN` numbers.
- **Downstream** — each file named in Phase 4, and whether it was changed here or is
  follow-up.
- **`/doc-audit`** — findings fixed here, and "Pre-existing findings" left for later.
- **Self-review** — the [CONTRIBUTING.md](../../../CONTRIBUTING.md) checklist, ticked against
  the diff.

Then add the PR link to the idea file's §9 `**Docs PR:**` line, commit, and push again.

Report and stop:

- the PR URL;
- the final `PRD-NNN` list — new, changed, prerequisite;
- what to run next: after you merge the PR, `/work:3-epic <NNN>`. If nothing new or changed
  reached PRD.md, there is nothing to file and the idea ends here.

Do not invoke `/work:3-epic`. It refuses to run until this PR is merged.
