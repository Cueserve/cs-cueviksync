# Work artifacts

One folder per work item, holding the three artifacts of the Plan -> Design -> Build process:
`intent.md`, `spec.md`, `plan.md`. Everything here is **transient** — the folder is deleted
once its content has landed in code, in a migration, and in whatever permanent document it
feeds.

Naming is `YYYY-MM-DD-<issue#>-<slug>/`, for example `2026-09-18-041-contact-records/`. The
date is the day `/intent` ran; the number is the issue on the [CuevikSync
project](https://github.com/orgs/Cueserve/projects/17). **Every folder here carries an issue
number** — `/intent` files the issue when you do not give it one, so there is no work in flight
that the board does not know about.

## The three steps

Each step is its own command, its own session, and its own approval.

| Step      | Command   | Artifact    | Refuses to run when                                          |
| --------- | --------- | ----------- | ------------------------------------------------------------ |
| 1. Plan   | `/intent` | `intent.md` | an open question is neither answered nor explicitly deferred |
| 2. Design | `/spec`   | `spec.md`   | `intent.md` is missing or still `Status: Draft`              |
| 3. Build  | `/plan`   | `plan.md`   | `spec.md` is missing or still `Status: Draft`                |

A step reads only the previous artifact, never the conversation that produced it. That is the
point: an artifact a cold session cannot act on is not finished, and the session that executes
`plan.md` is the coldest one of all.

## Status

There is no state file. State is the folder listing plus the `**Status:**` line in each
header — `Draft` or `Approved`. Each command prints it on entry:

```text
docs/work/2026-09-18-041-contact-records/   (#41 — PRD-008: Contact and company records)
  intent.md   Approved
  spec.md     Draft
  plan.md     —
```

A command writes its artifact as `Draft` and asks. `Approved` is only ever set by an explicit
human yes — which is what makes the next step's refusal meaningful.

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
decided it should, run `/intent`.

See [docs/PROJECT-STRUCTURE.md](../PROJECT-STRUCTURE.md) §5 for the full document-kind table.
