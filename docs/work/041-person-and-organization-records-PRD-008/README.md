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
| 2. Design | [spec.md](spec.md)     | Approved | 2026-09-23 |
| 3. Build  | plan.md                | —        | —          |

**Next:** run `/work:3-plan`. `spec.md` is approved and every §8 box is ticked.
