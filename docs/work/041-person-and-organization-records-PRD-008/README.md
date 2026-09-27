# Person and Organization records

**Created:** 2026-09-18
**Work item:** [#41 PRD-008: Contact and company records (Must)](https://github.com/Cueserve/cs-cueviksync/issues/41)
**Board:** Backlog · `shaping`

CuevikSync has no way to store a customer — `tenants` and `profiles` are the only tables that
exist. This work item creates Person and Organization, the records every inquiry, opportunity,
and job attaches to, along with the five tenant-configurable lists they depend on. It stops at
the Server Action: no screen, so the tenant-isolation pattern the next eight tables will copy
gets tested before any user interface review is added on top.

## Progress

| Step      | Artifact               | Status   | Updated    |
| --------- | ---------------------- | -------- | ---------- |
| 1. Plan   | [intent.md](intent.md) | Approved | 2026-09-23 |
| 2. Design | [spec.md](spec.md)     | Draft    | 2026-09-27 |
| 3. Build  | plan.md                | —        | —          |

**Next:** re-approve `spec.md` and sign §8's three open boxes. `/work:3-plan` found that the
record policies let Operations reach every customer record and that a status could change
without a history row; §2.7 and §2.8 were rewritten, and `ci.yml` gains a Supabase stack.
