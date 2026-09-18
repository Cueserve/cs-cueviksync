# Work artifacts

One folder per work item, holding the three artifacts of the Plan → Design → Build process —
`intent.md`, `spec.md`, `plan.md` — and a `README.md` that says which of them are done.
Everything here is **transient** — the folder is deleted
once its content has landed in code, in a migration, and in whatever permanent document it
feeds.

Naming is `YYYY-MM-DD-<issue#>-<slug>/`, for example `2026-09-18-041-contact-records/`. The
date is the day `/work:1-intent` ran; the number is the issue on the [CuevikSync
project](https://github.com/orgs/Cueserve/projects/17). **Every folder here carries an issue
number** — `/work:1-intent` files the issue when you do not give it one, so there is no work in flight
that the board does not know about.

## The three steps

Each step is its own command, its own session, and its own approval.

| Step      | Command          | Artifact    | Refuses to run when                                          |
| --------- | ---------------- | ----------- | ------------------------------------------------------------ |
| 1. Plan   | `/work:1-intent` | `intent.md` | an open question is neither answered nor explicitly deferred |
| 2. Design | `/work:2-spec`   | `spec.md`   | `intent.md` is missing or still `Status: Draft`              |
| 3. Build  | `/work:3-plan`   | `plan.md`   | `spec.md` is missing or still `Status: Draft`                |

A step reads only the previous artifact, never the conversation that produced it. That is the
point: an artifact a cold session cannot act on is not finished, and the session that executes
`plan.md` is the coldest one of all.

## What a folder holds

Four files. Three are the artifacts; the fourth is how you find your way back in.

```text
docs/work/2026-09-18-041-contact-records/
  README.md    preface + progression + what to run next
  intent.md    step 1
  spec.md      step 2
  plan.md      step 3
```

**The `**Status:**` line in each artifact's own header is the truth** — `Draft` or `Approved`.
A command writes its artifact as `Draft` and asks; `Approved` is only ever set by an explicit
human yes, which is what makes the next step's refusal mean something.

**The folder's `README.md` is the rollup**, regenerated from those headers by every command
that runs. It cannot drift, because nothing reads it to decide anything — it exists so that
opening the folder after two weeks away tells you where you are and what to type:

```markdown
# Contact and company records

**Work item:** [#41 PRD-008: Contact and company records](https://github.com/Cueserve/cs-cueviksync/issues/41)
**Board:** Ready
**Folder opened:** 2026-09-18

Person and Organization as first-class records, with the duplicate detection PRD-010 requires.
Scoped to the Print & Signage vertical; the painter's-company variant stays out.

## Progress

| Step      | Artifact               | Status   | Updated    |
| --------- | ---------------------- | -------- | ---------- |
| 1. Plan   | [intent.md](intent.md) | Approved | 2026-09-18 |
| 2. Design | [spec.md](spec.md)     | Draft    | 2026-09-18 |
| 3. Build  | [plan.md](plan.md)     | —        | —          |

**Next:** approve `spec.md`, or revise it and re-run `/work:2-spec`.
```

The preface is two to four sentences, written from the approved intent and refreshed by a later
step only if the framing actually changed.

## The board

The commands move the card on [project 17](https://github.com/orgs/Cueserve/projects/17) at the
two transitions that mean something. Both prompt before they run — nothing reaches the board
without an approval click.

| When                               | Status becomes | Because                                              |
| ---------------------------------- | -------------- | ---------------------------------------------------- |
| `/work:1-intent` files a new issue | `Backlog`      | it exists; nothing has been decided about it yet     |
| `intent.md` approved               | `Ready`        | it is an understood work item, not a line in the PRD |
| `plan.md` approved                 | `Working`      | shaping is done; it is buildable now                 |

`Testing`, `Reviewing`, `Blocked`, and `Done` are yours. They track what happens to the code,
which is past where these three commands stop.

## Authority

A file here is **not** a source-of-truth document. It is authoritative for its own work item
until that item merges, and carries no standing outside it: an `intent.md` cannot justify a
change to `docs/`, and a `spec.md` here does not outrank `docs/PRD.md`. Where one disagrees
with a `docs/` file, the `docs/` file wins and the disagreement is a defect in the artifact.

Because it is not source-of-truth, `docs/work/` is exempt from
[CONTRIBUTING.md](../../CONTRIBUTING.md)'s standalone-documentation-Pull-Request rule: these
three files ride in the feature Pull Request (PR) that implements them.

## Not `docs/brainstorming/`

`docs/brainstorming/` is open-ended, permanent exploration of a **topic**. It may contradict
the source-of-truth documents, it is never tied to a work item, and it is never a reason to
write code. A folder here is a **committed** work item: it has an issue number and a route to
merge.

If the question is still whether a thing should exist, that is brainstorming. Once you have
decided it should, run `/work:1-intent`.

See [docs/PROJECT-STRUCTURE.md](../PROJECT-STRUCTURE.md) §5 for the full document-kind table.
