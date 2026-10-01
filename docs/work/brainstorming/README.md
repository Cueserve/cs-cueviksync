# Brainstorming

Ideas on their way to becoming requirements. Nothing here is authoritative.

A file here may contradict the source-of-truth documents in `docs/` — that is what it is for.
An idea becomes binding only when `/work:2-audit-prd` ratifies it into
[docs/PRODUCT.md](../../PRODUCT.md) or [docs/PRD.md](../../PRD.md), and from then on those
files are the authority, not this one.

**Do not cite a file in this folder as a reason to write code.**

## One file per idea

Naming is `<NNN>-<slug>.md`, for example `005-repeat-order-reminders.md`. `NNN` is the idea
number: one more than the highest in use, counted across `main` **and** the open
`docs/idea-<NNN>-<slug>` branches, so two ideas in flight never share one. It is an idea
number, not an issue number — `/work:2-audit-prd 005` means idea 5, while `/work:4-intent 41`
means issue #41.

`/work:1-brainstorm` writes the file on its own `docs/idea-<NNN>-<slug>` branch and pushes it.
It reaches `main` in the docs PR that `/work:2-audit-prd` opens on that same branch, alongside
the requirement change it produced.

## Status

The `**Status:**` line in the file's header is the truth. Only an explicit human answer sets
it.

| Status     | Means                                                       | Set by               |
| ---------- | ----------------------------------------------------------- | -------------------- |
| `Draft`    | still being explored; `/work:1-brainstorm <NNN>` resumes it | `/work:1-brainstorm` |
| `Approved` | it should exist, in the recommended shape                   | `/work:1-brainstorm` |
| `Rejected` | it should not; §5 says why                                  | `/work:1-brainstorm` |
| `Ratified` | turned into requirements; §9 lists the `PRD-NNN`s           | `/work:2-audit-prd`  |

`/work:2-audit-prd` runs only on `Approved`. `/work:3-epic` runs only on `Ratified`, read from
`main`.

A `Ratified` or `Rejected` file stays as the record of the decision, so the next person with the
same idea finds the answer. `/doc-audit` treats this folder as never authoritative.

## The first four

`001`–`004` predate this process. They are topic research — AI features, the system module
map, and two open-source landscapes — rather than single ideas, and stay `Draft`. Mine them
with `/work:1-brainstorm` for ideas of their own; do not ratify them whole.

See [docs/work/README.md](../README.md) for the full workflow, and
[docs/PROJECT-STRUCTURE.md](../../PROJECT-STRUCTURE.md) §5 for where each kind of document
lives.
