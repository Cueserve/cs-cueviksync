# Phase 3 — Convergence Specification

**Inputs:** `phase1-inventory.md` (inventory, access report, decisions D-1…D-15),
`phase2-matrix.md` (190 rows). No source re-reads were needed for this phase.

**Registry deviation, declared up front.** The brief's registry rule says
`IDENTICAL_TEMPLATE_PARAMETERIZED` files get a full body with `{{PARAM}}` markers. Two canonical
files are 510 and 459 lines (`src/app/globals.css`, `docs/DESIGN-SYSTEM.md`). Transcribing them
here would introduce transcription error into the one artifact that must be exact, and would
bury the parameters. For those two only, the spec records **copy verbatim from
`RedyQuote:<path>`, then apply the substitution table** — the table carries every parameter and
its per-repo value. Every other template is given in full.

---

## Gate decisions

Four Phase 2 rows had to be settled before any C-id could be written. Each is resolved here with
the deciding ladder rule, then applied throughout.

### G-1 — Source root is `src/` (Phase 2 row 1.5)

**Decided by rule 5 (lower migration cost), rule 3 supporting.** CuevikSync has zero source
files; moving its documented root from `app/` to `src/app/` costs three doc-line edits. Moving
RedyQuote's realized tree costs every import, the `@/*` alias, both ESLint rule scopes, the
Vitest include glob, and four `components.json` aliases. Rule 2 is neutral — `create-next-app`
offers both and neither is more idiomatic. Rule 3 breaks the neutrality toward `src/`: it is the
layout a developer opening a modern Next repo guesses first, and it keeps config files visually
separate from application code at the repo root.

### G-2 — Server Actions are the sole authenticated mutation path (rows 3.1, 7.16, 19.5)

**Decided by rule 2 (framework default beats bespoke).** Server Components for reads + Server
Actions for writes is the Next 16 App Router idiom. An SPA-plus-JSON-API on App Router is the
bespoke arrangement: it discards RSC data loading, requires a hand-built client fetch layer, and
pulls in TanStack Query to re-solve caching the framework already handles — RedyQuote states
exactly this at `docs/TECH-STACK.md:64`. Rules 4 and 5 point the same way (no API route layer,
no client cache library, no DTO layer; CuevikSync has no code to migrate).

**This does not remove route handlers entirely.** The canonical rule, identical in both repos:
Server Actions for every authenticated mutation; a route handler **only** for an external HTTP
surface that cannot be a Server Action — an inbound webhook or a third-party callback. Note that
CuevikSync's Intake Receiver is _not_ such a case: `docs/TECH-STACK.md:44` places it in a
Supabase Edge Function on Deno, deployed separately from the Vercel app, so it never was a Next
route handler.

**Consequence:** `@tanstack/react-query` leaves CuevikSync's approved stack. Nothing in the D-11
scaffold depends on this decision — the bare-minimum app contains no mutation.

### G-3 — Migration workflow is merge-then-push; the guard checks `origin/main ∪ main` (rows 5.5, 5.6)

**Decided by rule 1 (enforced beats documented), read as "exact enforcement beats approximate".**
Under merge-then-push, "present in `main`" ⇒ "applied" is exact by workflow definition. Under
push-then-commit, "committed to HEAD" ⇒ "applied" is inexact by RedyQuote's own admission at
`CLAUDE.md:99` — "a migration pushed but not yet committed is unguarded." An exact proxy beats
an approximate one.

Rule 4 favours the HEAD check (one ref, no fetch dependency) and is overruled: the simpler guard
is guarding the weaker property. The `origin/main` staleness gap is real and documented at
`CuevikSync/.claude/hooks/block-applied-migration.mjs:22-26`; it is a false-allow on a stale
clone, not a structural hole.

Supporting: RedyQuote's `/db-migrate` design intent is "never push without the user seeing the
migration first" (`CLAUDE.md:186`), and it acknowledges the permission prompt "is a speed bump,
not the review" (`:189-190`). Merge-then-push makes that intent structural — SQL passes through
a PR before it reaches a real database. Push-then-commit only asks for it.

**Not carried over:** the union does _not_ add `HEAD`. CuevikSync's hook header explains why at
`:16-17` — a HEAD check denies edits to migrations still under review, which is the normal case
during authoring.

### G-4 — Document `Owner:` is a person name (row 16.31)

**Decided by rule 4 (fewer moving parts).** RedyQuote is internally consistent (`Viral Parikh` in
all 8 permanent docs); CuevikSync is not (`Architect`, `Product Owner`, and
`Viral Parikh (Product Owner)` all appear). Both repos are solo — `CONTRIBUTING.md:9` "solo /
process-enforced" — so a role taxonomy is a second thing to keep in sync with no second person
to disambiguate.

---

# C-01 — Workspace & solution layout — Adopt `src/` as the source root in CuevikSync's docs

**Canonical form:** RedyQuote
**Decided by:** G-1 (rule 5, rule 3 supporting)
**Rationale:** See G-1. This C-id only records the decision in CuevikSync's prose; the
directories themselves arrive in C-15…C-24.
**Target repo:** CuevikSync
**Files to change:**

- `README.md` — the Project Structure block, `:122-129`
- `docs/ENGINEERING-RULES.md:30-33` — the File structure bullet
- `docs/ARCHITECTURE.md` — any path reference to a bare `app/`

**Change detail:**

````diff
 ```text
-app/         Next.js App Router application — SPA client, server JSON API, and domain modules
+src/app/     Next.js App Router application — routes, layouts, and route-private components
+src/components/  Shared UI: ui/ primitives and layout/ app chrome
+src/lib/     Framework-free modules: supabase clients, config, utils, validation
 supabase/    Supabase CLI migrations (migrations/*.sql) and Edge Functions (Intake Receiver, Ingestion Worker)
 docs/        Source-of-truth documents (PRODUCT, PRD, ARCHITECTURE, TECH-STACK, ENGINEERING-RULES, BACKLOG)
 .github/     GitHub Actions CI workflows
 .claude/     Claude Code settings, migration guard hook, and slash commands
 CLAUDE.md    Claude Code rules — agent behavior, scope, escalation, and off-limits paths
````

````
`docs/ENGINEERING-RULES.md:30-31` — replace "follow the Next.js App Router layout for the
application" with "the application lives under `src/`; routes under `src/app/`, shared UI under
`src/components/`, framework-free modules under `src/lib/`. See `docs/PROJECT-STRUCTURE.md`."

**Blast radius:** None — no code exists to break. Every later C-id assumes this path.
**Verification:** `grep -rn '^app/\|`app/`' README.md docs/` returns no bare-`app/` root reference.
**Depends on:** none
**Effort:** S

---

# C-02 — Application-layer pattern — Server Actions as the sole authenticated mutation path

**Canonical form:** RedyQuote
**Decided by:** G-2 (rule 2; rules 4 and 5 concur)
**Rationale:** See G-2.
**Target repo:** BOTH
**Files to change:**
- CuevikSync `docs/TECH-STACK.md:20` (Next.js row), `:59` (TanStack Query row — delete), `:80` (§5 trade-off row)
- CuevikSync `docs/ARCHITECTURE.md` §1 and §4 — replace "SPA + JSON API" with the RSC/Server Action model
- CuevikSync `docs/ENGINEERING-RULES.md` — add the mutation-path rule to §1
- CuevikSync `CLAUDE.md:33` — "wiring API route handlers" → "writing Server Actions"
- CuevikSync `README.md:21-24` — the "Under the hood" paragraph
- RedyQuote `docs/ENGINEERING-RULES.md` (created by C-32) — carry the identical rule

**Change detail** — the canonical rule text, identical in both repos' `docs/ENGINEERING-RULES.md` §1:
```markdown
- **Mutation path:** Server Actions are the sole path for authenticated writes. Server
  Components read; Server Actions write. A route handler under `src/app/api/` is permitted
  **only** for an external HTTP surface that cannot be a Server Action — an inbound webhook or
  a third-party callback — never as an internal API layer for the app's own UI. There is no
  client-side server-state cache library: `revalidatePath` / `revalidateTag` is the
  invalidation mechanism.
````

CuevikSync `docs/TECH-STACK.md` — delete the TanStack Query row at `:59` and add to §5:

| Not used       | Why not                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| TanStack Query | Needed for an SPA/JSON-API split; with Server Actions + `revalidatePath`, cache invalidation is handled by the framework. |

**Blast radius:** Doc-only today. Forward-looking: CuevikSync's future capture-path work must
use a Supabase Edge Function for the Intake Receiver (unchanged — `docs/TECH-STACK.md:44`) and
Server Actions for everything authenticated.
**Verification:** `grep -rn 'TanStack\|JSON API\|route handlers are the sole' docs/ README.md CLAUDE.md` in CuevikSync returns only the §5 "Not used" row.
**Depends on:** none
**Effort:** M

---

# C-03 — Persistence & migrations — Merge-then-push workflow and one canonical guard hook

**Canonical form:** CuevikSync
**Decided by:** G-3 (rule 1)
**Rationale:** See G-3.
**Target repo:** BOTH
**Files to change:**

- RedyQuote `.claude/hooks/block-applied-migration.mjs` — replace wholesale
- RedyQuote `CLAUDE.md:96-99` and `:204-207` — the immutability + hook bullets
- RedyQuote `.claude/commands/db-migrate.md` — the apply-ordering step (folded into C-44)
- CuevikSync `.claude/hooks/block-applied-migration.mjs` — unchanged; it is the canonical body

**Change detail:** copy verbatim from `CuevikSync:.claude/hooks/block-applied-migration.mjs`,
changing exactly one word — `CuevikSync` → `RedyQuote` at line 9 of the header comment. The
substantive change to RedyQuote is `:48-58`, replacing the `HEAD` lookup with the two-ref loop.

RedyQuote `CLAUDE.md` replacement text for the workflow bullet:

```markdown
- **The hosted schema is real. Treat every merged migration as immutable** — `db push`
  compares recorded versions, not file contents, so editing an applied file is skipped
  silently while reading as though it landed. `0004` exists because that happened once.
  Migrations are applied **after** a change merges to `main`, never before: author on a
  branch, open the PR, merge, then run `/db-migrate` from an up-to-date `main`. A `PreToolUse`
  hook enforces this — see the machine-enforced bullet below. Run `git fetch` before editing a
  migration; the guard reads `origin/main` and a stale clone is its one false-allow.
```

**Blast radius:** RedyQuote's authoring flow changes — a migration committed on a feature branch
becomes editable again (previously blocked), and a merged one becomes unwritable (previously
allowed until committed). Applied migrations `0001`–`0005` are already on `main`, so they are
covered under both the old and new guard; no currently-immutable file becomes writable.
**Verification:** `node .claude/hooks/block-applied-migration.mjs <<< '{"tool_input":{"file_path":"supabase/migrations/0001_extensions_and_types.sql"}}'` emits a `deny` decision in RedyQuote; the same call with a new, unmerged filename exits 0.
**Depends on:** none
**Effort:** S

---

# C-04 — Toolchain pinning — Node 24, pinned three ways, in both repos

**Canonical form:** RedyQuote
**Decided by:** rule 1 — RedyQuote's pin is enforced (`.npmrc engine-strict=true` makes
`engines.node` a hard install failure); CuevikSync's is prose. Confirmed by D-8.
**Rationale:** Node 22 entered Maintenance 2025-10-21; 24 is Active LTS. Beyond the version, the
enforcement shape matters more: three coordinated pins (`.nvmrc` for the developer's shell,
`engines.node` for `npm install`, `node-version-file` for CI) mean one number in one file
governs all three surfaces.
**Target repo:** BOTH
**Files to change:**

- CuevikSync: create `.nvmrc`, create `.npmrc`; `engines` lands with `package.json` in C-05
- CuevikSync: `docs/TECH-STACK.md:22`, `:91`; `README.md:8`, `:51`; `CONTRIBUTING.md:113`
- RedyQuote: no change — it is the canonical form

**Change detail:**

`.nvmrc` (both repos, byte-identical):

```
24
```

`.npmrc` (both repos, byte-identical):

```
; Make engines.node a hard failure, not a warning — see docs/TECH-STACK.md §6.
engine-strict=true
```

CuevikSync `docs/TECH-STACK.md` §1 Node row and §6 bullet — adopt RedyQuote's text verbatim from
`RedyQuote:docs/TECH-STACK.md:20` and `:72-76`, including the Active-LTS policy statement and
the October-2026 review trigger (Phase 2 row 17.5 — present only in RedyQuote).

CuevikSync `README.md:8`:

```diff
-[![Node.js](https://img.shields.io/badge/Node.js-22_LTS-339933.svg)](https://nodejs.org/)
+[![Node.js](https://img.shields.io/badge/Node.js-24_LTS-339933.svg)](https://nodejs.org/)
```

CuevikSync `README.md:51`: `Node.js 22 LTS or higher` → `Node.js 24 LTS (Active LTS) — pinned in
`.nvmrc`; `nvm use` picks it up`.

**Blast radius:** None in CuevikSync (no install exists). None in RedyQuote (unchanged).
**Verification:** `node -v` matches `.nvmrc` after `nvm use`; `npm install` fails on a wrong major.
**Depends on:** none (`engines` field lands in C-05)
**Effort:** S

---

# C-05 — Workspace — Create CuevikSync `package.json`

**Canonical form:** NEITHER (new form defined below)
**Decided by:** rule 4 — RedyQuote's manifest carries `@playwright/test` and
`@vitest/coverage-v8`, both unused (Phase 2 rows 11.5, 11.7, 19.19, 19.22). Copying it forward
would propagate two dead dependencies into a second repo. The canonical form is RedyQuote's
minus those two, plus the version corrections from C-47.
**Rationale:** The scripts block is the single artifact every other verification command in this
spec depends on. It must exist before lint, typecheck, format, or test can be run anywhere.
**Target repo:** BOTH (CuevikSync creates; RedyQuote drops two dependencies — see C-27)
**Files to change:** `package.json` (create in CuevikSync)

**Change detail** — full body, `IDENTICAL_TEMPLATE_PARAMETERIZED`:

```json
{
  "name": "{{PROJECT_SLUG}}",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": ">=24 <25"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "db:push": "npx supabase db push --linked",
    "db:types": "npx supabase gen types typescript --linked > src/lib/supabase/types.ts.tmp && node -e \"require('fs').renameSync('src/lib/supabase/types.ts.tmp','src/lib/supabase/types.ts')\" && npx prettier --write --end-of-line crlf src/lib/supabase/types.ts",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx,mjs}": ["eslint --fix", "prettier --write"],
    "*.{css,md,json}": ["prettier --write"]
  },
  "dependencies": {
    "@supabase/ssr": "^0.12.3",
    "@supabase/supabase-js": "^2.110.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^1.27.0",
    "next": "16.2.11",
    "radix-ui": "^1.6.7",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "tailwind-merge": "^3.6.0",
    "tw-animate-css": "^1.4.0",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^24.13.3",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.11",
    "husky": "^9.1.7",
    "lint-staged": "^17.2.0",
    "prettier": "^3.9.6",
    "shadcn": "^4.15.0",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^4.1.10"
  }
}
```

**Parameters:**

| Parameter          | CuevikSync   | RedyQuote   |
| ------------------ | ------------ | ----------- |
| `{{PROJECT_SLUG}}` | `cueviksync` | `redyquote` |

**Two deltas from RedyQuote's current file, both deliberate:**

- `db:push` gains `--linked`. RedyQuote's is `npx supabase db push` (`package.json:17`);
  CuevikSync documents `--linked` (`CONTRIBUTING.md:126`). Explicit beats implicit — the flag
  makes the target unambiguous when a local stack is later adopted.
- `@playwright/test` and `@vitest/coverage-v8` are absent. See C-27.

**Blast radius:** RedyQuote's `db:push` behaviour is unchanged in practice (the project is
already linked). Removing two devDependencies changes `package-lock.json`.
**Verification:** `npm install && npm run typecheck` in CuevikSync (after C-06); `npm ci && npm run lint && npm run typecheck && npm run format:check && npm run test` in RedyQuote.
**Depends on:** C-04
**Effort:** M

---

# C-06 — Workspace — Create CuevikSync `tsconfig.json`

**Canonical form:** RedyQuote
**Decided by:** no contest — only RedyQuote has this
**Rationale:** `strict: true` at `:7` satisfies CuevikSync's own mandate at
`docs/ENGINEERING-RULES.md:15-16`, which currently has no config to land in. The `@/*` alias at
`:22` is what G-1 resolves to.
**Target repo:** CuevikSync
**Files to change:** `tsconfig.json` (create)

**Change detail** — full body, `IDENTICAL_CONTENT`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

**Blast radius:** None.
**Verification:** `npm run typecheck`
**Depends on:** C-01, C-05
**Effort:** S

---

# C-07 — Workspace — Create CuevikSync `next.config.ts` and `postcss.config.mjs`

**Canonical form:** RedyQuote
**Decided by:** no contest
**Target repo:** CuevikSync
**Files to change:** `next.config.ts`, `postcss.config.mjs` (both create)

**Change detail** — full bodies, `IDENTICAL_CONTENT`:

`next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {/* config options here */};

export default nextConfig;
```

`postcss.config.mjs`:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

**Blast radius:** None.
**Verification:** `npm run build`
**Depends on:** C-05
**Effort:** S

---

# C-08 — Code-quality tooling — Prettier config in both repos

**Canonical form:** RedyQuote for `.prettierrc`; NEITHER for `.prettierignore`
**Decided by:** rule 5 — RedyQuote's `.prettierignore` carries `.venv`, a machine-local Python
virtualenv (`:5-7`) that is not a repo convention. The canonical ignore list is RedyQuote's
minus that entry, plus a comment explaining why each remaining line is there.
**Rationale:** `endOfLine: "auto"` matters on this Windows-primary setup — it stops Prettier from
rewriting every line ending on a repo cloned with CRLF. It is also why `db:types` needs
`--end-of-line crlf` (`package.json:18`).
**Target repo:** BOTH
**Files to change:** CuevikSync `.prettierrc`, `.prettierignore` (create); RedyQuote `.prettierignore` (edit)

**Change detail:**

`.prettierrc` — full body, `IDENTICAL_CONTENT`, both repos:

```json
{
  "endOfLine": "auto"
}
```

`.prettierignore` — full body, `IDENTICAL_CONTENT`, both repos:

```
.next
package-lock.json
supabase/.temp

# Claude Code plugin payload installed from a marketplace — third-party machine
# state, gitignored, and not ours to format. Scoped to .claude/skills/ only:
# .claude/settings.json and .claude/commands/ are committed source and stay
# formatted. See README "Claude Code Setup".
.claude/skills
```

RedyQuote: delete `:5-7` (`.venv` and its two comment lines). If a local `.venv` still exists on
that machine, it belongs in a global gitignore / Prettier ignore, not in a shared repo file.

**Blast radius:** RedyQuote — if `.venv` is still present on disk, `npm run format:check` will
begin failing on its vendored JSON. That is the trigger to remove the directory or ignore it
globally, which is the correct outcome; a machine-local path does not belong in a converged file.
**Verification:** `npm run format:check`
**Depends on:** C-05
**Effort:** S

---

# C-09 — Code-quality tooling / module boundaries — Create CuevikSync `eslint.config.mjs`

**Canonical form:** RedyQuote
**Decided by:** rule 1 — it is the only enforced module-boundary and design-token rule in either
repo (Phase 2 rows 2.1, 7.12). CuevikSync's equivalents are prose at
`docs/ENGINEERING-RULES.md:31-33`.
**Rationale:** Both custom rule blocks bind in CuevikSync once C-24 and C-15 land:
`src/components/ui/**` will exist (18 files) and `src/**/*.tsx` will exist. The raw-color ban is
what makes D-13's token architecture enforceable rather than aspirational.
**Target repo:** CuevikSync
**Files to change:** `eslint.config.mjs` (create)

**Change detail:** copy verbatim from `RedyQuote:eslint.config.mjs`. One substitution: the
comment at `:53-54` reads "the future shared RedyRef component library" — change to "the future
shared Cuevik component library" in CuevikSync. The `no-restricted-imports` group list
(`@/server/*`, `@/lib/supabase/*`, `@/app/*`) is unchanged and correct for both.

**Blast radius:** Lint begins failing on any hex literal or raw Tailwind palette class in
CuevikSync `.tsx`. Since C-24 copies files that already pass this rule in RedyQuote, the
starting state is clean.
**Verification:** `npm run lint` — expect exit 0.
**Depends on:** C-05, C-15, C-24
**Effort:** S

---

# C-10 — Code-quality tooling — Husky + lint-staged in CuevikSync

**Canonical form:** RedyQuote
**Decided by:** rule 1 — a git hook that blocks a commit beats `CONTRIBUTING.md:144-147`
describing one.
**Rationale:** The lint-staged config is inline in `package.json` rather than a separate file
(Phase 2 row 12.13). Keep it there — rule 4, one fewer file to keep in sync.
**Target repo:** CuevikSync
**Files to change:** `.husky/pre-commit` (create); the `lint-staged` block and `prepare` script land with C-05

**Change detail** — full body, `IDENTICAL_CONTENT`:

`.husky/pre-commit`:

```
npx lint-staged
```

**Blast radius:** Commits in CuevikSync now run ESLint `--fix` and Prettier on staged files.
`.husky/_/` is husky-generated and gitignored by its own `_/.gitignore` — do not commit it.
**Verification:** `npm run prepare` then stage a deliberately misformatted `.ts` file and commit; the commit reformats it.
**Depends on:** C-05, C-08, C-09
**Effort:** S

---

# C-11 — Testing — Create CuevikSync `vitest.config.ts`

**Canonical form:** RedyQuote
**Decided by:** no contest, and D-6
**Rationale:** Per D-6 the harness is mirrored with zero test files, so CI's `test` step is
identical across repos from day one. The `include` glob and the reason for it — keeping
Playwright `*.spec.ts` out of the Vitest run — is a convention worth carrying even while no
Playwright exists, because it documents the filename split.
**Target repo:** CuevikSync
**Files to change:** `vitest.config.ts` (create)

**Change detail** — full body, `IDENTICAL_CONTENT`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Unit tests are co-located as `*.test.ts` next to the module under test
    // (PROJECT-STRUCTURE.md §1). Playwright specs, if E2E is ever adopted, live
    // in `e2e/` as `*.spec.ts` and must never be picked up here — hence
    // `.test.ts`, not a bare glob.
    include: ["src/**/*.test.ts"],
  },
});
```

**One substantive edit to RedyQuote's comment:** `:6` currently reads "Playwright specs live in
`e2e/`" as a statement of fact. No `e2e/` exists (Phase 2 row 11.5) and per D-6 none is planned.
The canonical comment is conditional, as above.

**Blast radius:** `npm run test` in CuevikSync exits non-zero on an empty suite — Vitest's
default without `passWithNoTests`. That is the honest signal and matches RedyQuote's actual
config. If a green CI is wanted before the first test lands, that is a `passWithNoTests`
decision to take deliberately, not to inherit by accident.
**Verification:** `npm run test`
**Depends on:** C-05
**Effort:** S

---

# C-12 — Frontend — Create CuevikSync `components.json`

**Canonical form:** RedyQuote
**Decided by:** no contest
**Rationale:** `cssVariables: true` (`:10`) and `baseColor: "neutral"` (`:9`) are what make
`npx shadcn add` output pass the C-09 raw-color rule by construction — shadcn emits the same
token names `globals.css` defines. Style `radix-nova` must match or added primitives will not
match the 18 already copied in C-24.
**Target repo:** CuevikSync
**Files to change:** `components.json` (create)

**Change detail** — full body, `IDENTICAL_CONTENT`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "radix-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "menuColor": "default",
  "menuAccent": "subtle",
  "registries": {}
}
```

**Blast radius:** None until `npx shadcn add` is run.
**Verification:** `npx shadcn@latest add badge --dry-run` resolves paths without error.
**Depends on:** C-06, C-15
**Effort:** S

---

# C-13 — Configuration — Unify `.gitignore`

**Canonical form:** NEITHER (new form defined below)
**Decided by:** rule 5 for the env pattern (RedyQuote's `.env*` + `!.env.example` is strictly
safer — it catches `.env.production`, which CuevikSync's `.env*.local` + `.env` misses); rule 4
for the tool-specific blocks (RedyQuote carries `.superpowers/` and `graphify-out/` entries for
tools not universally in use, CuevikSync carries a `.claude/settings.local.json` entry RedyQuote
lacks). The canonical file is the union, minus nothing — every entry in either file is either
correct for both or harmless in both.
**Rationale:** Row 9.7 and row 16.43 both resolve here. The union costs nothing: an ignore line
for a tool a repo does not use is inert.
**Target repo:** BOTH
**Files to change:** `.gitignore` in both

**Change detail** — full body, `IDENTICAL_CONTENT`:

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*
!.env.example

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# db:types writes here first and renames on success, so a failed run leaves this
# behind holding the CLI's JSON error blob instead of poisoning types.ts.
*.ts.tmp

# claude code — per-developer overrides (plugins, marketplaces); shared config is
# .claude/settings.json
.claude/settings.local.json

# Impeccable (the design auditor) writes two configs. config.json holds team-wide
# rule suppressions and IS committed; config.local.json is per-developer machine
# state. Only the local one is ignored.
.impeccable/config.local.json

# superpowers' subagent-driven-development scratch: one directory per plan,
# holding that run's ledger, task briefs, subagent reports, and review-package
# diffs. Regenerable coordination state -- the record that survives is the git
# history the ledger points at, not the ledger.
.superpowers/

# graphify (knowledge graph tool). graph.json/graph.html/GRAPH_REPORT.md are
# versioned as living documentation of the codebase graph; everything else
# (per-file extraction cache, machine-local interpreter/root paths, manifest,
# cost log) is regenerable local state, not a deliverable.
graphify-out/*
!graphify-out/graph.json
!graphify-out/graph.html
!graphify-out/GRAPH_REPORT.md
```

**Blast radius:** CuevikSync's `.env` is still ignored (now via `.env*`). RedyQuote gains the
`.claude/settings.local.json` ignore — if such a file exists there untracked, nothing changes;
if it was tracked, `git rm --cached` is needed. Verified in Phase 1: RedyQuote tracks only
`settings.json`, `launch.json`, `commands/*`, `hooks/*` under `.claude/`, so no untracking is
required.
**Verification:** `git status --porcelain` clean in both after the edit; `git check-ignore -v .env.production` resolves in both.
**Depends on:** none
**Effort:** S

---

# C-14 — Configuration & secrets — `.env.example` in both repos

**Canonical form:** NEITHER (new form defined below)
**Decided by:** rule 3 — the file must exist at the same path with the same header structure in
both, even though the key list cannot match (row 9.1, `MUST_DIVERGE` on keys). The convergent
part is the header contract: what the file is, what must never go in it, and the rule about
`NEXT_PUBLIC_`.
**Rationale:** RedyQuote's `.env.example:11-13` is a _negative_ statement — "There is
deliberately NO service-role key here" — which is exactly the kind of decision a developer
moving between repos needs to find in the same place. Preserve it, and give CuevikSync the
mirror-image positive statement.
**Target repo:** BOTH
**Files to change:** CuevikSync `.env.example` (create); RedyQuote `.env.example` (restructure header); CuevikSync `README.md:70-89` (point the table at the file)

**Change detail** — full body, `IDENTICAL_TEMPLATE_PARAMETERIZED`:

```
# Copy to .env.local and fill in from your Supabase project:
#   Dashboard -> Project Settings -> API
#
# .env.local is gitignored. This file is the only committed env file, and it
# MUST never contain real values.
#
# NEXT_PUBLIC_* variables are inlined into the browser bundle and are PUBLIC by
# design. Access control is enforced by Postgres RLS, not by hiding them
# (docs/ARCHITECTURE.md §1). A server-only secret MUST NOT carry that prefix.
#
# {{SERVICE_ROLE_NOTE}}

NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
{{SERVER_ONLY_KEYS}}
```

**Parameters:**

| Parameter               | CuevikSync                                                                                                                                                                                                                                    | RedyQuote                                                                                                                                                                                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{SERVICE_ROLE_NOTE}}` | `The service-role key below bypasses RLS. It is server-side only,`<br>`# confined to the three system paths (Intake Receiver, Ingestion Worker,`<br>`# provisioning), and MUST NOT be exposed to the browser`<br>`# (docs/TECH-STACK.md §6).` | `There is deliberately NO service-role key here. RedyQuote uses none`<br>`# anywhere (docs/TECH-STACK.md §6) — every database access runs under a`<br>`# real user's session. If you ever find yourself adding one, update`<br>`# TECH-STACK.md first.` |
| `{{SERVER_ONLY_KEYS}}`  | `SUPABASE_SERVICE_ROLE_KEY=your-service-role-key`<br>`SUPABASE_DB_URL=postgresql://...:6543/postgres`<br>`INTAKE_KEY_SECRET=your-intake-key-secret`                                                                                           | _(empty — no server-only keys)_                                                                                                                                                                                                                         |

**Note on row 9.3:** the target filename converges on `.env.local` in both. CuevikSync's
`README.md:71` currently says `cp .env.example .env`; `.env.local` is what `.gitignore` and
Next's own loading order expect, and it is what RedyQuote uses.

**Note on row 9.2:** the README variable table stays in **both** READMEs (canonical section
order, C-29), and the `.env.example` comment block stays in both. They are not redundant — the
table carries the "where to obtain" column, the file carries the copy-paste keys.

**Blast radius:** CuevikSync developers must use `.env.local`, not `.env`. Both are gitignored
under C-13.
**Verification:** `test -f .env.example && git check-ignore -v .env.local` in both.
**Depends on:** C-13
**Effort:** S

---

# C-15 — Frontend architecture — Token layer in CuevikSync, parameterized on three brand anchors

**Canonical form:** RedyQuote, parameterized (D-13)
**Decided by:** rule 1 — the token layer is enforced by two mechanisms (Tier-1 outside `@theme`
generates no utility; C-09's `no-restricted-syntax` rejects raw classes), where CuevikSync has
no design documentation at all.
**Rationale:** Everything structural transfers: the three-tier split, the Tier-2 semantic token
names, the static `@theme` scales, the light/dark value blocks, the `@layer base` rules. Only
three hex anchors and the five contrast-derived oklch primitives are product-specific.
**Target repo:** CuevikSync
**Files to change:** `src/app/globals.css` (create)

**Change detail:** copy verbatim from `RedyQuote:src/app/globals.css` (510 lines), then apply
the substitution table. Registry deviation declared at the top of this document.

Structural anchors in the source file, for locating each substitution:
`:1-3` imports · `:5` `@custom-variant dark` · `:39-93` Tier-1 `:root` · `:96-156` Tier-2
`@theme inline` · `:161-205` static `@theme` scales · `:208-357` Tier-2 light values ·
`:363-453` Tier-2 dark values · `:455-498` `@layer base`.

**Parameters:**

| Parameter           | CuevikSync (provisional, D-14) | RedyQuote        | White-on-color contrast              |
| ------------------- | ------------------------------ | ---------------- | ------------------------------------ |
| `{{BRAND_PRIMARY}}` | `#0F6E6E` (teal)               | `#A81D22` (red)  | CuevikSync 6.04:1 · RedyQuote 7.33:1 |
| `{{BRAND_INK}}`     | `#1A1A1A`                      | `#1A1A1A`        | 17.4:1 on white (both)               |
| `{{BRAND_ACCENT}}`  | `#B45309` (amber)              | `#1E5FBF` (blue) | CuevikSync 5.02:1                    |

Contrast figures are computed by the WCAG 2.1 relative-luminance formula, the same method
`RedyQuote:docs/DESIGN-SYSTEM.md` §4 uses. All three CuevikSync anchors clear the AA 4.5:1 floor
for normal text against white.

**The five derived oklch primitives** (`RedyQuote:docs/DESIGN-SYSTEM.md:66-69` — "exactly five
derived primitives, all forced by contrast") must be **re-solved**, not copied. They are
lightness-adjusted derivatives of the Tier-1 anchors; carrying RedyQuote's values against
CuevikSync's teal would produce off-hue ramps. Re-solve each by the same rule — adjust oklch
lightness until the AA floor is met — and record the result in CuevikSync's
`docs/DESIGN-SYSTEM.md` §4 (C-34).

**These three hexes are provisional and marked as such** in CuevikSync's `docs/DESIGN-SYSTEM.md`
§1 per D-14. They are chosen to clear the AA floor and to sit far from REDYREF's red, not from a
Cuevik brand decision — none exists. Replacing them is a three-value edit plus a re-solve of the
five derived primitives.

**Blast radius:** None — no CuevikSync UI exists before C-21…C-24, which are specified against
this file.
**Verification:** `npm run build` succeeds; `npx impeccable detect http://localhost:3000/` reports no `low-contrast` finding (URL mode, which resolves runtime token values — see `RedyQuote:CLAUDE.md:344-354` for why `detect src/` cannot check this).
**Depends on:** C-05, C-07
**Effort:** L

---

# C-16 — Frontend — `src/lib/fonts.ts` in CuevikSync

**Canonical form:** RedyQuote
**Decided by:** no contest
**Rationale:** The extraction rationale at `:5-9` — that `global-error.tsx` replaces the root
layout and so needs its own font config — is a framework fact, not a product one. It applies
identically.
**Target repo:** CuevikSync
**Files to change:** `src/lib/fonts.ts` (create)

**Change detail** — full body, `IDENTICAL_CONTENT`:

```ts
import { Archivo, IBM_Plex_Mono } from "next/font/google";

// The two brand faces (DESIGN-SYSTEM.md §3), loaded once and shared by the two
// files that own an `<html>` element: `app/layout.tsx` and `app/global-error.tsx`.
//
// Extracted rather than declared twice because `global-error.tsx` *replaces* the
// root layout when it fires — including its `<html className>` — so a second,
// hand-copied loader config is the only other way to keep the crash screen on
// brand, and two copies of a font config drift silently.

// Archivo is the only text family: display, body and the rare brand-voice
// italic. Headings differ from body by weight and tracking, not by face -- one
// grotesk keeps a dense table visually quiet. Loaded as a variable font, so
// every weight 400-700 costs one file.
export const archivo = Archivo({
  variable: "--font-sans",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

// Tabular numerics only -- costs, SKUs, percentages, quantities, and every
// editable numeric field. Not a variable font, so the weights are explicit.
export const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/** The class string every `<html>` in the app carries. */
export const fontVariables = `${archivo.variable} ${plexMono.variable}`;
```

One word changed from RedyQuote's copy: `a dense quote table` → `a dense table`, since
"quote table" is RedyQuote-specific. Apply the same edit to RedyQuote so the files are identical.

**Blast radius:** None.
**Verification:** `npm run build`
**Depends on:** C-05
**Effort:** S

---

# C-17 — Frontend — `src/lib/utils.ts` in CuevikSync

**Canonical form:** RedyQuote, minus the pricing-specific comment
**Decided by:** rule 4 — one shared helper module rather than two divergent ones
**Rationale:** `cn()` is required by every file C-24 copies. The formatters are generic
`Intl` wrappers; the locale-pinning rationale at `:16-18` (server/client hydration parity) is
framework-general.
**Target repo:** BOTH
**Files to change:** CuevikSync `src/lib/utils.ts` (create); RedyQuote `src/lib/utils.ts:8-18` (comment edit)

**Change detail:** copy verbatim from `RedyQuote:src/lib/utils.ts`, replacing the comment block
at `:8-18` with the following in **both** repos:

```ts
// --- Display formatters ------------------------------------------------------
//
// Presentation only. These format a number that has already been decided
// elsewhere; none of them brings a value into existence. Rounding rules for
// *persisted* numeric fields are a product decision and are deliberately not
// implied here — `formatMoney` rounds for display the way Intl.NumberFormat
// always has, which is not a business rule.
//
// `en-US` is pinned rather than left to the runtime locale so a server render
// and a client hydration produce identical strings. Money and quantities are
// rendered in `font-mono tabular-nums` at the call site (DESIGN-SYSTEM.md §8).
```

RedyQuote's PRD §2A reference moves to the module that actually implements pricing, when one
exists. A shared utility file should not cite one repo's open product decision.

**Blast radius:** RedyQuote — comment only, no behaviour change.
**Verification:** `npm run typecheck && npm run lint` in both.
**Depends on:** C-05
**Effort:** S

---

# C-18 — Configuration — `src/lib/config.ts` in CuevikSync

**Canonical form:** RedyQuote, parameterized on the key set
**Decided by:** rule 1 — it throws at startup (`:28-32`) rather than surfacing a missing variable
as an opaque Supabase error later. CuevikSync has no equivalent.
**Rationale:** The literal-`process.env.NAME` constraint at `:5-9` is a Next bundler fact that
bites identically in both repos. The Zod schema shape transfers; only the key list differs.
**Target repo:** CuevikSync
**Files to change:** `src/lib/config.ts` (create)

**Change detail** — full body, `IDENTICAL_TEMPLATE_PARAMETERIZED`:

```ts
import { z } from "zod";

/**
 * Validated environment configuration.
 *
 * Every variable is read as a literal `process.env.NAME` expression rather than
 * a dynamic lookup, because the Next bundler substitutes NEXT_PUBLIC_* values by
 * matching that exact text. `process.env[name]` would silently yield undefined in
 * the browser bundle.
 */
const envSchema = z.object({
  supabaseUrl: z.url(),
  supabaseAnonKey: z.string().min(1),
{{SERVER_ONLY_SCHEMA}}
});

const parsed = envSchema.safeParse({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
{{SERVER_ONLY_READS}}
});

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");

  // Fail at startup rather than surfacing as an opaque Supabase error on the
  // first query. Missing configuration is not a runtime condition to handle.
  throw new Error(
    `Invalid environment configuration:\n${details}\n\n` +
      "Copy .env.example to .env.local and fill in the values from your Supabase " +
      "project (Dashboard -> Project Settings -> API).",
  );
}

export const env = parsed.data;
```

**Parameters:**

| Parameter                | CuevikSync                                                                                                                                                   | RedyQuote |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| `{{SERVER_ONLY_SCHEMA}}` | `  serviceRoleKey: z.string().min(1),`<br>`  dbUrl: z.string().min(1),`<br>`  intakeKeySecret: z.string().min(1),`                                           | _(empty)_ |
| `{{SERVER_ONLY_READS}}`  | `  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,`<br>`  dbUrl: process.env.SUPABASE_DB_URL,`<br>`  intakeKeySecret: process.env.INTAKE_KEY_SECRET,` | _(empty)_ |

**Open risk, stated at the row rather than deferred:** CuevikSync's three server-only keys are
read in a module imported by browser code (`src/lib/supabase/client.ts` imports `@/lib/config`).
Next will not inline non-`NEXT_PUBLIC_` values into the client bundle, so the values are safe —
but the schema will fail validation in the browser, where those three are `undefined`. The fix
is to split the schema: a client-safe `env` and a `server-only`-guarded `serverEnv`. **Phase 3
specifies the split as part of C-19**, because that is where the service-role client lives.
The body above is the client-safe half; the server half is in C-19.

**Blast radius:** None until C-19.
**Verification:** `npm run build` with `.env.local` populated; delete a key and confirm the build fails with the named-variable message.
**Depends on:** C-05, C-14
**Effort:** M

---

# C-19 — Auth — Supabase client layer in CuevikSync, with the service-role split

**Canonical form:** RedyQuote for the user-scoped clients; NEITHER for the server-only split
**Decided by:** rule 1 for the shared half (`import "server-only"` at `server.ts:1` is a
build-time boundary, not a convention); rule 3 for the split (a developer looking for the
elevated client should find it at a predictable, obviously-separate path)
**Rationale:** D-15 requires CuevikSync to carry a service-role client. Putting it in the same
module as the user-scoped one would make `server.ts` diverge and would remove the
"there is deliberately no elevated variant" property that makes RedyQuote's file safe to read.
Separate file, separate import, separate env schema.
**Target repo:** BOTH
**Files to change:**

- CuevikSync: `src/lib/supabase/client.ts`, `server.ts`, `update-session.ts`, `types.ts` (create); `src/lib/supabase/service-role.ts` (create, CuevikSync only); `src/lib/config.server.ts` (create, CuevikSync only)
- RedyQuote: `src/lib/supabase/server.ts:13-15` (comment edit, so the same sentence points at the same convention in both)

**Change detail:**

`src/lib/supabase/client.ts` — copy verbatim from `RedyQuote:src/lib/supabase/client.ts`. Full
body, `IDENTICAL_CONTENT`:

```ts
import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/config";

import type { Database } from "./types";

/**
 * Browser Supabase client — for client components only.
 *
 * Server Components, Server Actions and the proxy use `./server` and
 * `./update-session` instead. This client is session-bound like every other
 * access path: RLS applies (docs/ARCHITECTURE.md §1).
 */
export function createClient() {
  return createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
}
```

`src/lib/supabase/server.ts` — copy verbatim from `RedyQuote:src/lib/supabase/server.ts` (41
lines). One parameterized comment block at `:13-15`:

| Parameter                  | CuevikSync                                                                                                                                                                                                                                      | RedyQuote                                                                                                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{ELEVATED_CLIENT_NOTE}}` | `The elevated, RLS-bypassing client is a separate module —`<br>` * \`./service-role\` — and is confined to the three system paths`<br>` * (Intake Receiver, Ingestion Worker, provisioning). It is never`<br>` * reachable from this function.` | `No service-role key exists in this application`<br>` * (docs/ARCHITECTURE.md §1); there is deliberately no elevated variant of`<br>` * this function to reach for.` |

`src/lib/supabase/update-session.ts` — copy verbatim from
`RedyQuote:src/lib/supabase/update-session.ts` (58 lines). `IDENTICAL_CONTENT`, no changes.

`src/lib/config.server.ts` — CuevikSync only, full body, `MUST_DIVERGE`:

```ts
import "server-only";

import { z } from "zod";

/**
 * Server-only environment configuration.
 *
 * Split from `@/lib/config` because that module is imported by the browser
 * client, where these three variables are legitimately undefined — Next does
 * not inline a non-NEXT_PUBLIC_ value into the client bundle. Validating them
 * in the shared schema would fail every browser render.
 *
 * `import "server-only"` makes an accidental client import a build error, not a
 * runtime leak.
 */
const serverEnvSchema = z.object({
  serviceRoleKey: z.string().min(1),
  dbUrl: z.string().min(1),
  intakeKeySecret: z.string().min(1),
});

const parsed = serverEnvSchema.safeParse({
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  dbUrl: process.env.SUPABASE_DB_URL,
  intakeKeySecret: process.env.INTAKE_KEY_SECRET,
});

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");

  throw new Error(
    `Invalid server environment configuration:\n${details}\n\n` +
      "See .env.example for the server-only keys.",
  );
}

export const serverEnv = parsed.data;
```

`src/lib/supabase/service-role.ts` — CuevikSync only, full body, `MUST_DIVERGE`:

```ts
import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { env } from "@/lib/config";
import { serverEnv } from "@/lib/config.server";

import type { Database } from "./types";

/**
 * RLS-bypassing Supabase client. Confined to the three system paths named in
 * docs/ARCHITECTURE.md §5: the Intake Receiver, the Ingestion Worker, and
 * tenant provisioning.
 *
 * Every one of those paths MUST re-apply `tenant_id` in code from a
 * server-resolved value. This client has no session, so RLS does not scope it —
 * a missing filter here is a cross-tenant leak, not an empty result set. That
 * inversion is the entire reason it lives in its own module behind
 * `server-only` rather than beside the user-scoped client in `./server`.
 *
 * If you are reaching for this from a route handler or a Server Action that
 * serves an authenticated user, you want `./server` instead.
 */
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    env.supabaseUrl,
    serverEnv.serviceRoleKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
```

`src/lib/supabase/types.ts` — generated, not authored. Produced by `npm run db:types` after C-25.

**Blast radius:** RedyQuote gets a comment edit only. CuevikSync's C-09 ESLint boundary rule
bans `@/lib/supabase/*` imports from `src/components/ui/**`, which covers the new
`service-role.ts` automatically.
**Verification:** `npm run typecheck && npm run lint && npm run build` in both. In CuevikSync, add a temporary client-component import of `@/lib/supabase/service-role` and confirm the build fails — that proves `server-only` is doing its job; then remove it.
**Depends on:** C-05, C-06, C-18, C-25
**Effort:** L

---

# C-20 — Auth — `src/proxy.ts` in CuevikSync

**Canonical form:** RedyQuote
**Decided by:** rule 2 — `proxy.ts` is Next 16's name for the middleware entry; `middleware.ts`
is the accepted legacy alias (`RedyQuote:docs/PROJECT-STRUCTURE.md:278-280`)
**Rationale:** The "does not gate routes" rationale at `:10-15` is the same architectural
position CuevikSync holds — RLS is the enforcement locus (`docs/TECH-STACK.md:83`). Same file,
same comment, same matcher.
**Target repo:** CuevikSync
**Files to change:** `src/proxy.ts` (create)

**Change detail** — full body, `IDENTICAL_CONTENT`:

```ts
import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/update-session";

/**
 * Next 16 middleware entry (renamed from `middleware.ts`). The framework calls
 * the export named `proxy`, falling back to a default export.
 *
 * Scope is deliberately narrow: refresh the Supabase session and hand back the
 * response carrying rotated cookies. It does NOT gate routes — authorization is
 * enforced by Postgres RLS (docs/ARCHITECTURE.md §1), with the authenticated
 * shell at src/app/(app)/layout.tsx doing the server-side session check and
 * redirect. A middleware redirect is a UX convenience, never the security
 * boundary, and duplicating the check here would invite treating it as one.
 */
export async function proxy(request: NextRequest) {
  const { response } = await updateSession(request);

  return response;
}

export const config = {
  matcher: [
    /*
     * Every path except static assets and image files. Auth cookies must be
     * refreshed on real navigations, not on asset fetches.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

RedyQuote's copy cites `NFR-002` at `:11`; drop that citation in both so the file is identical —
the NFR number is repo-specific and the sentence stands without it.

**Blast radius:** None.
**Verification:** `npm run build`; hit any route and confirm a `Set-Cookie` on the response.
**Depends on:** C-19
**Effort:** S

---

# C-21 — Frontend — Root `layout.tsx`, `page.tsx`, `global-error.tsx` in CuevikSync

**Canonical form:** RedyQuote, parameterized
**Decided by:** no contest for `global-error.tsx` and `layout.tsx`; rule 3 for `page.tsx`
**Rationale:** `global-error.tsx`'s entire design — no `Card`, no `Button`, plain elements and
token classes only, `error.digest` as the sole detail — follows from a framework property (it
replaces the root layout) and a security rule (no raw message at the root). Both hold in
CuevikSync.
**Target repo:** CuevikSync
**Files to change:** `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/global-error.tsx` (create)

**Change detail:**

`src/app/layout.tsx` — full body, `IDENTICAL_TEMPLATE_PARAMETERIZED`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "{{PRODUCT_NAME}}",
  description: "{{PRODUCT_TAGLINE}}",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
```

`src/app/page.tsx` — full body, `IDENTICAL_TEMPLATE_PARAMETERIZED`:

```tsx
import { redirect } from "next/navigation";

/**
 * Entry route. Real behaviour once auth is wired: read the session and send the
 * user to the app or to `/login`. Until then it always lands on the app, since
 * `(app)/layout.tsx` has no session gate yet.
 */
export default function RootPage() {
  redirect("{{LANDING_ROUTE}}");
}
```

`src/app/global-error.tsx` — copy verbatim from `RedyQuote:src/app/global-error.tsx` (68 lines),
substituting `{{PRODUCT_NAME}}` at `:42`.

**Parameters:**

| Parameter             | CuevikSync                                                | RedyQuote                                              |
| --------------------- | --------------------------------------------------------- | ------------------------------------------------------ |
| `{{PRODUCT_NAME}}`    | `CuevikSync`                                              | `RedyQuote`                                            |
| `{{PRODUCT_TAGLINE}}` | `Capture every inbound inquiry and turn it into revenue.` | `Quoting and approval for REDYREF interactive kiosks.` |
| `{{LANDING_ROUTE}}`   | `/inquiries`                                              | `/quotes`                                              |

**One edit to RedyQuote:** `src/app/page.tsx:8-9` carries a dated note about a design-token
reference surface removed on 2026-07-31. Delete it — the file's history is in git, and the note
prevents the two files from being identical.

**Blast radius:** CuevikSync's `{{LANDING_ROUTE}}` must resolve; C-22 creates the placeholder
route it points at.
**Verification:** `npm run build`; `curl -I localhost:3000/` returns a redirect to the landing route.
**Depends on:** C-15, C-16, C-22
**Effort:** M

---

# C-22 — Frontend — Authenticated shell in CuevikSync

**Canonical form:** RedyQuote
**Decided by:** no contest
**Rationale:** The `(app)` / `(auth)` route-group split, the `_components/` private-folder
convention, and the layout components are structural, not product-specific. The session-gate
comment in `(app)/layout.tsx:6-16` is the placement rule this spec wants in both repos.
**Target repo:** CuevikSync
**Files to change:**

- `src/app/(app)/layout.tsx`
- `src/app/(app)/_components/AppChrome.tsx`
- `src/app/(app)/not-found.tsx`
- `src/app/(app)/{{LANDING_SEGMENT}}/page.tsx` — the one placeholder authenticated route
- `src/components/layout/{sidebar,topbar,user-menu,page-header,route-loading}.tsx`

**Change detail:**

`src/app/(app)/layout.tsx` — full body, `IDENTICAL_CONTENT`:

```tsx
import { AppChrome } from "./_components/AppChrome";

/**
 * The authenticated shell. Every route under `(app)` assumes a session.
 *
 * NOT YET HERE, and deliberately so — this is the design pass, with no auth
 * wiring. When it lands, the server-side session check belongs in this file:
 *
 *     const supabase = await createClient();
 *     const { data: { user } } = await supabase.auth.getUser();
 *     if (!user) redirect("/login");
 *
 * `src/proxy.ts` refreshes the session cookie but deliberately does not gate
 * routes — its own comment explains why: a middleware redirect is a UX
 * convenience, never the security boundary. The boundary is Postgres RLS.
 */
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppChrome>{children}</AppChrome>;
}
```

RedyQuote's copy cites `src/lib/mock/` at `:7`; drop that clause in both — it names a
RedyQuote-only prototype directory.

`AppChrome.tsx`, `not-found.tsx`, and the five `src/components/layout/*.tsx` files — copy
verbatim from `RedyQuote:` the same paths. Substitute the navigation item list in
`sidebar.tsx` and the product name in `topbar.tsx`.

**Parameters:**

| Parameter             | CuevikSync                                          | RedyQuote                              |
| --------------------- | --------------------------------------------------- | -------------------------------------- |
| `{{LANDING_SEGMENT}}` | `inquiries`                                         | `quotes`                               |
| `{{NAV_ITEMS}}`       | Inquiries · Contacts · Pipeline · Quotes · Settings | Quotes · Products · Library · Settings |
| `{{PRODUCT_NAME}}`    | `CuevikSync`                                        | `RedyQuote`                            |

The placeholder route at `src/app/(app)/{{LANDING_SEGMENT}}/page.tsx` renders a `PageHeader` and
an `EmptyState` and nothing else. It exists so C-21's redirect resolves and so the shell is
navigable; it is not a domain screen.

**Blast radius:** CuevikSync's nav links to four routes that do not exist yet — they 404 into
`(app)/not-found.tsx`, which is the correct behaviour for a scaffold.
**Verification:** `npm run build && npm run dev`; the shell renders, the sidebar highlights the landing route, an unknown `(app)` path renders the not-found boundary.
**Depends on:** C-15, C-24
**Effort:** L

---

# C-23 — Auth — `(auth)/login` route in CuevikSync

**Canonical form:** RedyQuote, parameterized
**Decided by:** no contest
**Target repo:** CuevikSync
**Files to change:** `src/app/(auth)/login/page.tsx` (create)

**Change detail:** copy verbatim from `RedyQuote:src/app/(auth)/login/page.tsx`, substituting
`{{PRODUCT_NAME}}` in the heading and any product-specific body copy.

**Parameters:** `{{PRODUCT_NAME}}` — `CuevikSync` / `RedyQuote`.

**Blast radius:** The route renders but does not authenticate — neither repo has a wired login
action. That parity is intentional; wiring auth is later work in both.
**Verification:** `npm run build`; `/login` renders outside the app shell.
**Depends on:** C-15, C-24
**Effort:** S

---

# C-24 — Frontend — All 18 `src/components/ui/` primitives in CuevikSync

**Canonical form:** RedyQuote
**Decided by:** no contest, and D-12
**Rationale:** RedyQuote's own `eslint.config.mjs:52-56` already treats this directory as
app-agnostic — "it is the future shared RedyRef library" — and enforces that with an import ban.
The directory was built to be copied; D-12 copies it.
**Target repo:** CuevikSync
**Files to change:** `src/components/ui/` × 18 — `badge, button, card, checkbox, data-table,
dialog, dropdown-menu, empty-state, input, kpi-stat, link-pending, pagination, radio-group,
select, switch, tabs, toast, tooltip` (all `.tsx`, all create)

**Change detail:** copy verbatim from `RedyQuote:src/components/ui/`. `IDENTICAL_CONTENT`, no
substitutions — every file uses semantic tokens only, which is what makes it portable. Any file
found to contain a product-specific string or a hex literal during the copy is a bug in
RedyQuote and must be fixed there first, in the same change.

**Blast radius:** Pulls `radix-ui`, `lucide-react`, `class-variance-authority`, `clsx`,
`tailwind-merge`, `tw-animate-css` into CuevikSync — all present in C-05.
**Verification:** `npm run lint && npm run typecheck` in CuevikSync — exit 0 on all 18, which also proves C-15's token names match.
**Depends on:** C-05, C-15, C-17
**Effort:** M

---

# C-25 — Persistence — `supabase/config.toml` and initial migrations in CuevikSync

**Canonical form:** RedyQuote for `config.toml`; MUST_DIVERGE for migration bodies
**Decided by:** rule 5 for `config.toml` (RedyQuote's is a 414-line CLI-generated file; hand-writing
a second one invites drift); D-15 for the migrations
**Rationale:** `config.toml` is generated by `supabase init` and differs only in `project_id` and
port assignments. The migrations cannot converge — CuevikSync's carry `tenant_id` and
tenant-scoped RLS that RedyQuote explicitly forbids (`docs/PROJECT-STRUCTURE.md:259`).
**Target repo:** CuevikSync
**Files to change:** `supabase/config.toml`, `supabase/.gitignore`, `supabase/migrations/0001_extensions_and_types.sql`, `supabase/migrations/0002_profiles_and_auth.sql` (create)

**Change detail:**

`supabase/config.toml` — generate with `npx supabase init`, then reconcile against
`RedyQuote:supabase/config.toml` so the two differ only in the parameters below. Do not
hand-author it.

**Parameters:**

| Parameter            | CuevikSync                                       | RedyQuote   | Evidence                           |
| -------------------- | ------------------------------------------------ | ----------- | ---------------------------------- |
| `project_id`         | `CuevikSync`                                     | `RedyQuote` | `RedyQuote:supabase/config.toml:5` |
| `[db] major_version` | `17`                                             | `17`        | `:42` — same                       |
| port block           | must not collide if both stacks ever run locally | default     | —                                  |

Migration naming follows `NNNN_snake_case_description.sql`
(`RedyQuote:docs/PROJECT-STRUCTURE.md:273-274`), one logical change per file — `IDENTICAL_CONTENT`
as a **convention**, `MUST_DIVERGE` as **content**.

CuevikSync's `0001`/`0002` must additionally enable `pgmq` and `pg_cron`
(`docs/TECH-STACK.md:95`) and create the `tenants` table plus `tenant_id` scoping. Authoring that
SQL is schema design, not convergence; this C-id specifies the filenames, the ordering
convention, and the immutability rule (C-03), not the DDL.

**Blast radius:** Applying a migration touches a real hosted database with no `db reset` on
either project. Use `/db-migrate`, never a bare `db:push` (C-44).
**Verification:** `npm run db:push` via `/db-migrate` dry-run first; then `npm run db:types` produces `src/lib/supabase/types.ts` without error.
**Depends on:** C-05, C-03
**Effort:** L

---

# C-26 — CI/CD — One canonical CI workflow in both repos

**Canonical form:** RedyQuote, with three additions
**Decided by:** rule 1 — RedyQuote's workflow exists and gates merges; CuevikSync's is a promise
at `docs/TECH-STACK.md:148` ("authored at scaffold time")
**Rationale:** The five-step sequence (`npm ci` → lint → typecheck → format:check → test) is
correct and matches the scripts C-05 defines. Three things are missing from RedyQuote's copy and
belong in the canonical form: `concurrency` (row 13.10 — without it, pushing twice to a PR runs
two full jobs), `permissions` (least privilege; the job needs read-only), and `timeout-minutes`
(a hung job otherwise burns the full 6-hour default).
**Target repo:** BOTH
**Files to change:** CuevikSync `.github/workflows/ci.yml` (create); RedyQuote `.github/workflows/ci.yml` (edit)

**Change detail** — full body, `IDENTICAL_CONTENT`:

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

# One in-flight run per ref. A second push to a PR cancels the first rather than
# queueing a second full install.
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  check:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run format:check
      - run: npm run test
# No Playwright / E2E job. There is no `e2e/`, no `playwright.config.ts`, and no
# `test:e2e` script in either repo, by decision. If E2E is ever adopted, add the
# job here and in the sibling repo in the same change.
```

**Two deletions from RedyQuote's current file:** the `passWithNoTests` comment at `:22-24` (the
claim is false — see C-48) and the Playwright comment at `:26-29` (replaced by the canonical
footer above).

**Blast radius:** `npm run test` now fails an empty suite in CuevikSync (C-11's note). CI will
be red in CuevikSync until the first test lands or `passWithNoTests` is added deliberately.
Flagging this as a live consequence, not a footnote: **CuevikSync's CI will not be green on the
first commit after this batch.** Options are (a) accept red until a test exists, (b) add
`passWithNoTests: true` to both `vitest.config.ts` files with a dated comment, or (c) drop the
`test` step from both workflows until tests exist. (b) keeps the workflows identical and honest
about why; it is the recommended path, and it must be applied to **both** repos or C-26 breaks.
**Verification:** push a branch and confirm the `check` job runs 5 steps and passes in RedyQuote.
**Depends on:** C-04, C-05, C-08, C-09, C-11
**Effort:** M

---

# C-27 — Testing — Remove the unused Playwright and coverage dependencies

**Canonical form:** NEITHER — absent from both, per D-6
**Decided by:** rule 4 — two devDependencies with no config, no specs, and no script are pure
carrying cost; and rule 1 inverted: a dependency that enforces nothing should not be present to
imply that it does
**Rationale:** `@playwright/test ^1.62.0` (`package.json:45`) has no `playwright.config.ts`, no
`e2e/`, and no `test:e2e` script — RedyQuote's own `CLAUDE.md:176-177` says so. `@vitest/coverage-v8`
(`:50`) has no `coverage` block in `vitest.config.ts`. D-6 confirms neither is planned.
**Target repo:** BOTH
**Files to change:**

- RedyQuote `package.json:45`, `:50` — delete both lines; `package-lock.json` regenerates
- CuevikSync `docs/TECH-STACK.md:72` (Playwright row), `docs/ENGINEERING-RULES.md:83-84`, `:98`, `CONTRIBUTING.md:135`, `:161-164`, `README.md:106-114`
- RedyQuote `docs/TECH-STACK.md:54` (Playwright row)

**Change detail:** delete the Playwright rows from both `docs/TECH-STACK.md` §4 tables. Replace
CuevikSync's `README.md` "Run Tests" section body with:

````markdown
```bash
npm run test          # Vitest unit tests — the blocking CI gate, alongside lint and typecheck
```
````

There is no end-to-end suite. No `e2e/`, no `playwright.config.ts`, and no `test:e2e` script
exist in this repo by decision. If E2E is adopted, add the config, the specs, the script, and
the CI job in one change — and mirror it in the sibling repo.

````
CuevikSync `docs/ENGINEERING-RULES.md` §3 — drop the Playwright/WCAG framework sentence and the
E2E half of the CI-gate sentence at `:98`. Keep the three mandatory-case rules at `:91-95`; they
are unit-testable assertions, not E2E-only.

**Blast radius:** RedyQuote's lockfile changes. No code imports either package (verified: no
`e2e/`, no coverage config).
**Verification:** `npm ci && npm run test` in both; `grep -rn 'playwright\|test:e2e' package.json docs/ README.md CLAUDE.md CONTRIBUTING.md .github/` returns only the "no E2E, by decision" notes.
**Depends on:** C-05, C-26
**Effort:** M

---

# C-28 — Documentation — One document-header convention

**Canonical form:** NEITHER (new form defined below)
**Decided by:** G-4 (rule 4) for the `Owner` value; rule 4 for the rest
**Rationale:** The field set and order already match exactly (row 16.30) — this C-id fixes the
four things that do not: the `Owner` value convention, three files with a byte-order mark, an
inconsistent `Contents` rule, and unpadded markdown tables in CuevikSync.
**Target repo:** BOTH
**Files to change:** every `docs/*.md` in both repos

**Change detail** — the canonical header, applied to every permanent document in both repos:
```markdown
# <FILENAME>.md — <Short Title>

**Owner:** Viral Parikh
**Last updated:** YYYY-MM-DD
**Source of truth for:** <one sentence, wrapped at 95 columns>

> Derived from: <comma-separated paths, or "(none — starting point)">
> Downstream: <comma-separated paths, or "(none)">

---

## Contents

<bullet list of `## ` sections — present only when the document has 5 or more of them>
````

Four mechanical fixes:

| Fix             | Where                                                                                                                        | Action                                                                                                                                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Owner:` value  | CuevikSync `docs/ARCHITECTURE.md:3`, `BACKLOG.md:3`, `ENGINEERING-RULES.md:3`, `PRD.md:3`, `PRODUCT.md:3`, `TECH-STACK.md:3` | `Architect` / `Product Owner` / `Viral Parikh (Product Owner)` → `Viral Parikh`                                                                                                                                   |
| Byte-order mark | CuevikSync `docs/PRD.md:1`, `docs/PRODUCT.md:1`, `docs/brainstorming/*.md:1`                                                 | strip the leading `U+FEFF`                                                                                                                                                                                        |
| `## Contents`   | both repos                                                                                                                   | present iff the doc has ≥ 5 `## ` sections. Adds it to CuevikSync `PRODUCT.md`, `TECH-STACK.md`, `ENGINEERING-RULES.md`; RedyQuote `PRODUCT.md`, `PRD.md`, `TECH-STACK.md`, `DESIGN-SYSTEM.md`, `ENVIRONMENTS.md` |
| Table padding   | CuevikSync, all `docs/*.md`                                                                                                  | resolved automatically by C-08 — `npm run format` runs Prettier over `*.md` (`package.json:26-28`) and pads every pipe table                                                                                      |

**Transient documents** additionally carry `**Status:**` and a `> **Transient**` blockquote —
see the form at `RedyQuote:docs/DATABASE-SQL.md:3-13`. That form is canonical for transient docs
in both repos.

**Blast radius:** `npm run format` will rewrite every markdown table in CuevikSync in one commit.
Land C-28 as a standalone commit so the reformat does not hide a content change.
**Verification:** `npm run format:check` passes in both; `grep -rlP '^\xEF\xBB\xBF' docs/` returns nothing.
**Depends on:** C-05, C-08
**Effort:** M

---

# C-29 — Documentation — One README section order

**Canonical form:** NEITHER (new form defined below)
**Decided by:** rule 3 — neither existing order is a superset of the other (rows 16.4, 16.5), and
the goal is that a developer finds the same heading at the same position in both
**Rationale:** CuevikSync has "Environment Setup" and "Run Tests" that RedyQuote lacks;
RedyQuote has "Claude Code Setup", "Documentation Audit", and "Open decisions" that CuevikSync
lacks. All five are worth having in both. The canonical order interleaves them by
what-a-newcomer-needs-first.
**Target repo:** BOTH
**Files to change:** `README.md` in both

**Change detail** — the canonical section order, with source of the body text for each:

| #   | Heading                                                              | CuevikSync body source                                         | RedyQuote body source                         |
| --- | -------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------- |
| 1   | `# {{PRODUCT_NAME}}` + tagline blockquote                            | keep                                                           | keep                                          |
| 2   | badge block (5 badges)                                               | keep, Node → 24 (C-04)                                         | keep                                          |
| 3   | `## Project Overview`                                                | keep                                                           | keep                                          |
| 4   | `## Key Concepts`                                                    | keep                                                           | keep                                          |
| 5   | `## Prerequisites`                                                   | keep                                                           | keep                                          |
| 6   | `## Environment Setup`                                               | keep the variable table; point at `.env.example` (C-14)        | **new** — 2-row table for the two public keys |
| 7   | `## Install & Run`                                                   | keep                                                           | keep                                          |
| 8   | `## Everyday Checks`                                                 | **new** — the five commands CI runs                            | rename from the untitled block at `:75-84`    |
| 9   | `## Claude Code Setup`                                               | **new** — plugin roster table + the shadcn/design-system rules | keep                                          |
| 10  | `## Documentation Audit — /doc-audit`                                | **new** — copy from RedyQuote                                  | keep                                          |
| 11  | `## Project Structure`                                               | keep, updated by C-01                                          | keep                                          |
| 12  | `## Further Reading`                                                 | keep                                                           | keep                                          |
| 13  | `## Open Decisions`                                                  | **new** — CuevikSync's are in `docs/PRODUCT.md` §3A            | keep                                          |
| 14  | footer rule + `> _Last updated:_ YYYY-MM-DD · _Owner:_ Viral Parikh` | change `_Maintainer:_ Cuevik team` → `_Owner:_ Viral Parikh`   | keep                                          |

Section 8 body, `IDENTICAL_CONTENT` in both:

````markdown
Everyday checks — these five are exactly what CI runs on every PR to `main`
([.github/workflows/ci.yml](.github/workflows/ci.yml)):

```bash
npm run lint
npm run typecheck
npm run format:check
npm run test
npm run build
```
````

````

Sections 9 and 10 bodies: copy verbatim from `RedyQuote:README.md:95-169` and `:171-215`,
substituting `{{PRODUCT_NAME}}` and the plugin roster (CuevikSync currently enables 3, RedyQuote 4
— resolved by C-43).

**Blast radius:** Doc-only.
**Verification:** `grep -n '^## ' README.md` in both returns the same 12 headings in the same order.
**Depends on:** C-01, C-04, C-14, C-27, C-43
**Effort:** L

---

# C-30 — Documentation & agent config — One `CLAUDE.md` skeleton

**Canonical form:** NEITHER (new form defined below)
**Decided by:** rule 3 — the two section sets are near-disjoint (row 16.9), so neither can be
adopted wholesale without discarding real content from the other
**Rationale:** CuevikSync's file is governance-shaped (authority order, scope boundaries,
escalation, off-limits); RedyQuote's is state-shaped (project state, approved stack, invariants,
Building UI). Both halves are load-bearing. The canonical skeleton is the union in a fixed
order, with `@import` used to avoid restating rules that live in `docs/`.
**Target repo:** BOTH
**Files to change:** `CLAUDE.md` in both

**Change detail** — canonical section order:

| # | Section | Source | Notes |
| --- | --- | --- | --- |
| 1 | `# CLAUDE.md — {{PRODUCT_NAME}}` | — | one-line intro |
| 2 | `## Source-of-truth docs` | RedyQuote `:5-60` | the annotated doc list, plus the transient-spec block |
| 3 | `## Engineering rules` | CuevikSync `:6-16` | `@docs/ENGINEERING-RULES.md` import — requires C-32 in RedyQuote |
| 4 | `## Authority order` | CuevikSync `:18-27` | filesystem > CONTRIBUTING > docs lineage > this file > README |
| 5 | `## Project state` | RedyQuote `:71-132` | dated snapshot; CuevikSync's is one line until C-15…C-25 land |
| 6 | `## Approved stack` | RedyQuote `:134-141` | short form; `docs/TECH-STACK.md` is authority |
| 7 | `## Non-negotiable invariants` | RedyQuote `:143-163` | structural guarantees only |
| 8 | `## Scope boundaries` | CuevikSync `:29-43` | in-bounds / out-of-bounds |
| 9 | `## Decision escalation` | CuevikSync `:45-60` | |
| 10 | `## Off-limits` | CuevikSync `:62-78` | |
| 11 | `## Agent behavior` | CuevikSync `:80-94` | |
| 12 | `## Workflow` | CuevikSync `:96-105` | branch/PR/push constraints |
| 13 | `## Claude Code-specific config` | both — CuevikSync `:107-125` + RedyQuote `:164-218` | commands, slash commands, hooks, permissions |
| 14 | `## Building UI` | RedyQuote `:220-368` | |
| 15 | `## When blocked` | CuevikSync `:127-130` | |

Sections 4, 8, 9, 10, 11, 12, 15 are `IDENTICAL_CONTENT` — copy verbatim from
`CuevikSync:CLAUDE.md`, substituting product-specific nouns.
Sections 7, 14 are `IDENTICAL_TEMPLATE_PARAMETERIZED` — RedyQuote's invariants and UI rules,
with the invariant list itself repo-specific.
Sections 2, 5, 6, 13 are `IDENTICAL_TEMPLATE_PARAMETERIZED` on the doc list, state snapshot,
stack summary, and command list.

**Two edits worth calling out:**
- CuevikSync's `@docs/ENGINEERING-RULES.md` import (`:8`) is the right mechanism and is unique to
  it (row 16.10). RedyQuote adopts it once C-32 creates the target file.
- RedyQuote's `## Project state` carries a "Last verified: YYYY-MM-DD" stamp (`:73`) and the
  instruction "Confirm a file or script still exists before relying on this section." Keep that
  discipline in both — it is what makes a state snapshot safe to include at all, and it is
  exactly the discipline that failed in row 11.10.

**Blast radius:** Doc-only, but this file drives agent behaviour in both repos. Land it after
the code and config C-ids so section 5's state snapshot is written once, correctly.
**Verification:** `grep -n '^## ' CLAUDE.md` in both returns the same 14 headings in the same order.
**Depends on:** C-32, and all of Batches B–E
**Effort:** L

---

# C-31 — Branching, PR & release — `CONTRIBUTING.md` in both, and author the self-review checklist

**Canonical form:** CuevikSync, with the missing checklist authored
**Decided by:** rule 3 — `CONTRIBUTING.md` at the repo root is where a contributor looks for
branching and commit rules; RedyQuote has no such file and its rules are scattered across
`CLAUDE.md` and nowhere (rows 18.1–18.9)
**Rationale:** CuevikSync's governance layer is complete except for one hole, and that hole is
the load-bearing part. `CONTRIBUTING.md:11` calls the self-review checklist "the gate", `:35`
says "Complete the self-review checklist", `:98-99` calls it "the gate that matters" — and no
checklist appears in the 205 lines (row 16.63). A governance model whose only merge gate is
undefined is not a governance model.
**Target repo:** BOTH
**Files to change:** RedyQuote `CONTRIBUTING.md` (create); CuevikSync `CONTRIBUTING.md` (add §Self-review checklist; remove §Environment per C-35)

**Change detail:** copy `CuevikSync:CONTRIBUTING.md` to RedyQuote, then apply to **both**:

1. **Insert the missing checklist** as a new section immediately after "Review flow". Full body,
   `IDENTICAL_CONTENT`:
```markdown
## Self-review checklist

This is the merge gate. There is no required reviewer, so this list is what stands between a
change and `main`. Complete it against the actual diff, not against memory of what you meant
to do.

- [ ] `git diff main...HEAD --stat` reviewed file by file. Every changed file is one I meant
      to change; nothing arrived by accident.
- [ ] `npm run lint`, `npm run typecheck`, `npm run format:check`, and `npm run test` all pass
      locally, on the merge state — not just on the last file I edited.
- [ ] Every change traces to a requirement, an approved spec, or an explicit instruction. No
      invented scope, no opportunistic refactor, no "while I was in there".
- [ ] No source-of-truth document under `docs/`, nor `CLAUDE.md`, nor `CONTRIBUTING.md`, is
      touched in this PR — unless the PR is *only* that documentation change (see
      "Documentation changes" below).
- [ ] No secret, key, connection string, or `.env*` value appears anywhere in the diff, in a
      code comment, or in a test fixture.
- [ ] No dependency added or removed without the corresponding `docs/TECH-STACK.md` change
      landing first, in its own PR.
- [ ] Any schema change is a **new** migration file. No already-merged migration was edited.
- [ ] Any new external input — request body, form payload, URL parameter — is validated
      against a Zod schema server-side before it reaches a domain module or the database.
- [ ] Comments explain *why*, not *what*. Anything non-obvious carries its reason.
- [ ] Commit messages follow the convention below and describe the change, not the process
      that produced it.

If a box cannot be ticked, the PR is not ready. Fix it or say why in the PR description — an
explicit, reasoned exception is fine; a silently unticked box is not.
````

2. **Adopt scoped Conventional Commits** (row 12.15). CuevikSync documents `<type>: <summary>`
   at `:58`; RedyQuote's git history uses `<type>(<scope>): <summary>` — e.g. `b4e1760
feat(quotes): sort, paginate, and move filters into the URL`. Rule 1: the practised form wins,
   and the scope is genuinely useful in a repo with several route groups. Canonical:

```text
<type>(<scope>): <short summary>
```

with the scope optional for repo-wide changes. Types unchanged: `feat`, `fix`, `chore`,
`docs`, `refactor`, `test`, `build`, `ci`.

3. **Parameterize the Tooling layer** — the run-commands table becomes a pointer to
   `package.json`, which C-05 makes the single authority (row 15.1):

```markdown
The `package.json` `scripts` block is the authority on what commands exist. Do not invent a
script; do not document one here that is not in that file. The everyday five are listed in
[README.md](README.md) § Everyday Checks.
```

4. **Remove §Environment** from CuevikSync's copy (`:171-193`) — it moves to
   `docs/ENVIRONMENTS.md` under C-35.

5. **Fill or delete the development-phase placeholder** at CuevikSync `:42-49`
   (row 18.13). Development has started; the block's own instruction says to fill it in and
   remove the note. The self-review checklist above _is_ the CI-gate-and-review-model half of
   what it asks for.

**Parameters:**

| Parameter          | CuevikSync              | RedyQuote                      |
| ------------------ | ----------------------- | ------------------------------ |
| `{{PRODUCT_NAME}}` | `CuevikSync`            | `RedyQuote`                    |
| review model       | solo / process-enforced | solo / process-enforced (same) |

**Blast radius:** RedyQuote gains a governance document it did not have. The checklist's
migration and Zod items reference conventions both repos already hold.
**Verification:** `test -f CONTRIBUTING.md` in both; `grep -c '^- \[ \]' CONTRIBUTING.md` returns 10 in both.
**Depends on:** C-05, C-35
**Effort:** M

---

# C-32 — Documentation — `docs/ENGINEERING-RULES.md` in RedyQuote

**Canonical form:** CuevikSync
**Decided by:** rule 3 — a single file named for what it contains beats the same rules scattered
across `CLAUDE.md`, `docs/PROJECT-STRUCTURE.md` §4, and `eslint.config.mjs` comments
**Rationale:** CuevikSync's three-section shape (Coding Conventions / Banned Patterns / Testing
Rules) is the right container, and `CLAUDE.md`'s `@import` of it (row 16.10) is the mechanism
that keeps the rules in an agent's context without duplicating them. RedyQuote has equivalent
rules but no such file, so C-30's section 3 has nothing to import.
**Target repo:** RedyQuote
**Files to change:** `docs/ENGINEERING-RULES.md` (create); `CLAUDE.md` (add the `@import`, via C-30)

**Change detail:** copy the structure from `CuevikSync:docs/ENGINEERING-RULES.md`, keeping §1/§2/§3
and the header block. `IDENTICAL_TEMPLATE_PARAMETERIZED` — the section _shape_ is identical, the
rule _content_ is per-repo. Rules that are genuinely shared and must appear verbatim in both:

- §1 Language: TypeScript 5.x `strict`, `tsc --noEmit` must pass, `any` needs a stated reason
- §1 Formatting & linting: Prettier sole formatter, ESLint 9 flat config sole linter, no `next lint`
- §1 Routing: App Router only, Pages Router banned
- §1 Database access: no ORM, `@supabase/supabase-js` + generated types
- §1 Schema changes: Supabase CLI migrations only, dashboard editing prohibited
- §1 Validation: Zod only, all external input validated server-side
- §1 Mutation path: the C-02 rule, verbatim
- §1 Package manager: `npm` only
- §1 Comments: why, not what
- §1 Do not contradict the docs
- §2 Banned: browser-to-Postgres direct CRUD; shipping the service-role key to the browser;
  introducing an ORM; hand-rolled validation; hand-rolled auth; Pages Router / `next lint`;
  raw Tailwind palette classes and hex literals (the C-09 rule, stated in prose too)
- §3 Testing: Vitest for units, co-located `*.test.ts`, no numeric coverage gate by decision,
  do not mock away the security boundary

Per-repo (`MUST_DIVERGE` within the shared shape): CuevikSync keeps its capture-path and
multi-tenant bans (`:51-55`, `:70-71`, `:78-79`); RedyQuote adds its append-never-overwrite and
atomic-RPC rules from `CLAUDE.md:153-163`.

**Blast radius:** Doc-only. Enables C-30 section 3 in RedyQuote.
**Verification:** `test -f docs/ENGINEERING-RULES.md` in both; `grep -n '^## ' docs/ENGINEERING-RULES.md` returns the same 3 headings in both.
**Depends on:** C-02
**Effort:** M

---

# C-33 — Documentation — `docs/PROJECT-STRUCTURE.md` in CuevikSync

**Canonical form:** RedyQuote
**Decided by:** rule 3 — CuevikSync's structure documentation is a 7-line code block inside
`README.md` (`:122-129`); RedyQuote has a dedicated 354-line file with a placement decision
procedure
**Rationale:** §2 "The Four Placement Questions" (`:190`) and §4 "File Placement Rules" (`:231`)
are the mechanism that makes row 2.2's boundary rule usable — they turn "keep domain logic in
its module" into a decision procedure. §5 Naming Conventions is the canonical home for the
route/component/migration/test naming rules this spec relies on throughout.
**Target repo:** CuevikSync
**Files to change:** `docs/PROJECT-STRUCTURE.md` (create); `README.md` Project Structure section (point at it)

**Change detail:** copy the section shape from `RedyQuote:docs/PROJECT-STRUCTURE.md` — §1
Directory Tree, §2 The Four Placement Questions, §3 What Lives Where, §4 File Placement Rules,
§5 Naming Conventions, §6 Keeping This File Honest, plus `## Contents`.

§5 is `IDENTICAL_CONTENT` — copy verbatim from `RedyQuote:docs/PROJECT-STRUCTURE.md:261-304`,
dropping the two RedyQuote-specific asides (the `library.ts` vs `components.ts` note at `:270-272`,
and the `docs/superpowers/**` paragraph at `:296-304`, which C-41 supersedes). The remaining
rules — kebab-case routes, `_components/` with PascalCase, `NNNN_snake_case` migrations,
`src/lib/` with no JSX, `src/proxy.ts` as the middleware name, `*.test.ts` co-located,
SCREAMING-KEBAB docs — apply identically.

§1, §3, §4 are `IDENTICAL_TEMPLATE_PARAMETERIZED` on the directory tree and module list.
§6's discipline — "If reality must diverge, update this file in the same change" — is
`IDENTICAL_CONTENT`, including the closing paragraph at `:349-354` about how the file went stale
once. That paragraph is the most useful thing in the document and applies to any repo.

**Blast radius:** Doc-only.
**Verification:** `grep -n '^## ' docs/PROJECT-STRUCTURE.md` returns the same 7 headings in both.
**Depends on:** C-01, C-22
**Effort:** L

---

# C-34 — Documentation — `docs/DESIGN-SYSTEM.md` in CuevikSync

**Canonical form:** RedyQuote, parameterized (D-13)
**Decided by:** rule 1 — the token rules it documents are the ones C-09 enforces; a repo with the
lint rule and no explanatory doc leaves a developer guessing why a hex literal fails
**Rationale:** 11 of 13 sections are architecture, not brand: the three tiers, the
semantic-tokens-only rule, the AA floor method, dark-mode derivation, the scales, the
editable-vs-calculated convention, the token map format, and "adding a component". Only §1
(provenance) and the literal values in §4/§9/§12 are product-specific.
**Target repo:** CuevikSync
**Files to change:** `docs/DESIGN-SYSTEM.md` (create)

**Change detail:** copy verbatim from `RedyQuote:docs/DESIGN-SYSTEM.md` (459 lines), then apply
the substitution table. Registry deviation declared at the top of this document.

Canonical section list, identical in both: §1 Where the brand values came from · §2 The three
tiers · §3 The one rule: semantic tokens only · §4 Accessibility floor · §5 Dark mode is derived,
not designed · §6 Decisions worth not re-litigating · §7 The editable-vs-calculated convention ·
§8 Typography · §9 Scales · §10 Chart series · §11 Voice · §12 Token map · §13 Adding a component.

**Parameters:**

| Parameter                                                  | CuevikSync                          | RedyQuote                                  |
| ---------------------------------------------------------- | ----------------------------------- | ------------------------------------------ |
| `{{BRAND_PRIMARY}}` / `{{BRAND_INK}}` / `{{BRAND_ACCENT}}` | `#0F6E6E` / `#1A1A1A` / `#B45309`   | `#A81D22` / `#1A1A1A` / `#1E5FBF`          |
| §1 provenance narrative                                    | see below                           | the three-supersession history at `:29-52` |
| §4 computed contrast table                                 | re-solve for the CuevikSync anchors | as authored                                |
| §9 scale values                                            | identical — same ladder             | identical                                  |
| §12 token map                                              | re-solve                            | as authored                                |

CuevikSync §1 replacement body, marking the values provisional per D-14:

```markdown
## 1. Where the brand values came from

**Provisional.** CuevikSync has no ratified brand palette. The three Tier-1 anchors below were
chosen during the 2026-08-11 convergence work to satisfy two constraints and nothing else:
clear the WCAG 2.1 AA floor in §4, and sit far enough from RedyQuote's red that the two products
are not mistaken for one another.

| Value                    | Source                                                              | White-on-color contrast |
| ------------------------ | ------------------------------------------------------------------- | ----------------------- |
| Primary `#0F6E6E` (teal) | Provisional — convergence placeholder                               | 6.04:1                  |
| Ink `#1A1A1A`            | Neutral near-black, shared with RedyQuote — not a brand-owned value | 17.4:1 on white         |
| Accent `#B45309` (amber) | Provisional — convergence placeholder                               | 5.02:1                  |

Everything below §1 is **not** provisional. The three-tier architecture, the semantic token
names, the scales, the dark-mode derivation, and the "compute the contrast, don't eyeball it"
rule are the same system RedyQuote uses and are settled.

Replacing these three hexes is a three-value edit in `src/app/globals.css` plus a re-solve of
the five derived oklch primitives in §4. Nothing else moves.
```

**Blast radius:** Doc-only, but it is the reference C-15's re-solve must be recorded against.
**Verification:** `grep -n '^## ' docs/DESIGN-SYSTEM.md` returns the same 13 headings in both; every hex in CuevikSync's §4 table has a computed contrast figure ≥ 4.5:1.
**Depends on:** C-15
**Effort:** L

---

# C-35 — Documentation — `docs/ENVIRONMENTS.md` in CuevikSync, and move the content out of `CONTRIBUTING.md`

**Canonical form:** RedyQuote
**Decided by:** rule 3 — this is the clearest locatability miss in the audit (row 16.21). Both
repos document which Supabase environment development runs against; CuevikSync buries it in
`CONTRIBUTING.md` § Environment (`:171-193`), RedyQuote gives it a named file.
**Rationale:** Environment topology is not governance. It changes when infrastructure changes,
not when process changes, and it is referenced from `README.md` Prerequisites and from
`CLAUDE.md` — neither of which should have to point into the middle of a contributing guide.
**Target repo:** BOTH
**Files to change:** CuevikSync `docs/ENVIRONMENTS.md` (create), `CONTRIBUTING.md:171-193` (delete), `README.md` + `CLAUDE.md` (update the cross-references); RedyQuote — no change

**Change detail:** canonical section list, identical in both: §1 Current State · §2 Plans & Cost ·
§3 Working Rules · §4 Plan: Adopting the Local Docker Stack · §5 Keeping This File Honest.

CuevikSync's §1 and §3 are populated from the two-environment table at `CONTRIBUTING.md:175-178`
and the migration-ordering rules at `:183-193`. Note that §1 will differ substantively: RedyQuote
is hosted-only with no Docker (`docs/ENVIRONMENTS.md:13`), CuevikSync mandates the local stack
for tests (`docs/ENGINEERING-RULES.md:84-86`). That is Phase 2 row 5.14 and it is a real
contradiction — **but it is not this C-id's to resolve**, because it is a genuine difference in
what each project needs: CuevikSync's mandatory tenant-isolation and worker-idempotency tests
are destructive and cannot run against a hosted dev project. The file converges on **structure
and location**; §1's content diverges, and both files say so explicitly in §1's first line.

CuevikSync `CONTRIBUTING.md` keeps a one-line pointer where §Environment was:

```markdown
## Environment

Which Supabase environment development runs against, and the migration-ordering rules that
follow from it, are in [docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md).
```

**Blast radius:** Any link to `CONTRIBUTING.md#environment` breaks — `CLAUDE.md` and
`docs/ENGINEERING-RULES.md:86` both reference it. Update both in the same change.
**Verification:** `test -f docs/ENVIRONMENTS.md` in both; `grep -rn 'CONTRIBUTING.md.*[Ee]nvironment' docs/ CLAUDE.md README.md` in CuevikSync returns only the pointer.
**Depends on:** none
**Effort:** M

---

# C-36 — Documentation — `docs/DATABASE.md` stub in CuevikSync

**Canonical form:** RedyQuote (structure only)
**Decided by:** rule 3, bounded by D-7 — the filename and section skeleton converge; the content
does not exist and Phase 3 does not author a schema
**Rationale:** A developer moving to CuevikSync should find the data model at
`docs/DATABASE.md`, not discover there is no such file and go hunting through
`docs/ARCHITECTURE.md` §2.
**Target repo:** CuevikSync
**Files to change:** `docs/DATABASE.md` (create)

**Change detail** — full body, ready to write:

```markdown
# DATABASE.md — Data Model

**Owner:** Viral Parikh
**Last updated:** 2026-08-11
**Source of truth for:** CuevikSync's entities, their columns and constraints, and the design
decisions behind why each table looks the way it does.

> Derived from: docs/PRD.md, docs/ARCHITECTURE.md, docs/PRODUCT.md, docs/TECH-STACK.md
> Downstream: `src/lib/supabase/types.ts`

**This file describes the model, not the DDL.** The SQL that implements it lives in
`supabase/migrations/*.sql`, which docs/ARCHITECTURE.md §5 makes the authoritative schema.

---

> **Not yet authored.** The schema beyond the initial migrations (C-25) has not been designed.
> The section skeleton below matches `RedyQuote:docs/DATABASE.md` so the two repos stay
> navigable; each section is filled as the corresponding tables are designed. Do not infer a
> model from this file's existence — check `supabase/migrations/` for what actually exists.

## Contents

- [1. System Summary](#1-system-summary)
- [2. Entity List](#2-entity-list)
- [3. ERD](#3-erd)
- [4. Table Definitions](#4-table-definitions)
- [5. Design Decisions](#5-design-decisions)
- [6. Open Items](#6-open-items)

## 1. System Summary

_Not yet authored._

## 2. Entity List

_Not yet authored._

## 3. ERD

_Not yet authored._

## 4. Table Definitions

_Not yet authored._ Tenant isolation is by row-level `tenant_id` with RLS as the enforcement
locus (docs/ARCHITECTURE.md §5) — every table added here carries it.

## 5. Design Decisions

_Not yet authored._

## 6. Open Items

_Not yet authored._
```

**Blast radius:** None.
**Verification:** `grep -n '^## ' docs/DATABASE.md` returns the same 7 headings in both repos.
**Depends on:** C-28
**Effort:** S

---

# C-37 — Documentation — `docs/BACKLOG.md` stub in RedyQuote

**Canonical form:** CuevikSync (structure only)
**Decided by:** rule 3, bounded by D-7
**Rationale:** Same argument as C-36, mirrored. CuevikSync's file is itself a deliberate stub
(`docs/BACKLOG.md:5` — "intentionally deferred; to be built incrementally at development
start"), so the canonical form is already stub-shaped.
**Target repo:** RedyQuote
**Files to change:** `docs/BACKLOG.md` (create)

**Change detail** — full body, ready to write:

```markdown
# BACKLOG.md — Initial Backlog Manifest

**Owner:** Viral Parikh
**Last updated:** 2026-08-11
**Source of truth for:** the epics/stories manifest and host item IDs.

> Derived from: docs/PRODUCT.md, docs/PRD.md, docs/ARCHITECTURE.md, docs/TECH-STACK.md, docs/ENGINEERING-RULES.md, README.md
> Downstream: (none — terminal document)

---

> **Not yet authored.** RedyQuote's work has been tracked in branches and PRs rather than a
> manifest. This file exists so the document set matches CuevikSync's; fill it when a backlog
> is actually kept here, and delete this note in the same change.

## 1. Summary

_Not yet authored._

## 2. Epics

_Not yet authored._

## 3. Stories

_Not yet authored._

## 4. Out-of-Scope Notes

See [docs/PRODUCT.md](PRODUCT.md) §4 and [docs/TECH-STACK.md](TECH-STACK.md) §5.
```

**Blast radius:** None.
**Verification:** `grep -n '^## ' docs/BACKLOG.md` returns the same 4 headings in both.
**Depends on:** C-28
**Effort:** S

---

# C-38 — Documentation — One `docs/TECH-STACK.md` section set

**Canonical form:** NEITHER (new form defined below)
**Decided by:** rule 3 — §5 currently means two different things (row 16.16): "Selection
Trade-offs" in CuevikSync, "Deliberately Not Used" in RedyQuote. A developer reading §5 in one
repo and then the other gets a different kind of information under the same number
**Rationale:** Both sections are worth keeping and they answer different questions — "why this
over the alternative" versus "what we explicitly rejected". Give them separate numbers.
**Target repo:** BOTH
**Files to change:** `docs/TECH-STACK.md` in both

**Change detail** — canonical section set:

| §   | Heading                         | CuevikSync today | RedyQuote today |
| --- | ------------------------------- | ---------------- | --------------- |
| 1   | Languages & Frameworks          | §1               | §1              |
| 2   | Datastores                      | §2               | §2              |
| 3   | Cloud & Infrastructure Services | §3               | §3              |
| 4   | Key Libraries / Tools           | §4               | §4              |
| 5   | Deliberately Not Used           | **new**          | §5              |
| 6   | Selection Trade-offs            | §5 → renumber    | **new**         |
| 7   | Versions & Constraints          | §6 → renumber    | §6 → renumber   |

CuevikSync's new §5 is populated by C-02 (TanStack Query) and C-27 (Playwright), plus the
technologies its §4/§6 prose already excludes: ORMs, external queue vendors, headless-browser
PDF rendering, LLM/vector stores.

RedyQuote's new §6 is populated from the rationale already embedded in its §5 "Why not" column
and its `docs/ARCHITECTURE.md` §4 — Server Actions over an SPA/JSON-API split, Supabase managed
platform over self-hosted, database-enforced approval gate over a UI check.

**Every `§N` cross-reference in both repos must be updated in the same change.** Known
references to the renumbered sections: CuevikSync `README.md:48`, `:66`, `:94`, `:107`;
`CLAUDE.md:52`, `:58`; `docs/ENGINEERING-RULES.md:46`, `:57`; `CONTRIBUTING.md:107`, `:111`, `:157`.
RedyQuote: `README.md:64`, `:234`; `CLAUDE.md:140`, `:353`; `.env.example:12`;
`docs/PROJECT-STRUCTURE.md:258`; `docs/ENVIRONMENTS.md` header.

**Blast radius:** Cross-reference rot is the real risk here — a stale `§6` pointing at
"Versions & Constraints" now lands on "Selection Trade-offs". Run `/doc-audit drift` after.
**Verification:** `grep -n '^## ' docs/TECH-STACK.md` returns the same 7 headings in both; `grep -rn 'TECH-STACK.md §' . --include=*.md` resolves every reference to an existing section.
**Depends on:** C-02, C-27
**Effort:** M

---

# C-39 — Documentation — One `docs/ARCHITECTURE.md` section set

**Canonical form:** CuevikSync
**Decided by:** rule 3 — CuevikSync's §1–§9 is a superset of RedyQuote's §1–§8, and its three
longer headings are more precise (row 16.15)
**Rationale:** RedyQuote lacks §9 Observability & Operations. It has an observability position —
Sentry and PostHog cut for v1 (`docs/TECH-STACK.md:65-66`) — and that position deserves a
section rather than being inferable only from a "not used" table.
**Target repo:** BOTH
**Files to change:** `docs/ARCHITECTURE.md` in both

**Change detail** — canonical section set, headings identical:

| §   | Heading                                | CuevikSync    | RedyQuote                               |
| --- | -------------------------------------- | ------------- | --------------------------------------- |
| —   | `## Contents`                          | present `:12` | present `:13`                           |
| 1   | System Architecture                    | `:26`         | `:26`                                   |
| 2   | Data Design                            | `:110`        | `:75`                                   |
| 3   | Data Flow & Interactions               | `:148`        | `:91` — rename from "Data Flow"         |
| 4   | Key Design Decisions                   | `:216`        | `:121`                                  |
| 5   | Implementation Conventions             | `:236`        | `:135`                                  |
| 6   | Integration Points                     | `:270`        | `:167`                                  |
| 7   | Security Posture & Data Classification | `:279`        | `:174` — rename from "Security Posture" |
| 8   | Non-Functional Approach                | `:392`        | `:206`                                  |
| 9   | Observability & Operations             | `:416`        | **new**                                 |

RedyQuote's new §9 body — short and honest:

```markdown
## 9. Observability & Operations

No error-tracking or analytics vendor is wired. Sentry and PostHog are deliberately cut for v1
(docs/TECH-STACK.md §5) — a single internal tool with a known user set has no onboarding funnel
to measure and no anonymous error volume to triage.

What exists instead:

- **Crash surface** — `src/app/global-error.tsx` shows `error.digest` and nothing else; the
  digest is the correlation handle between a user report and the platform log.
- **Platform logs** — Vercel function logs and Supabase logs are the only telemetry.

**Gap, stated rather than papered over:** there is no alerting. A failed write, a broken RLS
policy, or a 500 on the approval path surfaces only when a user reports it. Revisit at
production cutover, alongside the Supabase Pro move in docs/TECH-STACK.md §7.
```

**Blast radius:** Two heading renames in RedyQuote break any `#data-flow` or `#7-security-posture`
anchor link. `grep -rn '#data-flow\|#7-security-posture' .` before landing.
**Verification:** `grep -n '^## ' docs/ARCHITECTURE.md` returns the same 10 headings in both.
**Depends on:** C-28
**Effort:** M

---

# C-40 — Documentation — One `docs/PRODUCT.md` and one `docs/PRD.md` section set

**Canonical form:** CuevikSync
**Decided by:** rule 3 — CuevikSync's section sets are supersets in both files (rows 16.13,
16.14), and RedyQuote's `docs/PRD.md` has only 4 sections and no `## Contents`
**Rationale:** The gap is large — CuevikSync's PRD has 12 sections to RedyQuote's 4 — so D-7's
stub rule does most of the work here. A missing section marked "not yet authored" is navigable;
a missing section is not.
**Target repo:** BOTH
**Files to change:** `docs/PRODUCT.md`, `docs/PRD.md` in both

**Change detail:**

**`docs/PRODUCT.md`** canonical sections: `## Contents` · §1 Overview · §2 Target Users ·
§3 Features · §3A Decision Placeholders · §4 Scope (In / Out) · §5 Success Criteria ·
§6 Anti-Patterns · §7 Roadmap · `## Glossary`.
RedyQuote gains §7 and the Glossary as stubs; CuevikSync renames §7 "Target Verticals —
Expansion Roadmap" → "Roadmap" with the vertical content as its body.

**`docs/PRD.md`** canonical sections: `## Contents` · §1 Overview · §2 Target Users ·
§3 Problem Statements · §4 Features / Capabilities · §5 User Stories · §6 Functional
Requirements · §7 Non-Functional Requirements · §7A Placeholder Specifications ·
§8 Acceptance Criteria · §9 Out of Scope · §10 Dependencies & Assumptions · §11 Constraints ·
§12 Risks & Edge Cases.

RedyQuote's mapping: current §1 Functional Requirements → §6 · §2 Non-Functional Requirements →
§7 · §2A Placeholder Specifications → §7A · §3 Explicit Non-Requirements → §9 Out of Scope.
Sections 1–5, 8, 10, 11, 12 are added as stubs:

```markdown
## N. <Heading>

_Not yet authored. See [docs/PRODUCT.md](PRODUCT.md) §M for the nearest existing statement._
```

**This renumbers every RedyQuote requirement cross-reference.** `PRD §2A` appears in
`CLAUDE.md:112`, `:132`, `:171`, `:254`; `README.md:88`, `:244`; `docs/DATABASE.md` §6;
`docs/DATABASE-SQL.md` §4; `src/lib/utils.ts:13` (removed by C-17); `src/lib/validation/settings.ts`.
It becomes `PRD §7A`. `PRD-0NN` requirement IDs are unaffected — they are IDs, not section numbers.

**Blast radius:** High cross-reference churn in RedyQuote, low content risk. This is the largest
find-and-replace in the spec. Land it as a standalone commit and run `/doc-audit drift` after.
**Verification:** `grep -n '^## ' docs/PRD.md` returns the same 14 headings in both; `grep -rn 'PRD §2A' .` returns nothing in RedyQuote.
**Depends on:** C-28
**Effort:** L

---

# C-41 — Documentation — One path convention for specs and reviews

**Canonical form:** NEITHER (new form defined below)
**Decided by:** rule 3, with rule 4 constraining the solution — CuevikSync files advisory
documents at `docs/reviews/<SUBJECT>-review-<DATE>.md`, RedyQuote at
`docs/superpowers/specs/<DATE>-<slug>-design.md` (row 16.28). Same purpose, different directory,
different filename ordering, and one of them is named after a tool
**Rationale:** `docs/PROJECT-STRUCTURE.md:296-304` defends `docs/superpowers/` on the grounds
that the plugin recreates the folder if moved. That argument justifies leaving _plugin output_
there — it does not justify treating a tool's scratch path as the canonical home for approved,
authoritative specs. RedyQuote already applies exactly this reasoning inconsistently:
`.superpowers/` is gitignored as "regenerable coordination state" (`.gitignore:53-57`) while
`docs/superpowers/plans/` — the same kind of state — is committed.
**Target repo:** BOTH
**Files to change:**

- RedyQuote: move 3 files from `docs/superpowers/specs/` → `docs/specs/`, rename each; delete `docs/superpowers/plans/`; add `docs/superpowers/` to `.gitignore`; update `CLAUDE.md:29-45` links
- CuevikSync: create `docs/specs/`; rename `docs/reviews/TECH-STACK-review-2026-07-18.md`
- Both: record the convention in `docs/PROJECT-STRUCTURE.md` §5 (C-33)

**Change detail** — the canonical convention:

| Kind                                                             | Path                                 | Filename                         | Lifetime                                                  |
| ---------------------------------------------------------------- | ------------------------------------ | -------------------------------- | --------------------------------------------------------- |
| Design spec (authoritative for its slice, deleted when absorbed) | `docs/specs/`                        | `YYYY-MM-DD-<slug>.md`           | transient — listed in `CLAUDE.md` "Approved design specs" |
| Advisory review (opinion, never authoritative)                   | `docs/reviews/`                      | `YYYY-MM-DD-<subject>-review.md` | permanent                                                 |
| Pre-decision exploration                                         | `docs/brainstorming/`                | `<topic>.md`                     | permanent, `**Status:** Draft`                            |
| Tool scratch output                                              | `docs/superpowers/`, `.superpowers/` | tool's choice                    | **gitignored**                                            |

Date-first for specs and reviews so a directory listing sorts chronologically, which is how both
are read.

Moves:

| From                                                                           | To                                                                      |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `RedyQuote:docs/superpowers/specs/2026-07-23-authorization-matrix-design.md`   | `RedyQuote:docs/specs/2026-07-23-authorization-matrix.md`               |
| `RedyQuote:docs/superpowers/specs/2026-08-01-branding-assets-upload-design.md` | `RedyQuote:docs/specs/2026-08-01-branding-assets-upload.md`             |
| `RedyQuote:docs/superpowers/specs/2026-08-09-list-sort-pagination-design.md`   | `RedyQuote:docs/specs/2026-08-09-list-sort-pagination.md`               |
| `RedyQuote:docs/superpowers/plans/2026-08-09-list-sort-pagination.md`          | deleted — regenerable coordination state, same class as `.superpowers/` |
| `CuevikSync:docs/reviews/TECH-STACK-review-2026-07-18.md`                      | `CuevikSync:docs/reviews/2026-07-18-tech-stack-review.md`               |

The `-design` suffix is dropped — every file in `docs/specs/` is a design spec, so the suffix
carries no information.

**`docs/superpowers/` is gitignored, not deleted.** The plugin will recreate it; that is fine
once git no longer tracks it. Add to the C-13 canonical `.gitignore`:

```
# superpowers plugin output. Approved specs are moved to docs/specs/ and listed
# in CLAUDE.md; what the plugin leaves behind here is scratch, same class as
# .superpowers/ above.
docs/superpowers/
```

**Blast radius:** RedyQuote `CLAUDE.md:29-45` links three specs by path — all three break until
updated in the same change. Deleting the plan file loses a work-in-progress ledger; its subject
(`list-sort-pagination`) is already merged as `b4e1760`, so the git history it points at survives.
**Verification:** `test -d docs/specs && test ! -d docs/superpowers` (or gitignored) in RedyQuote; `git ls-files docs/superpowers` returns nothing; every link in `CLAUDE.md` resolves.
**Depends on:** C-13, C-33
**Effort:** M

---

# C-42 — Documentation — `docs/brainstorming/` in RedyQuote

**Canonical form:** CuevikSync
**Decided by:** no contest — only CuevikSync has this (row 16.24)
**Rationale:** C-41's convention table needs all four kinds to exist in both repos, or a
developer in RedyQuote has nowhere to put pre-decision exploration and will put it in `docs/`
root — which is where permanent source-of-truth documents live.
**Target repo:** RedyQuote
**Files to change:** `docs/brainstorming/README.md` (create)

**Change detail** — full body, ready to write:

```markdown
# Brainstorming

Pre-decision exploration. Nothing here is authoritative.

A file in this folder carries `**Status:** Draft` in its header and may contradict the
source-of-truth documents in `docs/` — that is what it is for. When a decision here is ratified,
it moves into the document that owns it (PRODUCT, PRD, ARCHITECTURE, TECH-STACK) in a standalone
documentation change, and the draft is either deleted or annotated to say where the decision now
lives.

Do not cite a file in this folder as a reason to write code.

See [docs/PROJECT-STRUCTURE.md](../PROJECT-STRUCTURE.md) §5 for the full document-kind table.
```

CuevikSync gains the same `README.md` in its existing `docs/brainstorming/`.

**Blast radius:** None.
**Verification:** `test -f docs/brainstorming/README.md` in both.
**Depends on:** C-41
**Effort:** S

---

# C-43 — Agent config — Unify `.claude/settings.json`

**Canonical form:** RedyQuote
**Decided by:** rule 1 — RedyQuote's plugin roster and `IMPECCABLE_CONTEXT_DIR` are committed
and therefore actually shared; CuevikSync's identical settings sit in gitignored
`.claude/settings.local.json` (rows 16.40–16.42), so a second developer gets neither
**Rationale:** `permissions`, `hooks`, and the deny/ask lists are already byte-identical (rows
16.37–16.39). The only divergence is which file holds `env` and the plugin declarations, and
that divergence has a correctness consequence: CuevikSync's impeccable context pin is
per-machine, so impeccable would read a root `PRODUCT.md` on a fresh clone and route to
`/impeccable teach` — the failure RedyQuote's `CLAUDE.md:296-301` warns about.
**Target repo:** CuevikSync
**Files to change:** `.claude/settings.json` (add three blocks); `.claude/settings.local.json` (empty or delete)

**Change detail** — canonical key order, `IDENTICAL_TEMPLATE_PARAMETERIZED`:

```json
{
  "env": {
    "IMPECCABLE_CONTEXT_DIR": "docs"
  },
  "permissions": {
    "deny": [ ... 8 entries, unchanged in both ... ],
    "ask":  [ ... 9 entries, unchanged in both ... ]
  },
  "hooks": {
    "PreToolUse": [ ... unchanged in both ... ]
  },
  "enabledPlugins": { {{PLUGIN_ROSTER}} },
  "extraKnownMarketplaces": { {{MARKETPLACES}} }
}
```

**Parameters:**

| Parameter           | Canonical value                                                                                                        | Note                                                                                                                                                                                                                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{PLUGIN_ROSTER}}` | `frontend-design@claude-plugins-official`, `impeccable@impeccable`, `superpowers@claude-plugins-official` — all `true` | **`caveman@caveman` is dropped from RedyQuote's committed roster.** It is a personal output-style plugin, not a project tool; it belongs in a user-level settings file, not in a repo every developer clones. This is the one place RedyQuote's committed roster is over-inclusive rather than under-inclusive. |
| `{{MARKETPLACES}}`  | `impeccable` → `github:pbakaus/impeccable`                                                                             | the `caveman` marketplace entry goes with the plugin                                                                                                                                                                                                                                                            |

`.claude/settings.local.json` in CuevikSync becomes empty (`{}`) or is deleted. It stays
gitignored in both under C-13 — that is the correct home for per-developer overrides, and
nothing shared should be in it.

**Blast radius:** CuevikSync developers get three plugins auto-installed on trusting the
workspace. Anyone relying on `caveman` in RedyQuote must enable it in their user settings
instead — the plugin still works, it is just no longer imposed on the repo.
**Verification:** `git ls-files .claude/` returns `settings.json`, `launch.json`, `commands/*`, `hooks/*` in both — and not `settings.local.json`. `diff <(jq -S 'del(.enabledPlugins,.extraKnownMarketplaces)' CuevikSync/.claude/settings.json) <(jq -S 'del(.enabledPlugins,.extraKnownMarketplaces)' RedyQuote/.claude/settings.json)` is empty.
**Depends on:** C-13
**Effort:** S

---

# C-44 — Agent config — Unify `.claude/commands/db-migrate.md`

**Canonical form:** NEITHER (new form defined below)
**Decided by:** rule 3 for structure; G-3 for the workflow content
**Rationale:** The frontmatter is already identical (row 16.45). The divergences are one missing
section, two heading variants, and a workflow difference that G-3 already settled. 146 changed
lines for a file whose purpose and step count match exactly.
**Target repo:** BOTH
**Files to change:** `.claude/commands/db-migrate.md` in both

**Change detail** — canonical structure:

```
---
description: Push pending Supabase migrations to the linked project, regenerate types, and verify
allowed-tools: Bash, Read, Glob, Grep
---
                                          ← blank line after frontmatter (row 16.46)
# DB Migrate

<intro — parameterized on the environment paragraph>

---

## 1. Pre-flight — stop and report if any check fails
## 2. Confirm before writing
## 3. Dry run
## 4. Push, then regenerate types
## 5. Verify the invariants the SQL cannot prove
## 6. Report — do not commit or push
## Never
```

Six decisions folded in:

| Row       | Resolution                                                                                                                   |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 16.46     | blank line after frontmatter — RedyQuote's form (Prettier's output)                                                          |
| 16.47     | `## 5. Verify the invariants the SQL cannot prove` — RedyQuote's; it says what the step is for                               |
| 16.48     | `## 6. Report — do not commit or push` — CuevikSync's; the constraint belongs in the heading where it cannot be skimmed past |
| 16.49     | `## Never` section — RedyQuote's; add to CuevikSync                                                                          |
| 5.6 / G-3 | the apply-ordering paragraph becomes merge-then-push in both                                                                 |
| 5.11      | the push step runs `npm run db:push`, which C-05 defines as `npx supabase db push --linked` in both                          |

`## Never` canonical body, `IDENTICAL_CONTENT`:

```markdown
## Never

- Never run `db push` without the user having seen the SQL. The `permissions.ask` prompt is a
  speed bump, not a review — it does not show anyone the migration.
- Never edit a migration that is present in `main`. It is applied and immutable; author a new
  file with the next sequential number. A `PreToolUse` hook enforces this, and a hook that
  fires is not a problem to work around.
- Never run `supabase db reset` or `supabase start`. Development targets a hosted project;
  `permissions.deny` blocks both spellings.
- Never commit or push as part of this command. It applies a migration; landing the change is
  a separate, human action.
```

**Parameters:**

| Parameter                   | CuevikSync                                                                | RedyQuote                                                                  |
| --------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `{{PRODUCT_NAME}}`          | `CuevikSync`                                                              | `RedyQuote`                                                                |
| `{{ENVIRONMENT_PARAGRAPH}}` | linked hosted dev project; local stack exists for tests only              | linked hosted project; no local stack, no Docker (docs/ENVIRONMENTS.md §1) |
| `{{RLS_VERIFY_STEP}}`       | verify RLS enabled **and** `tenant_id` scoping present on every new table | verify RLS enabled on every new table                                      |

**Blast radius:** Changes the behaviour of a command that writes to a real database in both
repos. Test with `/db-migrate dry-run` before a real push.
**Verification:** `/db-migrate dry-run` in both completes through step 3 and stops; `grep -n '^## ' .claude/commands/db-migrate.md` returns the same 7 headings in both.
**Depends on:** C-03, C-05, C-35
**Effort:** M

---

# C-45 — Agent config — Unify `.claude/commands/doc-audit.md`

**Canonical form:** RedyQuote for structure; NEITHER for two headings
**Decided by:** rule 2 — RedyQuote's file has an h1 title and uses h2 for PASS headings, which is
the conventional markdown hierarchy; CuevikSync's promotes PASS headings to h1 with no document
title above them (rows 16.50, 16.51)
**Rationale:** 542 changed lines, and almost all of it is cosmetic: `vs` vs `vs.`, three heading
rewordings, one heading level, one missing title. The two substantive divergences are §1 (the
corpus list) and §2 (the authority ladder), which are legitimately per-repo.
**Target repo:** BOTH
**Files to change:** `.claude/commands/doc-audit.md` in both

**Change detail** — canonical heading set:

| Row   | Canonical                                                                       | Source                                                                                                                      |
| ----- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 16.50 | `# Doc Audit` h1 after frontmatter                                              | RedyQuote                                                                                                                   |
| 16.51 | `## PASS A — Align` / `## PASS B — Drift` / `## PASS C — Absorb` (h2)           | RedyQuote                                                                                                                   |
| 16.52 | `## 3A. Terminology — {{CANON_SOURCE}} is canon`                                | parameterized                                                                                                               |
| 16.53 | `## 3B. Requirements, metrics, and acceptance criteria`                         | CuevikSync — "requirements" is the thing most likely to drift and belongs in the heading                                    |
| 16.54 | `## 3D. Goals vs. scope vs. mechanism`                                          | NEITHER — RedyQuote's `vs.` punctuation, CuevikSync's "mechanism" (more precise than "implementation", which reads as code) |
| 16.55 | `## 4A. Doc vs. doc` / `## 4B. Doc vs. reality _(skipped under \`docs-only\`)_` | RedyQuote — the annotation documents a real flag                                                                            |

**Parameters:**

| Parameter                   | CuevikSync                                                     | RedyQuote                                    |
| --------------------------- | -------------------------------------------------------------- | -------------------------------------------- |
| `{{CANON_SOURCE}}`          | `PRODUCT.md`                                                   | `PRODUCT.md` — **changed from "the schema"** |
| `{{CORPUS_LIST}}` (§1)      | CuevikSync's doc set, updated for every file this spec creates | RedyQuote's doc set, likewise                |
| `{{AUTHORITY_LADDER}}` (§2) | CuevikSync's ladder from `CLAUDE.md:18-27`                     | same ladder, RedyQuote's paths               |

**One substantive change, not cosmetic:** RedyQuote's §3A names "the schema" as terminology
canon; CuevikSync names `PRODUCT.md`. Canonical is `PRODUCT.md` in both — it is the top of the
`Derived from:` lineage in both repos (`docs/PRODUCT.md:8` in each: "Derived from: (none —
starting point)"), and a schema is downstream of the product concept, not upstream of it. This
changes what RedyQuote's Pass A compares against.

**Both `{{CORPUS_LIST}}` values must be regenerated after this spec lands** — the corpus grows
by `ENGINEERING-RULES.md` + `BACKLOG.md` in RedyQuote and by `PROJECT-STRUCTURE.md` +
`DESIGN-SYSTEM.md` + `ENVIRONMENTS.md` + `DATABASE.md` in CuevikSync.

**Blast radius:** Changes what `/doc-audit` reads and what it treats as canon. Run it in
`docs-only` mode first in both repos and compare the finding counts against the pre-change run.
**Verification:** `grep -n '^#\{1,2\} ' .claude/commands/doc-audit.md` returns the same heading list in both; `/doc-audit docs-only` completes in both.
**Depends on:** C-30, C-32, C-33, C-34, C-35, C-36, C-37
**Effort:** M

---

# C-46 — Developer commands — `.claude/launch.json` in CuevikSync

**Canonical form:** RedyQuote
**Decided by:** no contest (row 15.13)
**Target repo:** CuevikSync
**Files to change:** `.claude/launch.json` (create)

**Change detail** — full body, `IDENTICAL_TEMPLATE_PARAMETERIZED`:

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "{{PROJECT_SLUG}}-dev",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": {{DEV_PORT}}
    }
  ]
}
```

**Parameters:**

| Parameter          | CuevikSync   | RedyQuote   |
| ------------------ | ------------ | ----------- |
| `{{PROJECT_SLUG}}` | `cueviksync` | `redyquote` |
| `{{DEV_PORT}}`     | `3001`       | `3000`      |

Different ports so both dev servers can run simultaneously. CuevikSync's `package.json` `dev`
script becomes `next dev --port 3001` — the one place C-05's scripts block is parameterized.

**Blast radius:** None.
**Verification:** the preview starts and serves on the configured port in both.
**Depends on:** C-05
**Effort:** S

---

# C-47 — Dependency drift — Align CuevikSync's approved version lines

**Canonical form:** RedyQuote's installed versions
**Decided by:** rule 1 — an installed, lockfile-pinned version beats a documented one
**Rationale:** Three majors diverge (rows 19.1–19.3). CuevikSync has no lockfile, so its
documented lines are the only statement it makes; aligning them to what C-05 installs removes
the divergence at the source.
**Target repo:** CuevikSync
**Files to change:** `docs/TECH-STACK.md:60` (Zod), `:71` (Vitest), `:74` (lint-staged), `:168-172` (§7 constraints bullet)

**Change detail:**

| Package     | From           | To     | Note                                                                                                                                                     |
| ----------- | -------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zod         | `3.x` — `:60`  | `4.x`  | matches `package.json:42` `^4.4.3`. Zod 4 changed top-level API (`z.url()` rather than `z.string().url()`) — C-18's `config.ts` already uses the v4 form |
| Vitest      | `3.x` — `:71`  | `4.x`  | matches `^4.1.10`                                                                                                                                        |
| lint-staged | `16.x` — `:74` | `17.x` | matches `^17.2.0`                                                                                                                                        |

`docs/TECH-STACK.md:168-172` constraints bullet — update the version numerals in the same edit.

**Blast radius:** Doc-only. RedyQuote's own stale claims for Vitest and lint-staged are fixed by
C-48, not here.
**Verification:** every version in `docs/TECH-STACK.md` §4 matches the corresponding `package.json` range in both repos.
**Depends on:** C-05
**Effort:** S

---

# C-48 — Documentation — Correct RedyQuote's four stale claims

**Canonical form:** RedyQuote (corrected)
**Decided by:** no contest — these are factual errors, not conventions
**Rationale:** Rows 11.10, 11.11, 19.2, 19.3. Three of the four are repeated across multiple
files, so a partial fix leaves a contradiction. All four are cheap and all four currently produce
wrong instructions to an agent reading `CLAUDE.md`.
**Target repo:** RedyQuote
**Files to change:** `CLAUDE.md:79`, `:169-171`; `README.md:86-89`, `:117`; `.github/workflows/ci.yml:22-24` (removed by C-26); `docs/TECH-STACK.md:53`, `:58`

**Change detail:**

| #   | Claim                                                                                                                            | Reality                                                                                                                                          | Fix                                                                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | "`vitest.config.ts` sets `passWithNoTests` and there are no test files" — `CLAUDE.md:169-171`, `README.md:86-89`, `ci.yml:22-24` | `vitest.config.ts` (10 lines, read in full) has no such key; `src/lib/list/apply-list-view.test.ts` and `src/lib/list/list-params.test.ts` exist | Replace with: "`npm run test` runs two unit suites over `src/lib/list/`. Vitest has no `passWithNoTests` flag set, so an empty suite would fail — a green run means the tests ran." |
| 2   | "15 primitives in `src/components/ui/`" — `CLAUDE.md:79`, `README.md:117`                                                        | `ls` returns **18**                                                                                                                              | `18`. Better: drop the count. A number in prose is a thing that rots; `ls src/components/ui \| wc -l` does not.                                                                     |
| 3   | Vitest `3.x` — `docs/TECH-STACK.md:53`                                                                                           | `^4.1.10` — `package.json:59`                                                                                                                    | `4.x`                                                                                                                                                                               |
| 4   | lint-staged `16.x` — `docs/TECH-STACK.md:58`                                                                                     | `^17.2.0` — `package.json:54`                                                                                                                    | `17.x`                                                                                                                                                                              |

**Worth naming the pattern, since `CLAUDE.md:73-74` already anticipates it:** that file says
"Confirm a file or script still exists before relying on this section — it is a snapshot, and a
stale one is worse than none." All four claims are exactly what that warning describes, and the
`Last verified: 2026-08-08` stamp at `:73` did not prevent them. The stamp records when someone
last looked; it cannot record what they missed. `/doc-audit drift` (Pass B, "Doc vs. reality") is
the mechanism that catches these — it exists and these survived it, which is itself worth a look
when C-45 lands.

**Blast radius:** None — corrections only.
**Verification:** `grep -rn 'passWithNoTests\|15 primitives' . --include=*.md --include=*.yml` returns nothing; the version numerals in `docs/TECH-STACK.md` §4 match `package.json`.
**Depends on:** C-26
**Effort:** S

---

# Execution order

Six batches. A batch is landable when every C-id in it can be applied and verified without any
C-id outside it. Batches are strictly sequential; within a batch, order is free unless a
`Depends on` says otherwise.

### Batch 1 — Decisions (doc-only; no build exists to break)

`C-01` → `C-02` → `C-03`
Also: `C-13`, `C-35` (both independent of everything)
**Verifiable by:** reading. No commands exist in CuevikSync yet.
**Why first:** C-01 fixes the source root every later path assumes; C-02 and C-03 settle two
gate decisions; C-35 must precede C-31 so `CONTRIBUTING.md` is converged once, not twice.

### Batch 2 — CuevikSync becomes an npm project

`C-04` → `C-05` → `C-06`, `C-07`, `C-08`, `C-11`, `C-14`, `C-46`
**Verifiable by:** `npm install && npm run typecheck && npm run format:check` in CuevikSync.
**Note:** `C-09` (ESLint) and `C-10` (Husky) are deliberately **not** here — the ESLint config's
two custom rules need `src/` to exist, and running Husky before lint works blocks commits.

### Batch 3 — Source

`C-15` → `C-16`, `C-17`, `C-18` → `C-24` → `C-22` → `C-21`, `C-23` → `C-25` → `C-19` → `C-20`
→ then `C-12`, `C-09`, `C-10`
**Verifiable by:** `npm run lint && npm run typecheck && npm run build && npm run dev` in
CuevikSync; the shell renders and `/login` renders outside it.
**Ordering note:** C-25 (migrations) precedes C-19 because `src/lib/supabase/types.ts` is
generated by `npm run db:types` against the applied schema. C-09 lands last in the batch so its
first run is against complete source.

### Batch 4 — CI and the test-harness decision

`C-27` → `C-26`
**Verifiable by:** push a branch in each repo; the `check` job runs 5 steps.
**Blocking sub-decision, must be taken before this batch lands:** C-26 makes `npm run test` a
blocking step in a CuevikSync repo with zero test files, and Vitest fails an empty suite. Pick
(a) accept red CI, (b) add `passWithNoTests: true` to **both** `vitest.config.ts` files with a
dated comment, or (c) drop the `test` step from both workflows. (b) is recommended — it keeps
the two workflows byte-identical, which is the point of C-26.

### Batch 5 — Agent config

`C-43` → `C-44`, `C-46` (if not landed in Batch 2)
**Verifiable by:** `/db-migrate dry-run` in both; `git ls-files .claude/` matches in both.
**Note:** `C-45` is **not** here — its corpus list depends on every doc created in Batch 6.

### Batch 6 — Documentation

`C-28` → `C-32`, `C-33`, `C-34`, `C-36`, `C-37`, `C-42` → `C-38`, `C-39`, `C-40` → `C-41`
→ `C-31` → `C-47`, `C-48` → `C-29` → `C-30` → `C-45`
**Verifiable by:** `npm run format:check` in both; `grep -n '^## '` on each converged document
returns the same headings in the same order across repos; `/doc-audit` completes in both.
**Ordering note:** C-29 (README) and C-30 (CLAUDE.md) are last but one because both index the
full document set. C-45 is last because it encodes that set into the audit command.

### Cross-batch dependency graph (the non-obvious edges)

```
C-01 ──┬─→ C-06 ──→ C-19          C-35 ──→ C-31 ──→ C-29
       └─→ C-33                   C-13 ──→ C-14, C-41, C-43
C-02 ──┬─→ C-32 ──→ C-30 ──→ C-45
       └─→ C-38                   C-15 ──→ C-09, C-12, C-24, C-34
C-03 ──→ C-44                     C-24 ──→ C-22 ──→ C-21
C-05 ──→ everything in Batches 2-4 C-25 ──→ C-19 ──→ C-20
C-27 ──→ C-26 ──→ C-48
```

---

# Canonical template registry

### Copy verbatim (canonical file already exists)

| Canonical                                              | Target     | Notes                                        |
| ------------------------------------------------------ | ---------- | -------------------------------------------- |
| `RedyQuote:eslint.config.mjs`                          | CuevikSync | one comment word: `RedyRef` → `Cuevik`       |
| `RedyQuote:src/lib/supabase/update-session.ts`         | CuevikSync | no changes                                   |
| `RedyQuote:src/lib/supabase/server.ts`                 | CuevikSync | one parameterized comment block, C-19        |
| `RedyQuote:src/lib/utils.ts`                           | CuevikSync | comment block replaced in **both**, C-17     |
| `RedyQuote:src/app/global-error.tsx`                   | CuevikSync | `{{PRODUCT_NAME}}` at `:42`                  |
| `RedyQuote:src/components/ui/*.tsx` × 18               | CuevikSync | no changes                                   |
| `RedyQuote:src/app/(app)/_components/AppChrome.tsx`    | CuevikSync | no changes                                   |
| `RedyQuote:src/app/(app)/not-found.tsx`                | CuevikSync | no changes                                   |
| `RedyQuote:src/components/layout/*.tsx` × 5            | CuevikSync | nav list + product name substituted          |
| `RedyQuote:src/app/(auth)/login/page.tsx`              | CuevikSync | `{{PRODUCT_NAME}}`                           |
| `RedyQuote:src/app/globals.css`                        | CuevikSync | 510 lines + substitution table, C-15         |
| `RedyQuote:docs/DESIGN-SYSTEM.md`                      | CuevikSync | 459 lines + substitution table, C-34         |
| `RedyQuote:docs/PROJECT-STRUCTURE.md`                  | CuevikSync | shape + §5 verbatim, C-33                    |
| `RedyQuote:docs/ENVIRONMENTS.md`                       | CuevikSync | shape; §1 content diverges, C-35             |
| `RedyQuote:README.md:95-215`                           | CuevikSync | Claude Code Setup + Doc Audit sections, C-29 |
| `CuevikSync:.claude/hooks/block-applied-migration.mjs` | RedyQuote  | one comment word, C-03                       |
| `CuevikSync:CONTRIBUTING.md`                           | RedyQuote  | + the authored checklist, C-31               |
| `CuevikSync:docs/ENGINEERING-RULES.md`                 | RedyQuote  | shape; rule content per-repo, C-32           |
| `CuevikSync:CLAUDE.md` §§ 4, 8, 9, 10, 11, 12, 15      | RedyQuote  | C-30                                         |

### Full bodies given in this spec

`.nvmrc` (C-04) · `.npmrc` (C-04) · `package.json` (C-05) · `tsconfig.json` (C-06) ·
`next.config.ts` (C-07) · `postcss.config.mjs` (C-07) · `.prettierrc` (C-08) ·
`.prettierignore` (C-08) · `.husky/pre-commit` (C-10) · `vitest.config.ts` (C-11) ·
`components.json` (C-12) · `.gitignore` (C-13) · `.env.example` (C-14) · `src/lib/fonts.ts` (C-16) ·
`src/lib/config.ts` (C-18) · `src/lib/config.server.ts` (C-19) ·
`src/lib/supabase/client.ts` (C-19) · `src/lib/supabase/service-role.ts` (C-19) ·
`src/proxy.ts` (C-20) · `src/app/layout.tsx` (C-21) · `src/app/page.tsx` (C-21) ·
`src/app/(app)/layout.tsx` (C-22) · `.github/workflows/ci.yml` (C-26) ·
`CONTRIBUTING.md` § Self-review checklist (C-31) · `docs/DATABASE.md` (C-36) ·
`docs/BACKLOG.md` (C-37) · `docs/ARCHITECTURE.md` §9 for RedyQuote (C-39) ·
`docs/brainstorming/README.md` (C-42) · `.claude/settings.json` (C-43) ·
`.claude/commands/db-migrate.md` § Never (C-44) · `.claude/launch.json` (C-46) ·
`docs/DESIGN-SYSTEM.md` §1 for CuevikSync (C-34)

### Master parameter table

| Parameter                                   | CuevikSync                                                          | RedyQuote                                              | Used by                                  |
| ------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------- |
| `{{PRODUCT_NAME}}`                          | `CuevikSync`                                                        | `RedyQuote`                                            | C-14, C-21, C-22, C-23, C-30, C-31, C-44 |
| `{{PROJECT_SLUG}}`                          | `cueviksync`                                                        | `redyquote`                                            | C-05, C-46                               |
| `{{PRODUCT_TAGLINE}}`                       | `Capture every inbound inquiry and turn it into revenue.`           | `Quoting and approval for REDYREF interactive kiosks.` | C-21                                     |
| `{{LANDING_ROUTE}}` / `{{LANDING_SEGMENT}}` | `/inquiries` / `inquiries`                                          | `/quotes` / `quotes`                                   | C-21, C-22                               |
| `{{NAV_ITEMS}}`                             | Inquiries · Contacts · Pipeline · Quotes · Settings                 | Quotes · Products · Library · Settings                 | C-22                                     |
| `{{DEV_PORT}}`                              | `3001`                                                              | `3000`                                                 | C-05, C-46                               |
| `{{BRAND_PRIMARY}}`                         | `#0F6E6E` _(provisional)_                                           | `#A81D22`                                              | C-15, C-34                               |
| `{{BRAND_INK}}`                             | `#1A1A1A`                                                           | `#1A1A1A`                                              | C-15, C-34                               |
| `{{BRAND_ACCENT}}`                          | `#B45309` _(provisional)_                                           | `#1E5FBF`                                              | C-15, C-34                               |
| `{{SERVICE_ROLE_NOTE}}`                     | present — three system paths                                        | absent — none used                                     | C-14                                     |
| `{{SERVER_ONLY_KEYS}}`                      | `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `INTAKE_KEY_SECRET` | _(none)_                                               | C-14, C-18                               |
| `{{ELEVATED_CLIENT_NOTE}}`                  | points at `./service-role`                                          | "deliberately no elevated variant"                     | C-19                                     |
| `supabase project_id`                       | `CuevikSync`                                                        | `RedyQuote`                                            | C-25                                     |
| `{{CANON_SOURCE}}`                          | `PRODUCT.md`                                                        | `PRODUCT.md`                                           | C-45                                     |
| `{{ENVIRONMENT_PARAGRAPH}}`                 | hosted dev + local stack for tests                                  | hosted only, no Docker                                 | C-44                                     |
| `{{RLS_VERIFY_STEP}}`                       | RLS + `tenant_id` scoping                                           | RLS only                                               | C-44                                     |

---

# Unresolved

Every `NOT VERIFIABLE` row, plus the two decisions this spec deliberately does not take.

| #   | Item                                                                                                                                                                                                                                      | Row                 | What is needed to close it                                                                                                                                                                                             |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| U-1 | **Cuevik brand hexes.** `#0F6E6E` / `#B45309` are provisional placeholders I chose to clear the AA floor and avoid REDYREF's red (D-14). They are not a brand decision.                                                                   | 7.10                | A ratified Cuevik palette. Replacing them is a three-value edit in `src/app/globals.css` plus a re-solve of the five derived oklch primitives in `docs/DESIGN-SYSTEM.md` §4.                                           |
| U-2 | **Branch protection on `main`.** CuevikSync calls it "best-effort" (`CONTRIBUTING.md:94-99`); RedyQuote says nothing. No file in either repo records the actual host setting.                                                             | 18.6                | GitHub → Settings → Branches for both repos, or `gh api repos/{owner}/{repo}/branches/main/protection`. Requires network and repo-admin scope, neither available to a filesystem audit.                                |
| U-3 | **Tag / version / release scheme.** Neither repo states one. RedyQuote's `package.json:3` says `0.1.0` with no policy attached; CuevikSync has no manifest. No `CHANGELOG.md`, no release workflow, no tags inspected.                    | 18.10, 18.11, 18.12 | A decision, not a file read: does either repo ship versioned releases, or is `main` the only artifact? If the latter, say so once in the canonical `CONTRIBUTING.md` and the question closes.                          |
| U-4 | **ID strategy** (UUID vs bigint vs ULID) for primary keys. Not stated in any file read across Phases 1–3.                                                                                                                                 | 4.2                 | `RedyQuote:docs/DATABASE.md` §4 "Table Definitions" (`:234-510`) was not read — it would settle RedyQuote's half. CuevikSync's half does not exist yet and is a design decision for C-25's migrations.                 |
| U-5 | **Empty-suite CI behaviour.** C-26 makes `npm run test` blocking in a CuevikSync repo with zero tests, and Vitest fails an empty suite.                                                                                                   | 11.2, 13.7          | A choice between the three options named in Batch 4. Recommended: `passWithNoTests: true` in **both** `vitest.config.ts` files with a dated comment naming the removal trigger. Must be decided before Batch 4 lands.  |
| U-6 | **Whether CuevikSync has a linked Supabase project.** C-25 needs a `project_id` and a linked project to run `db:push` and `db:types` against. No file records whether one exists.                                                         | 5.13                | `npx supabase projects list`, or confirmation that a project should be created. Blocks Batch 3's tail (C-25 → C-19 → C-20).                                                                                            |
| U-7 | **`docs/DATABASE-SQL.md`'s fate.** It is transient by its own header (`:9-13`) — "delete it once its content is authored as `supabase/migrations/*.sql`". Migrations `0001`–`0005` are applied; the file says it is "partly transcribed". | 16.23               | Read its "Transcription status" section and delete the transcribed blocks. Out of this spec's scope — it is RedyQuote-internal hygiene, not convergence — but it will make C-45's corpus list wrong if left ambiguous. |

---

# Addendum A — U-5 and U-6 resolved, and the Batch 3 replan they force

Answers received 2026-08-11, after the spec above was written. This addendum amends it; where
the two disagree, the addendum wins.

## A-1 — U-5 resolved: CuevikSync's CI starts red

**Decision:** accept a red `check` job in CuevikSync until the first test lands. Do **not** add
`passWithNoTests` to either `vitest.config.ts`, and do not drop the `test` step from either
workflow.

**Effect on the spec:** C-11 and C-26 are unchanged — `vitest.config.ts` stays byte-identical
across repos, `.github/workflows/ci.yml` stays byte-identical across repos, and the five-step
sequence is preserved. Worth noting that this is the option requiring no edit to either canonical
file: the convergence goal is unaffected either way, only the signal quality is.

**Recorded cost, so it is not rediscovered later:** the job is red for a permanent, known reason
under D-6 (no tests planned). A permanently-red check stops being read, and the day it goes red
for a real reason it looks identical. Add one line to CuevikSync's `README.md` § Everyday Checks
so the state is documented rather than folklore:

```markdown
> **CI is red on `main` and will stay red** until the first Vitest suite lands. `npm run test`
> fails an empty suite by design — Vitest has no `passWithNoTests` flag set here, and adding one
> would make a green run mean nothing. Treat the other four steps as the real gate for now.
```

## A-2 — U-6 resolved: CuevikSync has no linked Supabase project

**Decision:** no project exists and none is being created as part of this work.

This blocks more of Batch 3 than the spec accounted for. Two consequences the original ordering
did not surface:

### Consequence 1 — `src/lib/supabase/types.ts` cannot be generated

C-19 depends on C-25 because `types.ts` is produced by `npm run db:types` against an applied
schema. With no project that command cannot run, and the three Supabase client factories will not
compile without a `Database` type. **Fix: C-49 below** — a hand-authored placeholder.

### Consequence 2 — `src/lib/config.ts` throws at startup with no credentials

Not in the spec at all, and it would have surfaced as a failed `npm run build` in the middle of
Batch 3. `src/lib/config.ts` (C-18) validates `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` at module load and throws if either is missing — that is its
design (`:26-32`, "Fail at startup rather than surfacing as an opaque Supabase error"). Every
Batch 3 verification step runs `npm run build`.

**Fix: no code change.** The Zod schema checks shape, not reachability — `z.url()` and
`z.string().min(1)`. A syntactically valid placeholder satisfies it:

```
# .env.local — CuevikSync, until a real Supabase project exists.
# Shape-valid placeholders, not credentials. Nothing in the bare-minimum
# scaffold makes a network call, so no request is attempted.
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key
SUPABASE_SERVICE_ROLE_KEY=placeholder-service-role-key
SUPABASE_DB_URL=postgresql://placeholder:6543/postgres
INTAKE_KEY_SECRET=placeholder-intake-secret
```

`.env.local` is gitignored under C-13, so nothing is committed. The scaffold builds, `npm run dev`
serves, and the shell renders — because nothing in it queries a database. The first thing that
_would_ query one is also the first thing that needs a real project.

**Uncertainty stated rather than assumed away:** I have not executed a build to confirm whether
`next build` evaluates `config.ts`'s module-level throw during middleware compilation or route
prerendering. The placeholder makes the question moot, which is why it is the recommended fix
rather than a conditional one.

### C-25 splits

| New id    | Was                                                                                   | Needs a linked project?  | Batch             |
| --------- | ------------------------------------------------------------------------------------- | ------------------------ | ----------------- |
| **C-25a** | `supabase/config.toml` + `supabase/.gitignore` via `npx supabase init`                | **No** — `init` is local | 3                 |
| **C-25b** | migrations `0001`/`0002` authored, applied via `/db-migrate`, then `npm run db:types` | **Yes**                  | **3b — deferred** |

`npx supabase init` writes `config.toml` locally with no network call. Set `project_id` to
`CuevikSync` per the C-25 parameter table; the value is a local label until a project is linked.

---

# C-49 — Persistence — Placeholder `src/lib/supabase/types.ts` in CuevikSync

**Canonical form:** NEITHER (new form defined below)
**Decided by:** no contest — the file does not exist in CuevikSync and cannot be generated (A-2).
RedyQuote's is generated against a live schema and has no transferable content.
**Rationale:** The three client factories in C-19 import `type { Database } from "./types"`.
Without the file they do not compile and Batch 3 cannot be verified. A stub unblocks the batch
without inventing a schema.
**Target repo:** CuevikSync
**Files to change:** `src/lib/supabase/types.ts` (create)

**Change detail** — full body, ready to write:

```ts
/**
 * PLACEHOLDER — hand-authored, not generated.
 *
 * `npm run db:types` overwrites this file wholesale from the live schema. Until
 * CuevikSync has a linked Supabase project there is no schema to generate from,
 * and the client factories in this directory need a `Database` type to compile.
 *
 * Every table is typed as empty on purpose. A plausible-but-wrong schema here
 * would be worse than none: it would typecheck queries against tables that do
 * not exist, and the error would surface at runtime against a real database
 * instead of at build time.
 *
 * Delete this comment on the first real generation. If you are reading it and
 * migrations have been applied, the generation step was skipped — run
 * `npm run db:types`.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
```

**Blast radius:** Any `supabase.from("…")` call typechecks against an empty table set and will
error — correct, since no table exists. Nothing in the D-11 scaffold makes such a call.
**Verification:** `npm run typecheck && npm run lint && npm run build`
**Depends on:** C-05, C-06
**Effort:** S

---

# Revised execution order

Batches 1, 2, 5, and 6 are unchanged. Batch 3 is re-sequenced; Batch 3b is new.

### Batch 3 (revised) — Source, minus anything needing a database

```
C-15  globals.css + tokens
  ├─→ C-16  fonts.ts
  ├─→ C-17  utils.ts
  ├─→ C-18  config.ts
  └─→ C-24  ui/ × 18
        └─→ C-22  (app) shell + layout components
              ├─→ C-21  root layout / page / global-error
              └─→ C-23  (auth)/login
C-25a  supabase/config.toml via `npx supabase init`
C-49   types.ts placeholder            ← NEW; replaces the old C-25 → C-19 edge
  └─→ C-19  supabase client layer (incl. the service-role split)
        └─→ C-20  proxy.ts
Then: C-12  components.json
      C-09  eslint.config.mjs
      C-10  husky pre-commit
```

**Prerequisite before the batch starts:** write CuevikSync's `.env.local` with the A-2
placeholder values. Not a C-id — machine-local, gitignored, never committed.

**Verifiable by:** `npm install && npm run lint && npm run typecheck && npm run build && npm run dev`
in CuevikSync. The shell renders at `http://localhost:3001`, the sidebar highlights `/inquiries`,
`/login` renders outside the shell, and an unknown `(app)` path hits the not-found boundary. No
network call is made.

### Batch 3b — Database (deferred, gated on a linked Supabase project)

`C-25b` — author migrations `0001`/`0002` with `tenant_id` and tenant-scoped RLS, apply via
`/db-migrate`, then `npm run db:types` to replace C-49's placeholder.

**Gate:** a CuevikSync Supabase project exists and `npx supabase link` has been run.
**Verifiable by:** `/db-migrate dry-run` completes; after the real push, `npm run db:types`
regenerates `types.ts` and the C-49 placeholder header is gone.

**Batch 3b is not on the critical path.** Batches 4, 5, and 6 depend on nothing in it. The
convergence work completes without it; only the database half of CuevikSync's scaffold waits.

---

# Unresolved — revised

| #   | Item                                                                                 | Status                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| U-1 | Cuevik brand hexes — `#0F6E6E` / `#B45309` provisional                               | **open** — needs a ratified palette. Three-value edit plus a re-solve of the five derived oklch primitives                                         |
| U-2 | Branch protection on `main`, both repos                                              | **open** — host-side. `gh api repos/{owner}/{repo}/branches/main/protection`                                                                       |
| U-3 | Tag / version / release scheme                                                       | **open** — a decision, not a file read. If `main` is the only artifact, say so once in `CONTRIBUTING.md` and it closes                             |
| U-4 | ID strategy for primary keys                                                         | **CLOSED** — Addendum B. `uuid` + `gen_random_uuid()`, canonical in both                                                                           |
| U-5 | Empty-suite CI behaviour                                                             | **CLOSED** — A-1. CI starts red; no config change to either repo                                                                                   |
| U-6 | CuevikSync linked Supabase project                                                   | **CLOSED as "none"** — A-2. C-25 split, C-49 added, Batch 3b deferred                                                                              |
| U-7 | `RedyQuote:docs/DATABASE-SQL.md`'s fate                                              | **CLOSED** — Addendum B. Not deletable yet; stays in the corpus                                                                                    |
| U-8 | **New.** CuevikSync's uncommitted `docs/PRODUCT.md` header rewrap, sitting on `main` | **open** — not produced by this audit. `CONTRIBUTING.md:18` says never work directly on `main`; commit it on a branch or discard it before Batch 1 |

---

# Addendum B — U-4 and U-7 closed

Two source re-reads, declared: `RedyQuote:docs/DATABASE.md:234-252` and
`RedyQuote:docs/DATABASE-SQL.md:19-68`. Neither had been read in Phases 1–3.

## B-1 — U-4 closed: `uuid` primary keys via `gen_random_uuid()`

**Evidence** — `RedyQuote:docs/DATABASE.md:238-240`, verbatim:

> `uuid` primary keys via `gen_random_uuid()` (`pgcrypto`), except `settings` (boolean
> singleton PK) and `quote_number_sequences` (natural `year` PK — an internal counter, not
> a public entity).

**Canonical form:** RedyQuote
**Decided by:** rule 2 — `gen_random_uuid()` is the Supabase/Postgres default and needs no
extension beyond `pgcrypto`, which Supabase enables. Rule 3 supporting: a `uuid` PK is what a
developer opening a Supabase schema expects.
**Applies to:** both repos, for every new table.

The exception pattern also converges: a natural or singleton PK is permitted where the table is
not a public entity, and the reason is recorded in the column table. CuevikSync's `settings`
equivalent and any internal counter follow the same rule.

### What else came with it — four conventions that converge for free

`docs/DATABASE.md:236-251` is titled "Design conventions applied throughout". All five bullets
are stack-general, not RedyQuote-specific, and none of them existed anywhere in CuevikSync.
They become the canonical §4 preamble in both repos' `docs/DATABASE.md` — which means **C-36's
stub is no longer content-free.** Amend C-36 to carry this block verbatim under §4:

```markdown
Design conventions applied throughout:

- `uuid` primary keys via `gen_random_uuid()` (`pgcrypto`). A natural or singleton PK is
  permitted only where the table is not a public entity; record the reason in its column table.
- `created_at` / `updated_at` (`timestamptz`) on every mutable table; `updated_at` maintained
  by a shared trigger, never by application code.
- **No `deleted_at` soft-delete column anywhere.** Where the product needs a
  soft-delete equivalent, it is a domain-specific `active` boolean — the row stays visible and
  joinable, just not selectable for new work. Every other table either forbids delete outright
  (append-only audit tables) or has no deletion requirement.
- Every FK column is explicitly indexed. Postgres does not do this automatically.
- RLS is enabled on **every** table (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
```

CuevikSync adds one bullet, per D-15:

```markdown
- Every tenant-scoped table carries `tenant_id uuid NOT NULL`, and its RLS policies filter on
  it. A table without `tenant_id` must state in its column table why it is global.
```

**Effect on C-25b:** the migrations it gates now have their column conventions fixed in advance,
so authoring them is schema design only, not convention design.

**Effect on C-36:** effort rises S → M. The stub gains a populated §4 preamble; §§1–3, 5, 6 stay
"not yet authored".

## B-2 — U-7 closed: `DATABASE-SQL.md` stays, and is not yet deletable

**Evidence** — `RedyQuote:docs/DATABASE-SQL.md:26-34`, the transcription table:

| Block                                  | Migration                              | Status                                  |
| -------------------------------------- | -------------------------------------- | --------------------------------------- |
| `0001` extensions/enums                | `0001_extensions_and_types.sql`        | transcribed verbatim                    |
| `0002` profiles + auth                 | `0002_profiles_and_auth.sql`           | transcribed + §4.2 guard + profiles RLS |
| `0003` settings tables                 | `0003_settings.sql`                    | transcribed + CHECKs, RLS, seed row     |
| markup units fix                       | `0004_settings_markup_units.sql`       | transcribed                             |
| settings_history read                  | `0005_settings_history_admin_read.sql` | transcribed                             |
| categories onward                      | —                                      | **not yet authored**                    |
| `0006` onward — products, quotes, RPCs | —                                      | **not yet authored**                    |

**Answer:** the file is doing real work. Two of its seven blocks are untranscribed and they are
the large ones — categories, products, quotes, and every RPC. `:57-58` sets the deletion
condition: "Delete this file only when every block above is transcribed, and remove it from
CLAUDE.md's 'Approved design specs' list in the same change." That condition is not met.

**Effect on C-45:** `{{CORPUS_LIST}}` for RedyQuote **includes** `docs/DATABASE-SQL.md`, marked
transient. No ambiguity remains. Its CuevikSync counterpart does not exist and is not created —
CuevikSync has no DDL to stage.

**Effect on C-41:** it moves. `docs/DATABASE-SQL.md` is a transient design spec by its own
header, so under C-41's convention table it belongs at
`docs/specs/2026-08-01-database-sql.md`. Amend C-41's move table:

| From                             | To                                                |
| -------------------------------- | ------------------------------------------------- |
| `RedyQuote:docs/DATABASE-SQL.md` | `RedyQuote:docs/specs/2026-08-01-database-sql.md` |

Its own §"sits beside DATABASE.md" paragraph (`:60-64`) argues for the current location. That
argument is about _not_ putting it under `docs/superpowers/`, which C-41 agrees with — and
`docs/specs/` is a third option neither the file nor C-41's original text considered. Update the
paragraph to name `docs/specs/` when the file moves.

### Unplanned corroboration for C-41

`docs/DATABASE-SQL.md:60-64` makes C-41's argument independently, and more sharply than C-41 did:

> That folder is tool-owned — the `superpowers` plugin hardcodes the path and would recreate
> it if renamed (PROJECT-STRUCTURE.md §5) — which is a reason to leave _plugin output_ there,
> not a reason to put a hand-authored file there.

C-41 reached the same conclusion from the outside, and cited the inconsistency between
`.superpowers/` being gitignored and `docs/superpowers/plans/` being committed. RedyQuote had
already written the principle down in a file the audit had not read. That raises confidence in
C-41 and lowers its risk: it is not imposing a new convention, it is finishing one the repo
already started and applied unevenly.

---

_Produced by the CuevikSync ↔ RedyQuote convergence audit, 2026-08-11. Working artifacts — the
file inventory, access report, and 190-row divergence matrix this spec derives from — are outside
both repositories at `D:\vrp-repos\_convergence-audit\`. Nothing here has been applied; it is the
plan, not a record of work done._
