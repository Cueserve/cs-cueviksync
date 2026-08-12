---
description: Push pending Supabase migrations to the linked project, regenerate types, and verify
allowed-tools: Bash, Read, Glob, Grep
---

# DB Migrate

Apply CuevikSync's pending `supabase/migrations/*.sql` to the **linked hosted Supabase project**
and leave the repo in a verified, type-synced state.

Development runs against a linked hosted Supabase project
([docs/ENVIRONMENTS.md](../../docs/ENVIRONMENTS.md) §1); the local stack exists for tests and CI
only. There is no `db reset` on the hosted project, so every push is irreversible against real
data and the pre-flight below is not optional ceremony.

Migrations are applied **after** merging to `main`, never before (CONTRIBUTING.md § Migration
ordering). If the migration you are about to push is not yet on `main`, stop and say so.

**A schema or migration change requires explicit human approval before it is authored at all**
([CLAUDE.md](../../CLAUDE.md) "Decision escalation"), and `supabase/migrations/` is off-limits to
autonomous edits (CLAUDE.md "Off-limits"). This command applies migrations a human has already approved — it is not a
license to write them.

Arguments (optional): `$ARGUMENTS` — pass `dry-run` to stop after step 3 and report only.

---

## 1. Pre-flight — stop and report if any check fails

1. `git status --short supabase/migrations/` — list what is unstaged/untracked, and name every
   pending file. Never push a migration the user has not seen.
2. Confirm the project is linked: `supabase/.temp/project-ref` exists. If not, stop — the user
   must run `npx supabase link` themselves (it needs their credentials, and
   [CLAUDE.md](../../CLAUDE.md) "Off-limits" keeps credentials out of scope).
3. **Read every pending migration file before pushing it.** A migration is irreversible against a
   hosted database. Specifically flag, and stop for confirmation, if any contains:
   - `drop table`, `drop column`, `truncate`, `alter column ... type`, or `delete from`
   - a change to a file already present in `origin/main` — the `block-applied-migration` hook denies
     that edit for a reason; if one reached the working tree anyway, treat it as a divergence
     and stop.
   - **an RLS policy change** — CuevikSync's tenant isolation is a database guarantee
     ([ARCHITECTURE.md](../../docs/ARCHITECTURE.md), NFR-008). A weakened policy leaks across
     tenants silently. Name the policy, the table, and what the change permits that it did not
     before.
4. If any destructive statement is present, take a dump first — PRD NFR-010 sets a 24-hour
   Recovery Point Objective and NFR-013 an 8-business-hour recovery target; neither survives an
   un-backed-up destructive push:

   ```bash
   npx supabase db dump --linked -f backup-<YYYYMMDD>.sql
   ```

   That filename MUST NOT land in git. Confirm it is ignored or removed before any commit.

## 2. Confirm before writing

State plainly: which files will apply, in what order, and that the target is the **hosted**
project. Get an explicit yes before step 3.

## 3. Dry run

```bash
npx supabase db push --linked --dry-run
```

Read the output. Common failures and what they mean:

- **Naming rejected** — the CLI expects a 14-digit UTC timestamp prefix. If the repo has settled
  on a different scheme, rename all files to one consistent scheme in a single change rather than
  mixing the two — and record the convention in a documentation change of its own
  ([CONTRIBUTING.md](../../CONTRIBUTING.md) "Documentation changes"), never inline here.
- **Connection refused / project paused** — Supabase free-plan projects pause after a week idle.
  Tell the user to resume it in the dashboard; do not retry in a loop.
- **`pgmq` / `pg_cron` missing** — the capture path depends on both extensions
  ([docs/ENVIRONMENTS.md](../../docs/ENVIRONMENTS.md) §3). Enabling an extension is itself a
  schema change requiring approval (CLAUDE.md "Decision escalation"). Stop and report.

Stop here if `$ARGUMENTS` contains `dry-run`.

## 4. Push, then regenerate types

```bash
npx supabase db push --linked --yes
npx supabase gen types typescript --linked > <generated-types-path>
```

Type regeneration is not optional — [TECH-STACK.md](../../docs/TECH-STACK.md) §4 makes the
generated types the type-safety path in a no-ORM stack, and
[ENGINEERING-RULES.md](../../docs/ENGINEERING-RULES.md) §1 requires regenerating after any schema change.
A schema that moved without its types leaves every `supabase-js` call lying about its shape.

> `<generated-types-path>` is not fixed yet — it is set when the app is scaffolded. Read the
> actual path from the repo rather than guessing; if it does not exist yet, report that instead
> of inventing one.
>
> Neither `supabase db push` nor `supabase gen types typescript` appears in the
> [CONTRIBUTING.md](../../CONTRIBUTING.md) Tooling-layer command table. That is a documentation
> gap, not permission to invent an `npm` script — report it so it can be fixed as its own
> documentation change (CONTRIBUTING.md "Documentation changes").

## 5. Verify

1. `npx supabase db push --linked --dry-run` again — it MUST report nothing pending.
2. `git status --short` — show what the type regeneration changed.
3. If the app is scaffolded, run the blocking gate from
   [CONTRIBUTING.md](../../CONTRIBUTING.md): `npm run lint`, `tsc --noEmit`, `npm run test`.
   A type regeneration that breaks the type-check is the whole reason this step exists.
4. If the migration touched RLS, state explicitly whether a tenant-isolation test covers it —
   [ENGINEERING-RULES.md](../../docs/ENGINEERING-RULES.md) §3 makes cross-tenant read/write coverage
   mandatory, not optional.

## 6. Report — do not commit or push

Summarize: files applied, extensions/policies touched, types regenerated (yes/no + diff summary),
gate result, and anything left pending.

**Do not commit, and do not push to any remote.** Both are human actions
([CLAUDE.md](../../CLAUDE.md) "Workflow"). State the suggested Conventional Commit
message and stop.
