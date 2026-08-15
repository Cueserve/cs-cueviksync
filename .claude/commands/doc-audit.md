---
description: Audit CuevikSync's docs and AI-instruction files across three lenses — product alignment, factual drift, and redundancy/absorption
allowed-tools: Read, Glob, Grep, Bash, Edit
---

# Doc Audit

Read CuevikSync's documentation corpus **once** and run three independent lenses over it:

- **A — Align** — where terminology, metrics, acceptance criteria, goals, and scope don't cohere,
  and where a section is missing rather than wrong.
- **B — Drift** — where the docs contradict each other, contradict the filesystem, or contradict a
  decision already taken.
- **C — Absorb** — where two files say the same thing twice, and which copy is better.

The letters are the recommended run order. `align` first, because it settles concept names and the
other two passes produce sharper findings once terms are fixed. `absorb` last, because it is the
only pass that proposes deleting files and the least useful while terms are still unsettled.

**CuevikSync is docs-heavy and code-light.** The app is scaffolded — `package.json`, `src/`,
and `supabase/` exist — but it is a shell: the token layer, the 18 `ui/` primitives, the app
chrome, the Supabase client modules, and two migrations that create the tenancy substrate. There
are no Server Actions, no domain screens, and no domain tables. So most of what the corpus
describes is still specification, and every line of it becomes an instruction the moment the
matching code is written. A stale line here is not a typo — it is a wrong instruction that will
be built.

Ground truth is the **filesystem** plus the corpus's own **declared lineage graph** (§2). Use
them; do not invent a third source. Where code exists, it outranks prose about it — a doc
claiming a file, script, or table exists loses to `ls` and to `supabase/migrations/`.

Arguments (optional): `$ARGUMENTS`

- `align` · `drift` · `absorb` — run one pass only. No argument runs all three, in that order.
- `docs-only` — skip §4B, the only section that probes the filesystem, and judge prose against
  prose. Faster, and it changes nothing else about the passes that run.
- `fix` — after reporting, apply the **Safe** tier (step 8). Never applies an `absorb` finding.
- a path (e.g. `docs/PRD.md`) — restrict to claims made **by or about** that file.

Combine freely: `/doc-audit align docs/PRD.md`, `/doc-audit drift fix`,
`/doc-audit drift docs-only`.

---

## 1. The corpus — read these, nothing else

Read every file below once, in this order, before reporting anything. Do not read `src/`
except where Pass B explicitly probes it.

**Source-of-truth documents** (`docs/`, by lineage):

1. `docs/PRODUCT.md` — the top of the lineage. Terminology canon.
2. `docs/PRD.md` — testable requirements.
3. `docs/ARCHITECTURE.md` — structure and design decisions.
4. `docs/TECH-STACK.md` — approved technologies.
5. `docs/ENGINEERING-RULES.md` — coding conventions, banned patterns, testing.
6. `docs/PROJECT-STRUCTURE.md` — directory layout and placement rules.
7. `docs/DESIGN-SYSTEM.md` — brand tokens and the accessibility floor.
8. `docs/DATABASE.md` — the data model. Currently a stub.
9. `docs/ENVIRONMENTS.md` — which Supabase environment development targets.

**Governance and agent config:**

11. `CONTRIBUTING.md` — branching, commits, the self-review gate.
12. `CLAUDE.md` — agent behaviour, scope, escalation, off-limits.
13. `README.md` — restates; owns nothing.

**Transient specs** — read whatever is in `docs/specs/`, and cross-check it against the
"Approved design specs" list in `CLAUDE.md`. A spec not in that list, or a listed spec that no
longer exists, is a Pass B finding on its own.

**Not the corpus:** `docs/brainstorming/` (never authoritative) and `docs/reviews/` (dated
advisory records — do not report them as drift against current state).

## 2. Authority ladder — who wins when two files disagree

CuevikSync states its own lineage in every doc header (`Derived from:` / `Downstream:`). That graph
is the ladder; do not substitute intuition for it.

```text
PRODUCT.md  (starting point — owns vision, scope, non-goals)
   └─> PRD.md  (owns requirements PRD-NNN and NFR-NNN, acceptance criteria)
         ├─> ARCHITECTURE.md  (owns structure, boundaries, invariants)
         │     └─> TECH-STACK.md  (owns approved technologies and versions)
         │           └─> ENGINEERING-RULES.md  (owns conventions, banned patterns, testing)
         └─> README.md  (owns nothing — restates)
```

Apply top-down. The higher entry is right by construction; the lower one is the defect.

1. **Filesystem and git.** A doc claiming a file exists loses to `ls`. No exceptions.
2. **CONTRIBUTING.md** for governance — branching, commits, review flow, the tooling command table.
   `CLAUDE.md` "Workflow" explicitly subordinates itself here and says it MUST NOT diverge.
3. **Tier 2 docs among themselves, by the graph above.** A fact loses to the doc that derives
   _upstream_ of it. Scope loses to PRODUCT; a requirement number loses to PRD; a structural
   invariant loses to ARCHITECTURE; a version or package loses to TECH-STACK.
4. **CLAUDE.md** — owns every agent-behavior rule: scope boundaries, decision escalation,
   off-limits paths, and workflow constraints. It also _imports_ `docs/ENGINEERING-RULES.md`.
   Where it restates an imported or upstream doc, that doc wins; on agent behavior CLAUDE.md is
   the sole owner and nothing in `docs/` may contradict it.
5. **README.md** — owns nothing. It loses every tie.
6. **Tier 3** — never authoritative.

Three exceptions, all deliberate:

- **"Pending scaffold" blocks are honest, not wrong.** `README.md` marks unverified sections
  explicitly. A command in one of those blocks that has never been run is _labelled_ as such —
  that is correct behavior, not drift. Drift is when the label is missing or the block claims
  verification that did not happen.
- **A doc specifying intent the repo hasn't built yet is not wrong.** Distinguish "the doc lies
  about what exists" (finding) from "the doc specifies what should exist" (backlog — belongs in
  the [Cueserve GitHub Project](https://github.com/orgs/Cueserve/projects/17) or a GitHub Issue,
  not this report). When unsure, say which reading you took.
- **The ladder ranks authority, not quality.** A lower-rung file can hold a _better_ explanation of
  a fact it doesn't own. That is not a drift finding — it is an `absorb` finding (step 5), and the
  fix runs **upward**. Never delete a superior explanation because of where it lives.

---

## PASS A — Align

_Skip entirely under `drift` or `absorb`. This pass judges coherence and completeness, not truth._

## 3A. Terminology — PRODUCT.md is canon

With no schema to anchor terms, **first use in `docs/PRODUCT.md` is the canonical form**, and
`README.md` "Key Concepts" is the glossary that must match it.

CuevikSync's domain terms carry deliberate distinctions that collapse easily under sloppy prose:

- **Inquiry** vs **Opportunity** — pre-qualification vs in-pipeline. A doc using "lead" or "deal"
  as though they were interchangeable with either is a finding; `README.md` marks both as informal.
- **Intake Receiver** / **Ingestion Worker** / **Primary Application** — three named runtime roles.
  Any fourth name for one of them is a finding.
- **Tenant isolation** — the enforcement locus is RLS in Postgres, never the app layer. Prose that
  describes it as application-enforced contradicts a non-negotiable invariant (see 3B).
- **Thin-core** / **Phase 1** / **Phase-01** — pick one; they are used interchangeably today.

Method: extract candidate concept nouns, `grep -i` each across the corpus, capture every surface
form, and report each cluster with its variants, counts, and `file:line` for the minority forms.

Three outcomes, not interchangeable: **cosmetic variant** (same concept, different spelling — low
impact, and hyphenation as a compound modifier is correct, not a defect) · **competing term** (a
second word for the same thing — medium-to-high; a reader cannot tell synonym from distinct entity)
· **no anchor** (a term PRODUCT.md never uses — report **unresolved** and name who decides; never
invent a canon).

## 3B. Requirements, metrics, and acceptance criteria

- Every success criterion in `docs/PRODUCT.md` §5 maps to at least one `PRD-NNN` or `NFR-NNN`. An
  unmapped criterion is a goal nobody is building toward.
- Every `PRD-NNN` and `NFR-NNN` has acceptance criteria, and they are **testable** — a number, a
  state, or an observable behavior. "Fast", "intuitive", "reliable" are findings.
- **Every requirement ID cited anywhere resolves.** `PRD-025`, `NFR-008`, `NFR-010` and friends are
  cited across ARCHITECTURE, TECH-STACK, ENGINEERING-RULES, and `.claude/commands/`. A citation to a
  renumbered or non-existent ID is worse than a broken link — it reads as verified.
- Numbers agree across files: the 24-hour Recovery Point Objective (NFR-010), the 8-business-hour
  recovery target (NFR-013), 50,000 records / 10 concurrent users (NFR-006), the 50 MB Vercel
  function limit, the WCAG 2.1 AA level, the sub-1-hour first-response target. A number stated
  twice with two values is High impact by default.
- An acceptance criterion satisfiable by an app-layer check where ARCHITECTURE requires database
  enforcement is a **P0** — it authorizes the exact thing the invariant forbids.

## 3C. Missing sections

Pass B only compares things that exist. This is where a _gap_ gets caught.

- A requirement with no acceptance criteria.
- A `Downstream:` document that never actually reflects the upstream fact.
- A banned pattern in ENGINEERING-RULES §2 with no decision in ARCHITECTURE or TECH-STACK behind
  it — §2 claims every entry traces to one.
- A command in `CONTRIBUTING.md`'s tooling table with no tool backing it in TECH-STACK, or a tool
  in TECH-STACK with no way to invoke it.
- A deferred/blocked decision with no named decider and no statement of what unblocks it.
- An explicitly unfinished block — e.g. `CONTRIBUTING.md`'s
  `DEVELOPMENT-PHASE-GOVERNANCE` marker — that is now overdue rather than merely pending.

Report a gap as **Missing**, not a contradiction, and say which file should own the new section.

## 3D. Goals vs. scope vs. mechanism

Walk `PRODUCT.md` goals → `PRD.md` scope → `ARCHITECTURE.md` mechanism → `TECH-STACK.md` tooling.
Flag: a stated goal with no mechanism · a mechanism serving no stated goal (usually crept scope) ·
PRD scope contradicting a PRODUCT non-goal · a user-facing claim in README or PRODUCT that the
Phase 1 thin-core scope cannot support. Phrase the last as the user would experience it.

## 3E. Impact and urgency

Every finding in **any** pass carries a second rating, independent of the P0–P2 axis:

- **High** — an engineer builds the wrong thing from it, or a user hits a false promise.
- **Medium** — costs review time, causes rework, or forces a reader to guess.
- **Low** — cosmetic; no decision changes.

State impact as a **consequence**, not a category: _"the scaffold will stand up a local Docker
stack the project decided against"_ — not _"environment inconsistency."_

## 3F. Next steps

Close Pass A with three lists, each actionable without re-reading the report: **checks to run**
(the command, and what a pass would prove) · **who decides** (for every unresolved item — product
decisions are not coding tasks; say so rather than proposing a default) · **replacement snippets**
(for each High finding, the exact sentence to drop in — the text, not a description of the edit).

---

## PASS B — Drift

_Skip entirely under `align` or `absorb`._

## 4A. Doc vs. doc

For each fact class, extract every statement across the corpus and compare. These are the classes
where this repo has drifted or is structurally likely to:

- **The document index.** `README.md` § Further Reading is the **only** index of the document set —
  the per-document `## Document References` tables were deleted on 2026-08-09 precisely because
  five copies of one list is five things to keep in sync. Check that the index is complete and
  every link resolves. **If a copy of that table reappears in any `docs/` file, that is a
  regression finding**, not a fact to reconcile.
- **The lineage headers.** Every `Derived from:` / `Downstream:` pair must be reciprocal: if A
  lists B downstream, B must list A as derived-from. A one-way edge is a finding.
- **Supabase environment posture.** Local stack vs linked hosted project. This determines whether
  `db reset` exists as a recovery path, and therefore whether the migration-immutability hook's
  premise holds. Every file naming a Supabase workflow must agree.
- **The command surface.** `CONTRIBUTING.md`'s tooling table vs `README.md`'s Install & Run vs
  `.claude/commands/*.md`. A command invoked anywhere but absent from the table is a finding
  against the table, not against the caller.
- **Approved stack and versions.** Next.js 16 / React 19 / Node 22 LTS / TypeScript 5.x /
  Postgres 17 and the rest. TECH-STACK owns these; a version stated elsewhere loses.
- **Banned patterns and off-limits paths.** ENGINEERING-RULES §2 and CLAUDE.md "Off-limits" vs what
  `.claude/settings.json` actually enforce. A rule stated in prose but not machine-enforced is not
  automatically a defect — but a rule _claimed_ to be enforced that isn't, is.
- **Governance.** Branch prefixes, Conventional Commit types, the never-push-to-`main` rule, the
  self-review gate. CONTRIBUTING owns all of it; CLAUDE.md "Workflow" points at it and says so.
- **Cross-references.** Every relative link and every `§` / `PRD-NNN` / `NFR-NNN` citation: does
  the target file exist, and does the cited section say what the citing file claims?

## 4B. Doc vs. reality _(skipped under `docs-only`)_

Each probe turns a prose claim into a command. Run the probe; the output wins.

| Claim in prose                                                   | Probe                                                                                                                                                                            |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A directory exists (`app/`, `supabase/`, `.github/`, `.claude/`) | `ls` it. `README.md` §Project Structure makes explicit exists-today claims                                                                                                       |
| A named `npm run X` exists                                       | read `scripts` in `package.json` — absent today, so **every** script claim is unverified by definition                                                                           |
| `.env.example` keys match the README table                       | read `.env.example` (never `.env`)                                                                                                                                               |
| Migration set and numbering                                      | `ls supabase/migrations/` — compare to any doc enumerating them                                                                                                                  |
| Permissions are machine-enforced                                 | `permissions.deny` / `permissions.ask` in `.claude/settings.json` really contain the claimed patterns                                                                            |
| The migration hook fires                                         | the hook file exists **and** `settings.json` uses the shell form (`"command": "node path/to.mjs"`). A wrong form silently never fires — indistinguishable from one that approved |
| CI gate contents                                                 | `.github/workflows/` — `CONTRIBUTING.md` describes two jobs; verify they exist before repeating the claim                                                                        |
| A relative link resolves                                         | resolve every `](` path in the corpus against the filesystem                                                                                                                     |
| "Last updated" is honest                                         | `git log -1 --format=%ad -- <file>` vs the stamp in the file                                                                                                                     |

**Date staleness.** Every `Last updated:` stamp: compare it to the last commit touching that file.
A stamp older than the content it vouches for is a finding on its own. Several Tier 2 docs carry
`2026-07-18` — check each against git rather than assuming.

**Decisions taken but not written down.** A decision made in conversation and acted on in the repo,
while the docs still describe the superseded option, is the highest-value Pass B finding and the
one no automated check catches. Where you can identify one, name the decision, the file that still
contradicts it, and who confirmed it.

---

## PASS C — Absorb

_Skip entirely under `align` or `drift`. The only pass that proposes deletions, and none of its
output is ever auto-applied._

## 5A. Find the duplicates

Pass B finds files that **disagree**. This finds files that **agree** — its own defect, because two
copies of one fact drift on the next edit and only one gets updated.

For each fact class in 4A, ask: how many files _state_ it, versus the one that _owns_ it (ladder
rung 3)? Flag any fact stated substantively in two or more places. The usual sources here are
`README.md` restating `docs/`, and `CLAUDE.md` restating a `docs/` file it imports rather than owns.

Not every restatement is a defect — a one-line pointer with a link is the correct pattern. The line
is **whether a reader could act on the copy alone**. If yes, it is a duplicate and will drift.

## 5B. Compare quality, not position

For each duplicate cluster, judge which copy is better on **completeness** (covers the edge case,
the failure mode) · **the "why"** (states the reason, not just the rule — this corpus's convention
is that rationale travels with the rule) · **currency** · **precision** (names the mechanism rather
than gesturing at it).

**The better copy frequently sits in the lower-authority file**, because README and adapters get
rewritten more often than owner docs. When that happens the fix is a **merge upward**: move the
superior content into the owner, reduce the duplicate to a one-line pointer. Ruling the richer text
"wrong because README" would destroy the best explanation in the repo — the failure mode this pass
exists to prevent.

## 5C. Absorption candidates

Tier 3 is transient by design. For each `docs/brainstorming/*.md` and `docs/reviews/*.md`,
determine per-section whether it is **fully absorbed** into its Tier 2 target, **partly absorbed**,
or **not yet**. A review whose findings are all marked resolved _and_ verified present in the
target is deletable; one with an open finding is not.

Also flag the reverse: a Tier 3 section contradicting what actually landed. The landed doc wins,
and the Tier 3 text needs a resolution note before anyone reads it as current.

Deleting any file means removing every reference to it — `README.md` § Further Reading, every
`Derived from:` / `Downstream:` line naming it, and any inline link — **in the same change**.
Propose both halves or neither.

---

## 6. Known-open findings, for calibration

**No known-open findings as of 2026-08-09.** That is not a claim the corpus is clean — it means
every finding this list has carried was resolved. Start each run from the filesystem, never from
this section.

**Resolved on 2026-08-09 — do not re-report these as new discoveries.** If one reappears it is a
**regression**, and should be reported as one:

- **Supabase environment posture.** Development targets a linked hosted project; the local stack
  (`npx supabase start`) serves automated tests and CI only; migrations apply merge-then-push.
  Recorded in `docs/ENVIRONMENTS.md`.
- **Tooling-table gaps.** `npx supabase link`, `db push --linked`, and
  `gen types typescript --linked` are rows in the `CONTRIBUTING.md` command table.
- **Duplicate Document References tables.** Five copies deleted; `README.md` § Further Reading is
  the single index.
- **`AI-TOOL-GUIDE.md`.** Split and deleted — agent-behavior rules moved into `CLAUDE.md`,
  engineering rules became `docs/ENGINEERING-RULES.md`, and the documentation-change process moved
  to `CONTRIBUTING.md`. **No file by that name should exist**, and no doc should cite it.
- **CLAUDE.md asking Claude to read its own rules.** It imports them with
  `@docs/ENGINEERING-RULES.md`. A reversion to "read this file first" is a regression.

## 7. Report format

One report, sectioned by pass, in A → B → C order. Within each section, order by blast radius —
**a wrong instruction outranks a wrong description.**

Two axes, both stated. They are not the same thing; a finding can be P2/High or P0/Low.

- **Correctness priority** — P0: contradicts a non-negotiable invariant, or would produce wrong
  code or a wrong scaffold if followed. Anything in Tier 1 is P0 by default. · P1: factual drift a
  developer would act on. · P2: cosmetic.
- **Product impact** — High / Medium / Low per 3E, stated as a consequence.

Per finding, exactly this:

```text
[B-P0 · High] <one-line claim in conflict>
  Says X:  path/to/file.md:LINE — "<quote>"
  Says Y:  path/to/other:LINE — "<quote>"
  Ruling:  <which is authoritative, and which ladder rung says so>
  Impact:  <what goes wrong for an engineer or a user, concretely>
  Fix:     <the exact replacement text>
  Tier:    Safe | Approval
```

Prefix with the pass: `A-` align, `B-` drift, `C-` absorb. Pass A gaps use `MISSING` instead of a
priority code. Pass C findings use `DUPLICATE`, `MERGE-UP`, or `ABSORBED`.

End with: findings by pass and priority · **files audited vs files in the corpus** — if you skipped
one, name it · the three Pass A next-step lists (3F) · a one-line recommended fix order.

A report that silently covered less than it claims is the same defect as the docs it is auditing.

## 8. Fixes — two tiers, and the line between them

**Safe** (applied under `fix`, reported otherwise): a broken relative link, a stale date stamp, or
an edit inside `README.md` where the losing file is provably restating an owner and the fix is to
copy the owner's wording. README owns nothing, so correcting it is transcription, not a decision.

**Approval** (never auto-applied, even under `fix`): anything editing `docs/`, `CONTRIBUTING.md`,
`CLAUDE.md`, or `.claude/**`; every terminology rename; and **every Pass C finding without
exception**. [CONTRIBUTING.md](../../CONTRIBUTING.md) "Documentation changes" is explicit — a change to a
source-of-truth document is a standalone approved change with its downstream documents named,
never folded into other work. This command is other work.

Present each Approval-tier fix as a diff and stop.

## Never

- Read, print, or quote `.env` or `.env*.local`. `.env.example` only.
- Inline-edit a `docs/` file, `CONTRIBUTING.md`, or `CLAUDE.md` during an audit run. §6 forbids it
  regardless of how obvious the fix looks.
- Edit a file under `supabase/migrations/` committed to `HEAD`. The `PreToolUse` hook blocks it,
  but the rule stands alone: a wrong applied migration is fixed by a **new** migration.
- Rewrite a doc to match the repo when the doc is a **specification** of work not yet done. That
  erases the requirement — route it to the
  [Cueserve GitHub Project](https://github.com/orgs/Cueserve/projects/17) or a GitHub Issue.
- Treat a `Tier 3` brainstorming or review file as authoritative over a Tier 2 doc.
- Treat a labelled "Pending scaffold — unverified" block as drift. The label is the correct
  behavior; a _missing_ label is the finding.
- Delete a Tier 3 file on partial absorption, or without removing every reference to it in the
  same change.
- Discard the better explanation because it sits in the lower-authority file. Merge it upward.
- Pick a canonical term with no `PRODUCT.md` precedent. Report it unresolved and name the decider.
- Edit a memory file under `~/.claude/projects/.../memory/`. Report the conflict; the user owns it.
- Resolve a contradiction by inventing a third answer. If neither side is verifiable from the
  filesystem or the lineage graph, report it unresolved.
