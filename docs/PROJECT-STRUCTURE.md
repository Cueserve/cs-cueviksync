# PROJECT-STRUCTURE.md — Directory Layout & File Placement

**Owner:** Viral Parikh
**Last updated:** 2026-08-11
**Source of truth for:** where each kind of file lives and the rules for placing new code — so
features and components land in the right place and don't break the invariants in
docs/ARCHITECTURE.md.

> Derived from: docs/ARCHITECTURE.md, docs/TECH-STACK.md
> Downstream: README.md, CLAUDE.md, docs/ENGINEERING-RULES.md

---

> **Partly built, as of 2026-08-11.** The bare-minimum app exists: the token layer, the 18 `ui/`
> primitives, the app shell, `src/lib/supabase/`, and `src/proxy.ts`. Everything marked `[ ]`
> below does not exist yet. Directory names carry no authority — check the filesystem.
>
> This file's section skeleton matches `RedyQuote:docs/PROJECT-STRUCTURE.md` deliberately, and
> §5 is shared verbatim where the rule is not product-specific. Where the two genuinely differ
> — the mutation surface, tenancy, the capture path — the difference is called out in place
> rather than smoothed over.

## Contents

- [1. Directory Tree](#1-directory-tree)
- [2. The Four Placement Questions](#2-the-four-placement-questions)
- [3. What Lives Where](#3-what-lives-where)
- [4. File Placement Rules](#4-file-placement-rules)
- [5. Naming Conventions](#5-naming-conventions)
- [6. Keeping This File Honest](#6-keeping-this-file-honest)

## 1. Directory Tree

```text
cs-cueviksync/
├─ .claude/                        # settings.json, launch.json, commands/, hooks/
├─ .github/workflows/ci.yml        # the one blocking job
├─ .husky/pre-commit               # npx lint-staged
├─ docs/                           # source-of-truth documents
│  ├─ brainstorming/               # pre-decision exploration, never authoritative
│  ├─ convergence/                 # the CuevikSync <-> RedyQuote convergence spec
│  ├─ reviews/                     # dated advisory reviews
│  └─ specs/                   [ ] # dated transient design specs
├─ src/
│  ├─ app/
│  │  ├─ (app)/                    # authenticated surface
│  │  │  ├─ _components/           # AppChrome
│  │  │  ├─ inquiries/             # placeholder landing route
│  │  │  ├─ layout.tsx             # the authenticated shell
│  │  │  └─ not-found.tsx
│  │  ├─ (auth)/login/             # pre-session surface
│  │  ├─ api/                  [ ] # ONLY external HTTP surfaces (webhooks). Not an app API.
│  │  ├─ globals.css               # the three-tier token layer
│  │  ├─ global-error.tsx          # last-resort boundary; owns its own <html>
│  │  ├─ layout.tsx
│  │  └─ page.tsx                  # redirects to the landing route
│  ├─ components/
│  │  ├─ layout/                   # sidebar, topbar, user-menu, page-header, route-loading
│  │  └─ ui/                       # 18 shadcn primitives — app-agnostic, lint-enforced
│  ├─ lib/
│  │  ├─ supabase/                 # client, server, service-role, update-session, types
│  │  ├─ validation/           [ ] # Zod schemas
│  │  ├─ config.ts                 # validated public env
│  │  ├─ config.server.ts          # validated server-only env (server-only import)
│  │  ├─ fonts.ts
│  │  └─ utils.ts                  # cn() + display formatters
│  ├─ server/actions/          [ ] # Server Actions — the sole authenticated write path
│  └─ proxy.ts                     # Next 16 middleware entry; session refresh only
└─ supabase/
   ├─ config.toml
   └─ migrations/               [ ] # authoritative schema; none authored yet
```

## 2. The Four Placement Questions

Ask them in order. The first `yes` decides.

| #   | Question                          | Answer                                                           |
| --- | --------------------------------- | ---------------------------------------------------------------- |
| 1   | Is it a route or route-local UI?  | `src/app/` (route-private UI → that route's `_components/`)      |
| 2   | Does it render JSX for 2+ routes? | `src/components/` (one route only → that route's `_components/`) |
| 3   | Does it write to the database?    | `src/server/actions/`                                            |
| 4   | Everything else                   | `src/lib/`                                                       |

Consequences worth stating outright:

- **`src/app/` contains only router files** — `page.tsx`, `layout.tsx`, `loading.tsx`,
  `error.tsx`, `route.ts`, and `_components/` folders. No actions, no helpers, no clients.
- **`src/server/` is a hard boundary.** Files there start with `import 'server-only'` so an
  accidental client import fails the build instead of leaking server code to the browser.
- **There is no `features/` directory.** With one shared-UI folder and one shared-logic folder,
  "components or features?" is never a question anyone has to answer.
- **No speculative folders.** A `hooks/` or `config/` directory earns existence when there are
  two real shared hooks or config outgrows `src/lib/config.ts` — not before.

## 3. What Lives Where

| Concern                           | Location                                              | Why                                                                                           |
| --------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Page/route reads                  | `src/app/(app)/**/page.tsx` (Server Components)       | Read path; session-bound Supabase reads so RLS applies (ARCH §5)                              |
| Authenticated writes              | `src/server/actions/*.ts` (Server Actions)            | Sole mutation path — no direct browser→Postgres writes (ENGINEERING-RULES §1)                 |
| External HTTP surfaces            | `src/app/api/**/route.ts`                             | **Only** webhooks and third-party callbacks that cannot be a Server Action. Never an app API  |
| Route-private UI                  | `src/app/**/_components/`                             | Underscore keeps it out of the router; UI used by one route stays next to it                  |
| Input validation                  | `src/lib/validation/` (Zod)                           | Single validation tool of record (TECH-STACK §4)                                              |
| Supabase access, session-bound    | `src/lib/supabase/{client,server}.ts`                 | RLS applies because the caller's JWT reaches Postgres (ARCH §5)                               |
| Supabase access, RLS-bypassing    | `src/lib/supabase/service-role.ts`                    | The three system paths only. `server-only`, separate module, and it re-applies `tenant_id`    |
| Generated DB types                | `src/lib/supabase/types.ts`                           | `npm run db:types`; regenerated after each migration — no ORM (TECH-STACK §4)                 |
| Session refresh                   | `src/proxy.ts` + `src/lib/supabase/update-session.ts` | Next 16 names the middleware entry `proxy.ts`; the reusable logic stays in `lib/`             |
| Schema / RLS / extensions         | `supabase/migrations/*.sql`                           | Authoritative schema; never hand-edited in the dashboard (ARCH §5)                            |
| Intake Receiver, Ingestion Worker | Supabase Edge Functions (Deno)                        | Deployed separately from Vercel so the receiver's uptime is independent of the app (ARCH §1)  |
| Reusable UI                       | `src/components/` (`ui/` for shadcn)                  | Not route-specific                                                                            |
| App chrome                        | `src/components/layout/`                              | Sidebar, Topbar, PageHeader — global shell, and allowed to be app-aware in a way `ui/` is not |
| Domain → UI mappings              | `src/components/*.tsx` (top level)                    | `ui/` must stay app-agnostic — it knows `warning`, never "Triage" (DESIGN-SYSTEM §13)         |

## 4. File Placement Rules

Read these before creating any new feature, route, action, or component.

1. **An authenticated mutation goes in `src/server/actions/`, never in a component and never in
   a route handler.** Server Actions are the sole write path
   ([docs/ENGINEERING-RULES.md](ENGINEERING-RULES.md) §1).
2. **A route handler under `src/app/api/` is for external HTTP only** — an inbound webhook or a
   third-party callback that cannot be a Server Action. It is never an internal API layer for
   our own screens. Note the Intake Receiver is **not** one of these: it is a Supabase Edge
   Function on Deno, deployed separately (TECH-STACK §3).
3. **Every Server Action validates its input with a Zod schema from `src/lib/validation/`.** No
   hand-rolled validation.
4. **Schema, RLS policies, extensions, and history tables are SQL migration files only.** Add a
   new `supabase/migrations/*.sql`; run `npm run db:types` after. Never edit schema or RLS in
   the Supabase dashboard.
5. **Default to a Server Component.** Add `"use client"` only where genuine interactivity needs
   it. A new client component is a decision to justify, not a default.
6. **Data access is session-bound by default.** Import from `src/lib/supabase/client.ts` or
   `server.ts`. `service-role.ts` is reachable only from the three system paths, and every one
   of them MUST re-apply `tenant_id` from a server-resolved value — RLS does not scope it.
7. **Nothing in `src/server/` is imported by a client component.** Keep `import 'server-only'`
   at the top of every file there. Client components may _invoke_ a Server Action (form
   `action=` / `useActionState`) — that is the supported path; a direct value import is not.
8. **Every tenant-scoped table carries `tenant_id`, and its RLS policies filter on it.** A
   forgotten filter must fail closed (zero rows), never leak (NFR-008).
9. **Do not add a datastore, API layer, or analytics tool.** The stack is fixed in
   docs/TECH-STACK.md §5; anything not listed there is out of scope until that file changes.

## 5. Naming Conventions

Shared verbatim with `RedyQuote:docs/PROJECT-STRUCTURE.md` §5 except where noted.

- **Routes** — kebab-case folder segments under `src/app/`; `page.tsx` for the view,
  `layout.tsx` for shared chrome. Route groups `(auth)` / `(app)` separate the pre-session and
  authenticated surfaces without affecting the URL.
- **Route-private UI** — `_components/` inside the route folder. The underscore makes it a
  private folder Next excludes from routing, so route-local UI can never become a URL by
  accident. PascalCase filenames (`InquiryTable.tsx`).
- **Action files** — one file per aggregate in `src/server/actions/` (`inquiries.ts`,
  `opportunities.ts`, …), named after the domain object they mutate.
- **Migrations** — Supabase CLI default `NNNN_snake_case_description.sql`; ordering is by the
  numeric prefix. One logical change per migration.
- **`src/lib/` modules** — no JSX, no React imports; pure TypeScript so they are unit-testable
  and reusable across client and server.
- **Middleware** — the entry file is `src/proxy.ts`, Next 16's name for it. Next 16.2 still
  accepts `middleware.ts`; use `proxy.ts` so the repo has one name for one thing, and keep the
  reusable session logic in `src/lib/supabase/update-session.ts`.
- **Tests** — `*.test.ts` co-located for Vitest units. There is no E2E suite; if one is ever
  adopted, its specs are `*.spec.ts` under `e2e/` so the Vitest include glob never picks them
  up.
- **Docs** — top-level `docs/*.md`, named by content in SCREAMING-KEBAB (`ARCHITECTURE.md`,
  `TECH-STACK.md`). Four kinds of document live under `docs/`, and the folder says which:

  | Kind                     | Path                  | Filename                          | Lifetime                                               |
  | ------------------------ | --------------------- | --------------------------------- | ------------------------------------------------------ |
  | Source-of-truth document | `docs/`               | `SCREAMING-KEBAB.md`              | permanent                                              |
  | Design spec              | `docs/specs/`         | `YYYY-MM-DD-<slug>.md`            | transient — listed in CLAUDE.md, deleted when absorbed |
  | Advisory review          | `docs/reviews/`       | `YYYY-MM-DD-<subject>-review.md`  | permanent                                              |
  | Pre-decision exploration | `docs/brainstorming/` | `<topic>.md`, `**Status:** Draft` | permanent, never authoritative                         |

  **Permanent vs. transient is a property of the file, not its folder.** Every transient file
  declares it in its own header **and** is listed in CLAUDE.md's "Approved design specs" block.
  Don't add one without doing both; don't assume a `docs/*.md` is permanent without checking
  that list. Date-first filenames in `specs/` and `reviews/` so a directory listing sorts
  chronologically, which is how both are read.

## 6. Keeping This File Honest

- If reality matches this file, no change needed.
- If reality must diverge (a rename, a split, a new top-level directory), **update this file in
  the same change** and note why. A stale structure document is worse than none.
- Editing this file is a deliberate decision, like any `docs/` change: call it out, don't fold a
  structural change silently into unrelated feature work.

**RedyQuote's copy of this file went stale once, and it is worth knowing how:** its §1 banner
still described a bare `create-next-app` scaffold after `src/components/`, `src/lib/`,
`src/proxy.ts`, and `supabase/` had all been built. The layout itself was right the whole time —
only the "does not exist yet" claims rotted. That is the failure mode to watch for here: not a
wrong tree, but a correct tree wrapped in stale prose about what has been done. Prefer a dated
marker on a specific line over a blanket disclaimer at the top.
