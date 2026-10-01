---
description: Step 3 of 7 (Requirements) — file the epic and PBI issues for a ratified idea's requirements, linked as sub-issues with prerequisites as blocked-by
allowed-tools: Bash, Read, Glob, Grep, AskUserQuestion
argument-hint: "<idea#> | PRD-NNN [PRD-NNN ...]"
---

# Epic

Step 3 of the seven-step process ([docs/work/README.md](../../../docs/work/README.md)). Turn
requirements that are on `main` into work on the
[CuevikSync Tracker](https://github.com/orgs/Cueserve/projects/17): one product backlog item
(PBI) issue per `PRD-NNN`, each a sub-issue of the epic for its capability section, with
prerequisites linked as blocked-by.

**This command files issues. It writes no file and opens no PR.** Every write is to GitHub,
where the team sees it, so nothing is written before you approve the whole table in Phase 3.

Arguments (required): `$ARGUMENTS` —

- **An idea number** (`7` or `007`) — the IDs come from that idea's `## 9. Ratified as` list.
- **One or more IDs** (`PRD-053 PRD-008`) — for requirements that did not come through
  `/work:2-audit-prd`.
- **Empty → stop and ask.** A range (`PRD-053..PRD-060`) is refused: IDs are not grouped by
  section, and a range silently includes or skips the wrong ones.

**Local or cloud.** `echo "$CLAUDE_CODE_REMOTE"` — `true` means a cloud session. The cloud
GitHub proxy cannot reach Projects v2, so the cloud run skips every `gh project` call and
relies on the board's **Auto-add** workflow to pick the issues up; locally, Phase 5 adds them
itself. Everything else is the same in both.

---

## Phase 0 — The gate

1. `git fetch origin`. Read from `origin/main` only — never the working tree:

   ```sh
   git show origin/main:docs/PRD.md
   git ls-tree --name-only origin/main docs/work/brainstorming/ | grep "/<NNN>-"   # idea-number form
   git show origin/main:<that path>
   ```

2. **Idea number:** the file exists on `origin/main` and reads `**Status:** Ratified`. Missing
   → its docs PR has not merged; stop and say so. Take the IDs from its §9 — **New**,
   **Changed**, and **Prerequisite** lines. A §9 with only **Covered** or **Not in PRD.md**
   means there is nothing to file: say so and stop.
3. **Every ID** appears in `docs/PRD.md` on `origin/main` — as a §6 item, or as `(was PRD-NNN)`
   in §9 if it was retired. Any missing → stop and name it.

## Phase 1 — Read

For each ID, from `origin/main:docs/PRD.md`:

- its §6 capability section, title, priority, and requirement text;
- its §8 acceptance criterion;
- any prerequisite named in its text or in §10.

Then read the board side:

```sh
# an existing PBI for an ID (titles start "PRD-NNN:")
# (search is fuzzy, so keep only an exact "PRD-NNN:" prefix)
gh issue list --repo Cueserve/cs-cueviksync --state all --search "PRD-NNN in:title" --json number,title,state,url --jq '.[] | select(.title | startswith("PRD-NNN:"))'

# the epic a section belongs to: the parent of any existing PBI from that section
gh api repos/Cueserve/cs-cueviksync/issues/<pbi#>/parent --jq '{number, title, labels: [.labels[].name]}'

# every epic, for a section with no PBI yet
gh issue list --repo Cueserve/cs-cueviksync --label epic --state all --json number,title,body,labels
```

**Find a section's epic through the parent of a PBI already in it**, not by matching titles —
epic titles drift from §6 section names when a section is renamed. Note any such drift for the
report; renaming an epic is not this command's job.

The epic's labels, minus `epic`, are the module label its PBIs carry (`capture`, `crm`,
`pipeline`, `quoting`, `jobs`, `config`, `auth`).

If a changed ID's PBI already has a work folder — `docs/work/<issue#>-*/` on `origin/main` or a
remote branch — read the `**Status:**` of each artifact in it. Phase 5 reports it as stale.

## Phase 2 — Classify

Each ID is exactly one of:

- **New** — no PBI exists. File it, under the section's epic.
- **New, new section** — no PBI and no epic for its section. File the epic first. If no module
  label fits, propose one; creating a label is a write and goes in the table.
- **Changed, PBI open** — update its title and body to the PRD on `main`, and comment with the
  docs PR link.
- **Changed, PBI closed** — the shipped work no longer matches the requirement. Do not reopen
  on your own: propose either reopening it or filing a follow-up PBI, and let the human pick.
- **Retired** — comment with the docs PR link and close it as not planned, on your yes.
- **Already filed** — a PBI exists and matches the PRD text. Skip it. This is what makes a
  re-run after a partial failure safe.

## Phase 3 — Approve the table

Show one table — ID, class, title, epic, labels, blocked-by — and below it the exact title and
body of every issue to be created or edited. Ask once. On an explicit yes, and only then, write
anything. A partial yes (some rows) is fine; drop the rest.

Issue titles and bodies follow the existing ones exactly:

```markdown
<!-- PBI — title: PRD-NNN: <Title> (<Priority>) -->

**Priority:** <Must | Should | Could>

<§6 requirement text, verbatim>

**Acceptance criteria:** <§8 criterion, verbatim>

Source: docs/PRD.md PRD-NNN.
```

```markdown
<!-- Epic — title: Epic: <§6 section name> -->

Covers PRD.md <PS-n>: <one line from the §3 problem statement it answers>.

Requirements: PRD-NNN, PRD-NNN.

Source: docs/PRD.md §6 "<§6 section name>".
```

## Phase 4 — Write, in dependency order

Prerequisites first, so a blocked-by link always has an issue to point at.

```sh
# create
gh issue create --repo Cueserve/cs-cueviksync --title "<title>" --body "<body>" --label "<labels>"

# the numeric id the two link endpoints need — not the issue number
gh api repos/Cueserve/cs-cueviksync/issues/<n> --jq .id

# sub-issue of its epic
gh api -X POST repos/Cueserve/cs-cueviksync/issues/<epic#>/sub_issues -F sub_issue_id=<pbi id>

# blocked by its prerequisite
gh api -X POST repos/Cueserve/cs-cueviksync/issues/<pbi#>/dependencies/blocked_by -F issue_id=<prerequisite id>

# changed: update, then say why
gh issue edit <n> --repo Cueserve/cs-cueviksync --title "<title>" --body "<body>"
gh issue comment <n> --repo Cueserve/cs-cueviksync --body "Requirement changed in <docs PR url>."
```

When a PBI joins an existing epic, add its ID to that epic's `Requirements:` line with
`gh issue edit`.

**Locally only**, put every created issue on the board. Its Status stays at the project's
default; this command does not move cards:

```sh
gh project item-add 17 --owner Cueserve --url <issue url>
```

**In the cloud**, skip that call. If any other `gh` call fails, stop at once: report what was
written and what was not. A re-run classifies the written ones as **Already filed** and
finishes the rest.

## Phase 5 — Report

End with, and nothing after:

- every issue created, edited, or closed — number, title, URL — grouped by epic;
- the blocked-by links added;
- **cloud runs:** that the issues reach the board only if the CuevikSync Tracker's Auto-add
  workflow is on; if it is not, run `gh project item-add` locally for each URL above;
- **stale work folders:** each changed PBI that already has a `docs/work/` folder, with its
  artifact statuses — its intent or spec was written against the old requirement, and needs
  `/work:4-intent` or `/work:5-spec` re-run before it is built;
- any epic title that has drifted from its §6 section name;
- what to run next: `/work:4-intent <issue#>` for the first PBI that nothing blocks.

Do not invoke `/work:4-intent`. It is a separate session by design.
