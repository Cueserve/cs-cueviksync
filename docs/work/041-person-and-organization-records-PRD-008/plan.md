# Person and Organization records — Plan

**Work item:** [#41 PRD-008: Contact and company records (Must)](https://github.com/Cueserve/cs-cueviksync/issues/41)
**Date:** 2026-09-27
**Status:** Approved
**Derived from:** [spec.md](spec.md)
**Branch:** `feat/person-organization-records`

> Transient per [docs/work/README.md](../README.md). Not a source-of-truth document: where
> this disagrees with a file under `docs/`, that file wins.

## Execution contract

Read this before starting, and again whenever the repo does not look the way a task expects.

1. **A task is done when its `proof` command passes.** Not when the code looks right.
2. **When reality contradicts the plan, stop.** A file that is not where the plan says, an
   interface that does not match, a test that cannot be written the way the task describes —
   append the contradiction to §Deviations, open the PR as a **draft** titled with what
   blocked, and report. Do not improvise past a wrong plan: a plan that was wrong about one
   thing is evidence, not a rounding error.
3. **Scope is the task list.** No refactor, no error handling, no abstraction that no task
   asked for ([CLAUDE.md](../../../CLAUDE.md), "No invented scope").
4. **Ship gate before the PR:** `npm run lint`, `npm run typecheck`, `npm run format:check`,
   `npm run test`. All four pass → regular PR. Any fail → **draft** PR titled with the failure,
   and stop. Never weaken a check to force green.
5. **Never push to `main`, never force-push, never merge or close the PR.** Enforced by
   `.claude/hooks/block-remote-writes.mjs`; stated here because the executing session reads
   this file first.
6. **Move the card twice.** Set Status to `Working` before task 1, and to `Reviewing` when the
   code PR opens (Delivery step 5) — nothing else knows when either happened. The exact calls
   and ids are in [docs/work/README.md](../README.md), "The board". `Done` is not yours: the
   human merges, so the human closes it out.

**Rules specific to this plan:**

7. **The local stack only.** Every Supabase command in tasks 1–15 runs against the local stack
   and carries `--local` where the command takes one. Never `--linked`, never `npm run db:push`,
   never `/db-migrate`. The one linked command in this plan is `npm run db:types` in Delivery
   step 4, after the human has applied the migrations. Never read or write `.env*`.
8. **One stack, shared.** Tasks 2–6 end with `npx supabase db reset --local`, which wipes the
   database. Never run two of those proofs at once — that is why tasks 5 and 6 sit in separate
   waves though neither reads the other. Test files that only create data (1, 12–14) are safe
   to run concurrently: each creates its own tenants.
9. **Exception messages are user-facing.** Every `raise exception` in a migration is shown to a
   user through `fromPostgrestError` (task 7). Write it as a plain sentence, e.g. `'Prospect,
Client, and Primary contact cannot be deleted or deactivated.'`
10. **Migration files follow `0001`/`0002`.** A header block saying what the file creates and
    why, lowercase SQL, comments on every non-obvious decision. The SQL in
    [spec.md](spec.md) §2 is the contract — copy it; do not restyle it.

### Before task 1 — needs the human

Docker Desktop installed and running, and the local stack up — [docs/ENVIRONMENTS.md](../../ENVIRONMENTS.md)
§4 steps 1–2:

```sh
docker info                      # prints a server version
npx supabase start               # first run pulls images, several minutes
npx supabase status -o env       # must print API_URL, ANON_KEY, SERVICE_ROLE_KEY, JWT_SECRET
```

If any of those fails, stop before task 1 and report. Do not work around a missing stack.

## Waves

- **Wave 1:** 1, 7, 8, 9, 10, 15 — no dependencies, dispatch in parallel
- **Wave 2:** 2
- **Wave 3:** 3
- **Wave 4:** 4
- **Wave 5:** 5
- **Wave 6:** 6 — depends only on 4, but shares the stack reset with 5 (rule 8)
- **Wave 7:** 11
- **Wave 8:** 12, 13, 14 — dispatch in parallel

Then **Delivery**, below the tasks.

## Tasks

### Task 1 — Build the database test harness

- **depends-on:** []
- **files:** `vitest.config.ts`, `src/lib/supabase/schema/fixtures.ts`,
  `src/lib/supabase/schema/harness.test.ts`
- **do:**
  - `vitest.config.ts` — keep `include`. Add `resolve.alias`: `@` →
    `path.resolve(__dirname, "src")`, and `server-only` →
    `path.resolve(__dirname, "node_modules/next/dist/compiled/server-only/empty.js")`. Comment
    why: Next resolves `server-only` through the `react-server` condition, Vitest does not, and
    the package's default entry throws. Add `testTimeout: 30_000`.
  - `fixtures.ts` — test-only, imported by `*.test.ts` files and nothing else; say so in its
    header. It uses a plain `createClient` from `@supabase/supabase-js` **without** the
    `Database` generic, so it compiles before and after types are regenerated. Exports:
    - `localStack()` — runs `npx supabase status -o env` once per worker (`execSync`, cached),
      parses its `KEY="value"` lines, returns `{ url, anonKey, serviceRoleKey, jwtSecret }` from
      `API_URL`, `ANON_KEY`, `SERVICE_ROLE_KEY`, `JWT_SECRET`. Throws
      `"Local Supabase stack is not running — see docs/ENVIRONMENTS.md §4"` if the command fails
      or a key is missing. Throws if `url`'s host is not `127.0.0.1` or `localhost`. Never falls
      back to `NEXT_PUBLIC_*`, which point at the hosted project.
    - `adminClient()` — service-role client, `persistSession: false`, `autoRefreshToken: false`.
      For fixture setup only; no assertion may run through it.
    - `createTenant()` — inserts a `tenants` row named `test-<uuid>`, returns its id.
    - `createUser(tenantId, role)` — `role` is
      `"owner_admin" | "sales_manager" | "sales_rep" | "office_admin" | "operations"`. Creates an
      auth user through `admin.auth.admin.createUser` (`email_confirm: true`, email
      `<role>-<uuid>@test.local`), inserts its `profiles` row, then mints a session JWT with
      `node:crypto` HMAC-SHA256 over `jwtSecret`: claims `sub`, `role: "authenticated"`,
      `aud: "authenticated"`, `iat`, `exp` one hour out. Returns
      `{ id, tenantId, role, client }`, where `client` is an anon-key client carrying
      `Authorization: Bearer <jwt>`. **No sign-in call:** local auth allows 30 sign-ins per 5
      minutes (`supabase/config.toml`), and intent §4 specifies setting session claims directly.
    - `seedContactLists(tenantId)` — `adminClient().rpc("seed_tenant_contact_lists", { p_tenant_id })`.
      Unused until task 3; written here so no later task edits this file.
    - `listValueId(tenantId, table, name)` — the id of a list value, looked up through
      `adminClient()`.
  - `harness.test.ts` — proves the harness against what `0002` already enforces: two tenants
    with an `owner_admin` each; each client reads `profiles` and sees only its own tenant's
    rows; tenant B selecting tenant A's profile by id gets zero rows (NFR-008).
- **proof:** `npx vitest run src/lib/supabase/schema/harness.test.ts`

### Task 2 — Add the Operations role

- **depends-on:** [1]
- **files:** `supabase/migrations/0003_add_operations_role.sql`,
  `src/lib/supabase/schema/operations-role.test.ts`
- **do:** `alter type user_role add value 'operations';` and nothing else. Its header says why it
  is alone (spec §2.1): PRD-024 requires five roles, and PostgreSQL will not use a new enum value
  in the transaction that adds it. The test creates an `operations` user and asserts its client
  reads its own profile with `role = 'operations'`.
- **proof:** `npx supabase db reset --local && npx vitest run src/lib/supabase/schema/operations-role.test.ts`

### Task 3 — Create the five contact lists

- **depends-on:** [2]
- **files:** `supabase/migrations/0004_contact_lists.sql`,
  `src/lib/supabase/schema/contact-lists.test.ts`
- **do:**
  - The enums `category_scope`, `lifecycle_anchor`, `duty_anchor` from spec §2.1.
    `lifecycle_source` is **not** here — it lands with history in task 6.
  - The five tables and their indexes, exactly as spec §2.2, each with a
    `<table>_set_updated_at` trigger calling `set_updated_at()` from `0001`.
  - `protect_anchored_list_values()` (spec §2.7) as a `before update or delete` trigger on
    `lifecycle_statuses` and `contact_duties`: raises on delete where `old.system_key is not
null`, and on update where `old.system_key is not null and new.active = false`.
  - RLS enabled on all five, with spec §2.8's list pair: `<table>_select_own_tenant` and
    `<table>_write_admin`.
  - `seed_tenant_contact_lists(p_tenant_id uuid) returns void` — inserts spec §2.2's starting
    values, `position` 1..n in the order the table lists them, with `system_key` on Prospect,
    Client, and Primary contact. **Idempotent:** if the tenant has a row in any of the five
    lists, it returns having inserted nothing.
- **Test** (cite the spec § in each test name):
  - Seeding produces exactly the §2.2 values per list; seeding again inserts nothing (§1.9).
  - Owner/Admin, Sales Manager, Sales Rep, Office Administrator, and Operations all read all
    five lists (§1.8, §1.27).
  - A Sales Manager's insert is rejected; its update and delete affect zero rows (§1.8).
  - Owner/Admin creates, renames, reorders, and deactivates a value (§1.8).
  - Prospect, Client, and Primary contact: delete raises, deactivate raises, rename succeeds
    (§1.13). An unreferenced Lead can be deleted.
  - A second value whose name differs only in case is rejected within a list (§2.2).
  - Tenant B reads zero of tenant A's list rows; tenant B's admin updating A's value by id
    affects zero rows (§1.23).
- **proof:** `npx supabase db reset --local && npx vitest run src/lib/supabase/schema/contact-lists.test.ts`

### Task 4 — Create Person, Organization, and the directory view

- **depends-on:** [3]
- **files:** `supabase/migrations/0005_persons_and_organizations.sql`,
  `src/lib/supabase/schema/persons-organizations.test.ts`
- **do:**
  - `current_user_role()` (spec §2.7): `returns user_role language sql stable security definer
set search_path = public`, body `select role from public.profiles where id = auth.uid()`.
  - `persons` and `organizations`, their constraints and indexes, exactly as spec §2.3, each
    with a `set_updated_at()` trigger.
  - `is_list_value_active()` (spec §2.7) — one trigger function. `tg_argv[0]` is the column,
    `tg_argv[1]` the list table. Read the new value with `to_jsonb(new) ->> tg_argv[0]`. Skip
    when it is null, and on update skip when it equals the old value — **a record already
    holding a deactivated value must still save** (§1.11). Otherwise
    `execute format('select active from public.%I where id = $1', tg_argv[1])` and raise when
    the result is `false`. A null result (no row visible) passes — the composite foreign key
    rejects it. Attach it `before insert or update of <column>` on `persons.category_id`,
    `persons.lifecycle_status_id`, `organizations.category_id`, and
    `organizations.lifecycle_status_id`. The other three attachments land in task 5.
  - `guard_lifecycle_status()` (spec §2.7) — `before insert or update` on both tables. Raises
    when an insert carries a non-null `lifecycle_status_id`, or an update changes it, unless
    `coalesce(current_setting('cueviksync.lifecycle_write', true), 'off') = 'on'`.
  - The `directory` view, exactly as spec §2.6, with `security_invoker = true`.
  - RLS enabled on both tables, with spec §2.8's allowlisted pair: `persons_select_contact_roles`
    and `persons_write_contact_roles`, and the same pair for `organizations`.
- **Test:**
  - A Sales Rep creates, reads, edits, and deletes a Person and an Organization (§1.1, §1.24).
  - A Person with no Organization and an Organization with no Person both save (§1.2).
  - A Person with neither email nor phone is rejected, and so is one whose email and phone are
    both whitespace (§1.3). A null `last_name` is accepted (§1.4).
  - A person-scoped category on an Organization is rejected, and the reverse (§1.14).
  - A deactivated category is rejected on a new record and on a change of category. A record
    already holding it still saves an email change (§1.11).
  - Deleting a category a Person references is rejected (§1.12).
  - Tenant B selecting tenant A's `persons`, `organizations`, and `directory` rows gets zero;
    its update and delete by id affect zero rows; its insert naming tenant A's `tenant_id` is
    rejected (§1.23).
  - Tenant B inserting a Person in its own tenant with tenant A's category id is rejected by the
    composite foreign key (spec §6).
  - Operations reads zero rows from all three, and its insert is rejected (§1.27).
  - An insert carrying `lifecycle_status_id`, and a direct update of it, are both rejected
    (§1.29).
  - `directory` returns both kinds, with `display_name` built as spec §2.6 builds it.
- **proof:** `npx supabase db reset --local && npx vitest run src/lib/supabase/schema/persons-organizations.test.ts`

### Task 5 — Create the links

- **depends-on:** [4]
- **files:** `supabase/migrations/0006_person_organization_links.sql`,
  `src/lib/supabase/schema/links.test.ts`
- **do:**
  - `person_organizations`, `person_organization_duties`, and `organization_relationships`,
    exactly as spec §2.4. `set_updated_at()` triggers on the two tables that have `updated_at`.
  - `is_list_value_active()` from task 4 attached to `person_organizations.role_id`,
    `person_organization_duties.duty_id`, and `organization_relationships.relationship_type_id`.
  - RLS enabled on all three, with the allowlisted pair from spec §2.8 on each.
- **Test:**
  - A Person linked to two Organizations; both links are read from the Person (§1.5).
  - A link without a role is rejected; a second link for the same pair is rejected (§1.19).
  - A link with zero duties saves; two Persons in one Organization both hold Primary contact
    (§1.20).
  - Deleting a link deletes its duties (§1.21). Deleting a Person deletes its links (§2.4).
  - A relationship reads from both ends — `name` from the `from` side, `inverse_name` from the
    `to` side. Relating an Organization to itself is rejected (§1.22).
  - A deactivated role is rejected on a new link; an existing link holding it still updates
    (§1.11). Deleting a referenced role or duty is rejected (§1.12).
  - Tenant isolation on all three tables, as task 4 tests it; linking tenant B's Person to
    tenant A's Organization is rejected (§1.23, spec §6).
  - Operations reads zero rows from all three, and its insert is rejected (§1.27).
- **proof:** `npx supabase db reset --local && npx vitest run src/lib/supabase/schema/links.test.ts`

### Task 6 — Create lifecycle status history and its function

- **depends-on:** [4]
- **files:** `supabase/migrations/0007_lifecycle_status.sql`,
  `src/lib/supabase/schema/lifecycle.test.ts`
- **do:**
  - The `lifecycle_source` enum (spec §2.1), then `lifecycle_status_history` and its indexes,
    exactly as spec §2.5.
  - `set_lifecycle_status(p_person_id, p_organization_id, p_new_status_id, p_source)`, exactly
    as spec §2.7 — including the flag it switches on and off around its one update.
  - RLS enabled on history, with `lsh_select_contact_roles` and `lsh_insert_contact_roles` from
    spec §2.8, and **no** update or delete policy.
- **Test** (all status changes through `rpc("set_lifecycle_status", …)`):
  - A record with no status is valid and stays so (§1.15).
  - A manual change writes exactly one history row with the right from, to, and source, and
    `actor_id` equal to the caller's id (§1.18, §1.29). Setting the same status again writes
    none (§1.18).
  - `qualified` on a Client record changes nothing and writes nothing (§1.16).
  - Manual Client → Lead, then `qualified` → Prospect, advances (§1.17).
  - `qualified` on Inactive → Prospect (§1.28); `won` → Client.
  - Naming both ids, or neither, raises. Naming tenant A's Person from tenant B raises
    `record not found` (§1.23). Tenant A's status id on tenant B's Person is rejected by the
    composite foreign key (spec §6).
  - An admin's update and delete on history affect zero rows (§1.26). Tenant B reads zero of
    tenant A's history (§1.23). Operations reads zero history, and its call raises (§1.27).
  - After a status change, a direct update of `lifecycle_status_id` is still rejected (§1.29).
  - Deleting a Person keeps its history rows with `person_id` null (spec §2.5).
- **proof:** `npx supabase db reset --local && npx vitest run src/lib/supabase/schema/lifecycle.test.ts`

### Task 7 — Add the action result helper

- **depends-on:** []
- **files:** `src/lib/action-result.ts`, `src/lib/action-result.test.ts`
- **do:** Server Actions need one result shape and one mapping from database errors to
  sentences. Export:
  - `type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string; fieldErrors?: Record<string, string[]> }`
  - `ok(data)`.
  - `fromZodError(error)` → `error: "Check the highlighted fields."`, and `fieldErrors` from
    Zod 4's `z.flattenError(error).fieldErrors`.
  - `fromPostgrestError({ code, message })`: `23503` → `"This is still in use."`; `23505` →
    `"That already exists."`; `23514` → `"That combination is not allowed."`; `42501` →
    `"You do not have permission to do that."`; `P0001` → `message` itself (rule 9); anything
    else → `"Something went wrong."` — never the raw message.
  - `notFound()` → `"Not found, or you do not have permission to change it."` — what an update
    or delete that RLS filtered to zero rows returns.
- **proof:** `npx vitest run src/lib/action-result.test.ts`

### Task 8 — Add the Person schemas

- **depends-on:** []
- **files:** `src/lib/validation/person.ts`, `src/lib/validation/person.test.ts`
- **do:**
  - `personCreateSchema`: `first_name` trimmed, required; `last_name`, `email`, `phone`
    trimmed, with `""` becoming `null`; `email` must be an email when present; `category_id` a
    required uuid with **no default** (spec §3). Refined so email or phone is present, the error
    on `email` (§1.3).
  - `personUpdateSchema`: required `id`, and every create field optional. The same refinement,
    but only when both `email` and `phone` are in the payload.
  - Neither accepts `tenant_id`, `lifecycle_status_id`, or `custom_fields`; Zod's default strip
    drops them. The action sets `tenant_id`; status has its own path (§1.29); nothing in this
    slice writes `custom_fields` (Risks).
- **Test:** a minimal valid Person; no email and no phone; both whitespace; missing
  `category_id`; a category **name** instead of an id is rejected (§1.10); `last_name: ""` →
  `null`; a bad email; the three stripped keys are absent from the output.
- **proof:** `npx vitest run src/lib/validation/person.test.ts`

### Task 9 — Add the Organization and link schemas

- **depends-on:** []
- **files:** `src/lib/validation/organization.ts`, `src/lib/validation/organization.test.ts`
- **do:**
  - `organizationCreateSchema`: `name` trimmed, required; `email`, `phone`, `website` trimmed,
    `""` → `null`; `email` an email when present; `website` free text up to 2,048 characters,
    because a user writes `acme.com` without a scheme; `category_id` a required uuid with no
    default. `organizationUpdateSchema`: required `id`, the rest optional. Neither accepts
    `tenant_id`, `lifecycle_status_id`, or `custom_fields`.
  - `personOrganizationLinkSchema`: `person_id`, `organization_id`, `role_id`, all required
    uuids; `duty_ids` a required array of unique uuids, which may be empty (§1.20).
  - `linkDutiesSchema`: `link_id`, and `duty_ids` as above.
  - `organizationRelationshipSchema`: `from_organization_id`, `to_organization_id`,
    `relationship_type_id`, all required uuids; refined so from ≠ to, the error on
    `to_organization_id` (§1.22).
- **Test:** each schema's valid case and each rule above, one test per rule.
- **proof:** `npx vitest run src/lib/validation/organization.test.ts`

### Task 10 — Add the contact-list schemas

- **depends-on:** []
- **files:** `src/lib/validation/contact-lists.ts`, `src/lib/validation/contact-lists.test.ts`
- **do:**
  - `contactListSchema = z.enum(["categories", "person_organization_roles", "contact_duties",
"organization_relationship_types", "lifecycle_statuses"])`.
  - `listValueCreateSchema`: a discriminated union on `list`. Every branch takes `name`,
    trimmed, 1–100 characters. `categories` also requires `applies_to` (`"person" |
"organization"`), and `organization_relationship_types` also requires `inverse_name`. No
    branch takes `position` — the action appends.
  - `listValueRenameSchema`: `list`, `id`, `name`, and `inverse_name`, which is allowed only
    when `list` is `organization_relationship_types`.
  - `listValueReorderSchema`: `list`, `id`, and `position`, an integer ≥ 1.
  - `listValueRefSchema`: `list` and `id` — for deactivate and delete.
- **Test:** each schema's valid case; an unknown list; a category without `applies_to`; a
  relationship type without `inverse_name`; `inverse_name` on another list; position 0.
- **proof:** `npx vitest run src/lib/validation/contact-lists.test.ts`

### Task 11 — Regenerate database types from the local stack

- **depends-on:** [2, 3, 4, 5, 6]
- **files:** `src/lib/supabase/types.ts`
- **do:** The same steps as `npm run db:types`, against `--local` instead of `--linked`
  ([docs/ENVIRONMENTS.md](../../ENVIRONMENTS.md) §4 step 5), because nothing is applied to the
  hosted project yet:

  ```sh
  npx supabase gen types typescript --local > src/lib/supabase/types.ts.tmp
  node -e "require('fs').renameSync('src/lib/supabase/types.ts.tmp','src/lib/supabase/types.ts')"
  npx prettier --write --end-of-line crlf src/lib/supabase/types.ts
  ```

  Delivery step 4 regenerates it from the hosted project and checks the two agree.

- **proof:** `node -e "const s=require('fs').readFileSync('src/lib/supabase/types.ts','utf8');for(const t of ['persons:','organizations:','person_organizations:','lifecycle_status_history:','set_lifecycle_status:','seed_tenant_contact_lists:','\"operations\"'])if(!s.includes(t)){console.error('missing',t);process.exit(1)}" && npm run typecheck`

### Conventions for tasks 12–14

These apply to every Server Action below, so each task does not repeat them.

- The file opens with `"use server";`, then `import "server-only";`. It exports **only** async
  actions. A `"use server"` file turns every export into an endpoint, so its helpers stay
  unexported.
- Each action takes one `input: unknown`, parses it with its schema's `safeParse`, and returns
  `fromZodError` on failure. It returns `ActionResult` from task 7 and never throws for an
  expected failure.
- `const supabase = await createClient()` from `@/lib/supabase/server`. Never `service-role.ts`
  (spec §3).
- **The caller** comes from a private `getCaller(supabase)`, which calls
  `rpc("current_tenant_id")` and `rpc("current_user_role")` — the database's own answer, which
  the policies also use. A null result from either → `{ ok: false, error: "Not signed in." }`.
- Inserts set `tenant_id` from the caller, never from input. RLS's `with check` verifies it.
- Updates and deletes chain `.select("id")`. An empty result → `notFound()`, because RLS
  filters silently rather than raising.
- Database errors → `fromPostgrestError`.
- On success, `revalidatePath("/contacts")`. The route does not exist yet; #42 and #43 own it.
- **Office Administrator** (§1.25): `createPerson`, `updatePerson`, `createOrganization`, and
  `updateOrganization` allow it; every other record action returns
  `"Your role cannot do that."` for it before touching the database.
- **Tests** mock two modules and no others:
  `vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }))` and
  `vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))`. Each test sets
  `vi.mocked(createClient).mockResolvedValue(user.client as never)` with a `createUser`
  fixture's client. That client carries a real session JWT, so RLS is live — the mock replaces
  cookie plumbing, not the security boundary
  ([docs/ENGINEERING-RULES.md](../../ENGINEERING-RULES.md) §3). Never resolve it to
  `adminClient()`.

### Task 12 — Add the contact-list actions

- **depends-on:** [7, 10, 11]
- **files:** `src/server/actions/contact-lists.ts`, `src/server/actions/contact-lists.test.ts`
- **do:** `createListValue`, `renameListValue`, `reorderListValue`, `deactivateListValue`,
  `deleteListValue`, validated by task 10's schemas. `createListValue` sets `position` to one
  more than the list's current maximum; for `categories`, the maximum within its `applies_to`.
  The Owner/Admin rule is RLS's, not the action's (spec §2.8).
- **Test:** Owner/Admin runs all five; a Sales Rep's create returns the permission error and its
  rename returns `notFound()` (§1.8); deactivating or deleting Prospect returns the trigger's
  sentence (§1.13); deleting a referenced value returns `"This is still in use."` (§1.12);
  `revalidatePath` is called on success and not on failure.
- **proof:** `npx vitest run src/server/actions/contact-lists.test.ts`

### Task 13 — Add the Person actions

- **depends-on:** [7, 8, 11]
- **files:** `src/server/actions/persons.ts`, `src/server/actions/persons.test.ts`
- **do:**
  - `createPerson`, `updatePerson`, `deletePerson` — plain inserts, updates, and deletes.
    `deletePerson` is a hard delete (spec §9).
  - `setPersonLifecycleStatus({ person_id, status_id })` →
    `rpc("set_lifecycle_status", { p_person_id, p_organization_id: null, p_new_status_id,
p_source: "manual" })`. Validate its input with a local `z.object` of two uuids, declared
    in the action file.
  - `findDuplicatePersons({ first_name, last_name?, email?, phone? })` — three queries, not one
    `.or()` string, which a comma in a name would break: `email` by `ilike`, `phone` by `eq`,
    and `first_name` plus `last_name` by `ilike`. Escape `%`, `_`, and `\` before every
    `ilike`. Merge by id. Returns
    `{ id, first_name, last_name, email, phone, matched_on: ("email" | "phone" | "name")[] }[]`.
    A read — it blocks nothing (§1.6).
- **Test:** a Sales Rep creates, and the row carries its tenant; a Person with no email and no
  phone returns `fieldErrors.email`; an Office Administrator creates and updates but is refused
  delete and status (§1.25); a Sales Rep's update of tenant A's Person from tenant B returns
  `notFound()` (§1.23); Operations' create fails (§1.27); a status change writes one history
  row (§1.18); duplicates match on a case-different email, on a phone, and on a name, and never
  return another tenant's Person (§1.6, §1.23).
- **proof:** `npx vitest run src/server/actions/persons.test.ts`

### Task 14 — Add the Organization and link actions

- **depends-on:** [7, 9, 11]
- **files:** `src/server/actions/organizations.ts`, `src/server/actions/organizations.test.ts`
- **do:**
  - `createOrganization`, `updateOrganization`, `deleteOrganization`,
    `setOrganizationLifecycleStatus`, and `findDuplicateOrganizations` (`name`, `email`,
    `phone`), each as its task 13 twin.
  - `linkPersonToOrganization` — inserts the link, then one `person_organization_duties` row
    per `duty_ids` entry.
  - `unlinkPersonFromOrganization({ link_id })` — deletes the link. Its duties cascade.
  - `setLinkDuties` — reads the link's current duties, inserts the missing, deletes the
    removed. Two statements, not a transaction (Risks).
  - `relateOrganizations` — inserts one `organization_relationships` row.
- **Test:** an Office Administrator creates and edits an Organization, including `website`,
  and is refused every link, duty, relationship, delete, and status action (§1.25); a Person
  linked to two Organizations (§1.5); a second link for the same pair returns
  `"That already exists."` (§1.19); `setLinkDuties` from {Primary} to {Billing} leaves exactly
  {Billing} (§1.20); unlinking removes the duties (§1.21); a self-relation returns
  `fieldErrors` (§1.22); duplicates as task 13 tests them (§1.6).
- **proof:** `npx vitest run src/server/actions/organizations.test.ts`

### Task 15 — Start the local stack in CI

- **depends-on:** []
- **files:** `.github/workflows/ci.yml`
- **do:** In the `check` job, immediately before `- run: npm run test`, add
  `- uses: supabase/setup-cli@v1` with `version: latest`, then `- run: supabase start`. Put a
  comment above them in the style of `db-replay.yml`: the tests need a real Postgres with RLS
  (ENGINEERING-RULES §3); this is the local stack on the runner, no secret and no `--linked`,
  ever; the fixtures read its keys through `npx supabase status -o env`. Nothing else in the
  file changes. Signed off in spec §8.
- **proof:** `node -e "const s=require('fs').readFileSync('.github/workflows/ci.yml','utf8');const a=s.indexOf('supabase start'),b=s.indexOf('npm run test');if(a<0||b<0||a>b)process.exit(1)"`
  — a static check. The real proof is the code PR's CI run going green.

## Delivery

Two PRs, because CLAUDE.md requires a migration PR to touch only `supabase/migrations/`, and
because a merged migration is immutable and has to be applied by the human before code that
reads it can merge.

1. **Ship gate on the feature branch**, with the local stack up: `npm run lint`,
   `npm run typecheck`, `npm run format:check`, `npm run test`. All four green, or rule 4.
2. **Migration PR.**

   ```sh
   git switch -c feat/041-contact-migrations origin/main
   git checkout feat/person-organization-records -- supabase/migrations/0003_add_operations_role.sql supabase/migrations/0004_contact_lists.sql supabase/migrations/0005_persons_and_organizations.sql supabase/migrations/0006_person_organization_links.sql supabase/migrations/0007_lifecycle_status.sql
   git diff --cached --name-only   # every line must start with supabase/migrations/
   ```

   Commit, push, and open it against `main`. The body maps each file to spec §2, says the
   tests that prove it are in the code PR to follow, and says it is applied with `/db-migrate`
   after merge. `db-replay.yml` runs on it.

3. **Stop.** The human reviews, merges, and applies the migrations. Report the PR and end the
   session. Nothing below runs until the human says the migrations are applied.
4. **After the apply**, on `feat/person-organization-records`:

   ```sh
   git fetch origin && git merge origin/main
   npm run db:types
   git diff --exit-code src/lib/supabase/types.ts
   ```

   An empty diff means the local and hosted schemas agree. A non-empty one is a Deviation:
   commit the hosted version, and say in the PR what differed.

5. **Code PR** from `feat/person-organization-records`: tasks 1, 7–15, and this work folder.
   Run the ship gate again, open the PR, and set the card to `Reviewing`.

## Risks

- **`supabase status -o env` key names.** CLI 2.118 may print `PUBLISHABLE_KEY` / `SECRET_KEY`
  alongside, or instead of, `ANON_KEY` / `SERVICE_ROLE_KEY`, and may not print `JWT_SECRET`.
  Surfaces at task 1. If `JWT_SECRET` is missing, stop: switching to sign-in runs into the
  30-per-5-minute limit, and raising that limit is a `supabase/config.toml` change nobody has
  approved.
- **Local JWT signing.** If the local stack signs with an asymmetric key rather than HS256, a
  minted token is refused. Surfaces at task 1.
- **Table grants.** The plan assumes Supabase's default privileges give `authenticated` table
  access in `public`, so RLS alone decides. If a test gets `permission denied for table`,
  adding a `grant` is outside spec §2 — Deviation. Surfaces at task 3.
- **A foreign key on a generated column.** Spec §2.3's category key includes
  `category_applies_to`, a stored generated column. PostgreSQL 17 allows it as a referencing
  column; if the replay rejects it, that is a spec change. Surfaces at task 4.
- **`setLinkDuties` is two statements.** A failure between the insert and the delete leaves a
  mix of old and new duties. Recoverable by calling it again; atomic would need a database
  function spec §2 does not define.
- **`custom_fields` is never written.** [docs/ENGINEERING-RULES.md](../../ENGINEERING-RULES.md)
  §1 requires validating custom values against a FieldDefinition catalog that does not exist
  yet, so no schema here accepts them and the column keeps its `'{}'` default.
- **Local and hosted types disagree.** Surfaces at Delivery step 4.
- **CI time.** `supabase start` adds roughly two to three minutes to every CI run, not just
  runs that touch the database.

## Deviations

<Empty at planning time. The executing session appends here — what the plan said, what the
repo actually held, and which task it stopped at.>
