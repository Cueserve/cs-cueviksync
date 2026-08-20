---
description: Apply migrations that are already merged to main to the linked Supabase project, regenerate types, and verify the invariants the SQL cannot prove
allowed-tools: Bash, Read, Glob, Grep
argument-hint: "[check|prod]"
---

# DB Migrate

Apply CuevikSync's pending `supabase/migrations/*.sql` to the **linked** Supabase project and
leave the repo in a verified, type-synced state.

**This command applies. It does not review, and it does not decide.** A schema or migration
change requires explicit human approval before it is authored at all
([CLAUDE.md](../../CLAUDE.md)), and `supabase/migrations/` is off-limits to autonomous edits.

**Nothing is pushed until it is on `origin/main`.** Phase 1 is a hard gate, not a warning.
Migrations apply after merging, never before
([docs/ENVIRONMENTS.md](../../docs/ENVIRONMENTS.md), "Migration ordering"), so a migration
still on a branch has nothing to do here. This closes the drift case where someone pushes from
a branch that is later rebased, renamed, or abandoned, leaving the database holding a version
whose file exists nowhere on `main`.

Arguments (optional): `$ARGUMENTS` —

- `check` — stop after Phase 3 step 1 and report. Applies nothing, dumps nothing.
- `prod` — required to target a ref labelled `prod` in `supabase/.project-refs.json`. Without
  it, a non-`dev` ref aborts. There is no prod project today; this exists so that adding one
  later changes nothing about this command's safety.

Every phase below is a stop point. A failed check ends the run and reports — it never
downgrades to a warning and continues.

---

## Phase 0 — Environment identity guard

1. Confirm this is a git repo; record the current branch.
2. Confirm the Supabase CLI is reachable and a project is linked — `supabase/.temp/project-ref`
   exists. If not, stop: the user runs `npx supabase link` themselves, because it needs their
   credentials and credentials are out of scope here.
3. Read the ref from `supabase/.temp/project-ref`.
4. Read `supabase/.project-refs.json` and look the ref up. **A ref that is not in that file is
   an abort.** Fail closed — `.temp/` is gitignored and `supabase link` rewrites it silently, so
   the linked ref is local mutable state and cannot be trusted on its own.
5. Resolve the label. If it is not `dev`, abort unless `$ARGUMENTS` contains a matching target
   (`prod`). Prod is never the default; it is reachable only by naming it.

State the ref, its label, and its name before going further.

## Phase 1 — Merge gate (hard stop)

1. `git fetch origin main`. **If the fetch fails, abort.** A stale `origin/main` makes every
   check below pass for the wrong reason — it is the same false-allow that
   `.claude/hooks/block-applied-migration.mjs` has.
2. Set **A** = `supabase/migrations/*.sql` on disk.
3. Set **B** = `git ls-tree -r origin/main --name-only -- supabase/migrations/`.
4. Collect blockers, each named with its file and its reason:
   - **untracked** — on disk, unknown to git
   - **staged-not-committed** / **modified** — from `git status --porcelain -- supabase/migrations/`
   - **committed-not-merged** — in A and tracked, absent from B
   - **content-drift** — in both A and B but differing (`git diff origin/main -- supabase/migrations/`).
     Treat this as serious: `db push` compares recorded versions, not file contents, so an
     edited-after-merge migration is skipped silently while reading as though it landed.
   - **deleted-locally** — in B, missing from A. A migration history rewrite, not a cleanup.
5. **Any blocker ends the run.** Print the file/reason list and the remedy — commit, open the
   PR, merge to `main`, re-run. No push, no dump, no partial work. Exit non-zero.
6. Clean: state "N migration files, all present in `origin/main` at identical content."

## Phase 2 — Determine what is pending

```bash
npx supabase migration list --linked
```

Read each row:

- **`local` and `remote` both set** — applied. Normal.
- **`local` set, `remote` empty** — pending. This is the set to apply.
- **`remote` set, `local` empty** — a version on the database with no file behind it. **Report
  it and require acknowledgement before continuing.** Phase 1 prevents this going forward but
  cannot fix it retroactively; it means a dashboard edit (prohibited by
  [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) §5) or a deleted file. Never run
  `migration repair` to make it quiet.

If nothing is pending: regenerate types (Phase 6 step 2), run the gate (Phase 7), report
"nothing to apply", and stop. The type regeneration still matters — it is the one step no other
part of the workflow performs.

Flag out-of-sequence work: the files use an `NNNN_` prefix
([docs/PROJECT-STRUCTURE.md](../../docs/PROJECT-STRUCTURE.md) §5), not the CLI's 14-digit UTC
timestamp, so a pending number lower than the highest already-applied one is a real ordering
problem. The push will still run it; say so rather than letting it pass.

## Phase 3 — Classify, then back up

1. **Read every pending file.** Classify each as destructive, RLS-affecting, a data migration,
   or additive-only. Destructive means `drop table`, `drop column`, `truncate`, `delete from`,
   `alter column ... type`, `set not null` on an existing column, `drop policy`, or a rename.

   Name RLS changes specifically. CuevikSync's tenant isolation is a database guarantee
   ([docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md), NFR-008) and a weakened policy leaks
   across tenants in silence — say which policy, which table, and what the change permits that
   it did not before.

   Also flag any `create extension`. Neither `pgmq` nor `pg_cron` is enabled yet, and enabling
   one is itself a schema change requiring approval ([CLAUDE.md](../../CLAUDE.md)).

   **Stop here if `$ARGUMENTS` contains `check`.**

2. If anything is destructive, dump first. The Free plan has **no automated backups at all**
   ([docs/ENVIRONMENTS.md](../../docs/ENVIRONMENTS.md) §2), so this dump is the only recovery
   path that exists:

   ```bash
   npx supabase db dump --linked -f backup-<YYYYMMDD>.sql
   ```

   Add a `--data-only` dump for the affected tables when data — not just structure — is
   destroyed. **That filename MUST NOT land in git.** Confirm it is ignored or removed before
   any commit.

3. State plainly which files will apply, in what order, the classification of each, and the
   dump path if one was taken. Get an explicit yes. On a `dev` label a plain confirmation is
   enough; on `prod`, require the user to type the ref back.

## Phase 4 — Dry run

```bash
npx supabase db push --linked --dry-run
```

Compare the file list it reports against the pending set from Phase 2. **A mismatch means the
remote changed underneath you — abort and re-run from Phase 2.**

Common failures and what they mean:

- **Naming rejected** — the `NNNN_` scheme versus the CLI's timestamp scheme. If the CLI
  refuses the files, rename all of them to one consistent scheme in a single change and update
  [docs/PROJECT-STRUCTURE.md](../../docs/PROJECT-STRUCTURE.md) §5 in the same commit. Never mix
  the two.
- **Connection refused / project paused** — a Free-plan project pauses after a week idle
  ([docs/ENVIRONMENTS.md](../../docs/ENVIRONMENTS.md) §3). The user resumes it in the dashboard.
  Do not retry in a loop.

## Phase 5 — Apply

```bash
npx supabase db push --linked --yes
```

If it fails **partway**: stop. Report the exact error, re-run `npx supabase migration list
--linked` to show which migrations landed and which did not, and point at the dump path. Do not
re-run hoping for idempotence, and do not run `migration repair`.

## Phase 6 — Verify what the SQL cannot prove about itself

1. `npx supabase migration list --linked` — every pending version now applied, no drift left.

2. Regenerate types:

   ```bash
   npm run db:types
   ```

   Not optional. [docs/TECH-STACK.md](../../docs/TECH-STACK.md) §4 makes
   `src/lib/supabase/types.ts` a generated artifact in a no-ORM stack, so a schema that moved
   without its types leaves every `supabase-js` call lying about its shape. A failed run is
   safe — the script writes `types.ts.tmp` and renames only on exit 0 — so re-run it rather
   than hand-editing. **If a migration applied and this produces no diff, something is wrong.**
   Say so instead of assuming the file was already current.

3. RLS is actually on. A table with policies but `relrowsecurity = false` enforces nothing:

   ```sql
   select c.relname, c.relrowsecurity,
          (select count(*) from pg_policies p
            where p.tablename = c.relname and p.schemaname = 'public') as policies
   from pg_class c
   where c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
   order by c.relname;
   ```

   Any `false` is a defect, not a nit.

4. Every new tenant-scoped table carries `tenant_id` and its policies filter on it. RLS on with
   no tenant predicate enforces row ownership and nothing else — the exact failure NFR-008
   exists to prevent. State explicitly whether a tenant-isolation test covers the change:
   [docs/ENGINEERING-RULES.md](../../docs/ENGINEERING-RULES.md) §3 makes cross-tenant
   read/write coverage mandatory.

5. Grants on new tables — no unintended `anon` or `authenticated` grant that RLS is then the
   only thing standing behind.

Run these through **`npx supabase db query --linked "<sql>"`**. It is `db query`, **not**
`db execute`: the latter does not exist, and the CLI answers an unknown subcommand by printing
help and exiting **0**, so a naive probe reports success. Add `--output json` for parseable
rows. If the subcommand is ever missing, print the SQL and ask the user to run it in the
dashboard SQL editor rather than skipping the step.

## Phase 7 — Gate

```bash
npm run lint && npm run typecheck && npm run format:check && npm run test
```

A type regeneration that breaks the type-check is the whole reason this step exists: a rename
or a dropped column surfaces here.

## Phase 8 — Report — do not commit or push

- The ref, its label, and the branch
- Migrations applied, in order
- Extensions and policies touched
- Whether `types.ts` changed, and whether `typecheck` still passes
- RLS and grants result per table
- Dump path, if one was taken
- Gate result
- **Any version still present on `main` and unapplied on the remote** — call this out on its own,
  not as a footnote. Nothing applies migrations automatically; a merge that nobody follows up on
  leaves `main` and the database disagreeing. This line and the merge-time warning from
  [.github/workflows/db-drift.yml](../../.github/workflows/db-drift.yml) are the only two places
  that surfaces, and neither runs on a schedule — so state it every run, even when the answer is
  "none".
- Anything left undone, named explicitly

**Do not commit, and do not push to any remote.** Both are human actions
([CLAUDE.md](../../CLAUDE.md), "Workflow"). A regenerated `types.ts` wants its own `chore(db):`
commit — state the suggested Conventional Commit message and stop.

## Never

- Push to a project whose ref is absent from `supabase/.project-refs.json`, or to a `prod`-labelled
  ref without the `prod` argument.
- Push a migration that is not on `origin/main`. Phase 1 is the gate; there is no override.
- Run `supabase start` or `db reset` against anything but the local test stack. Development
  targets the hosted project, and `permissions.deny` blocks both `db reset` spellings.
- Read, print, or write `.env`, `.env*.local`, or anything holding the service-role key.
- Edit schema or RLS in the Supabase dashboard to work around a failed migration. Fix it in a
  new migration file ([docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) §5).
- Run `migration repair` to silence a mismatch. A mismatch is a finding, not noise.
