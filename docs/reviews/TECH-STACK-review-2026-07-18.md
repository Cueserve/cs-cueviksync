# TECH-STACK.md — Architectural Review

**Reviewer:** Solution Architect (advisory)
**Date:** 2026-07-18
**Subject:** `docs/TECH-STACK.md` (Last updated 2026-07-14)
**Context read:** PRODUCT.md, PRD.md, ARCHITECTURE.md, README.md, `.claude/reconciliation/architecture-reconcile.md`
**Purpose:** Validate and strengthen the existing thin-core stack before development begins. Not a redesign.

---

## Verdict

The core stack is sound and well-matched to a thin-core SaaS at this scale. Choices are conservative in the right way — one managed vendor, a modular monolith, relational-first. Trade-offs are documented honestly. **Nothing major is wrong; nothing major needs swapping.**

The real issues are **missing operational and security layers**, not wrong technology picks — plus **one internal contradiction** the doc itself flags but hasn't closed. Ranked below by how much they hurt if unaddressed before development.

---

## 🔴 Blockers — resolve before writing code

### 1. Auth model contradiction is still open, and it's load-bearing

> **✅ RESOLVED 2026-07-18.** Decided **RLS-primary** via `@supabase/ssr` + PostgREST (verified possible on Supabase; the pooler caveat applies only to the direct-Postgres path, not used). TECH-STACK §5 rewritten (RLS is the enforcement locus), §4 `supabase-js` row now names both usages, §6 flipped "RLS is a backstop" → primary control + added `httpOnly`/`Secure`/`SameSite` cookie-flag constraint, §5 reconciliation note stripped, reconcile-log item closed. No contradiction with ARCHITECTURE.md remains. _(Original finding retained below for the record.)_

- **TECH-STACK.md §5** says app-layer authz is the authority and _"RLS on `tenant_id` is defense-in-depth only."_
- **ARCHITECTURE.md §4** says the opposite — _"the enforcement locus is the database, non-bypassable for user traffic."_

These are **two different architectures**, not two phrasings of one:

- **App-layer-primary:** Next.js route handlers use the service-role key, resolve `tenant_id` server-side, every query manually scoped. RLS is a backstop that should never fire.
- **RLS-primary:** Forward the user's JWT to Postgres, RLS decides everything, the app can't leak even with a bug.

They imply **different DB clients, different connection handling, and a different threat model.** You cannot build both. The reconciliation note punts this to `/proj-init-doc-update`, but it's sitting open — and this is the one ambiguity that produces a cross-tenant leak (the exact failure ARCHITECTURE §4 claims to prevent).

**Recommendation: decide RLS-primary.** Matches ARCHITECTURE.md, stronger posture, and for a 2–3 person team a database-enforced guarantee beats app-layer discipline you must get right on every query forever. Then fix §5's "defense-in-depth only" wording. If you genuinely want app-layer-primary, you must justify overriding your own architecture doc — §5 currently doesn't.

**Action:** Close the decision first. Fix §5 + the reconciliation checklist.

### 2. No connection pooler named — Supabase + serverless requires one

> **✅ RESOLVED 2026-07-18 — and severity corrected 🔴→🟠.** This finding was overstated for _this_ stack. Once #1 fixed the data-access path to `supabase-js`/PostgREST, the app's authenticated traffic goes over REST and **bypasses Supavisor entirely** (PostgREST pools internally), so the "connection exhaustion → random 500s" failure does **not** apply to the request path. Supavisor is relevant only to _direct_ Postgres (TCP) connections — the Supabase CLI migration path (#3) and any future raw-SQL client. Resolution: §3 adds a Supavisor row documenting it's off the hot path; §6 adds a connection policy — REST path is pooler-free, the Intake Receiver enqueues to `pgmq` via `supabase-js` RPC (not a direct connection), and any direct-TCP client MUST use transaction mode (port 6543, `prepare:false`). Verified facts: txn mode 6543 / session mode 5432 / session-on-6543 deprecated Feb 2025 / Supavisor is IPv4-only. _(Original finding retained below for the record.)_

Next.js on Vercel is serverless; each invocation can open a Postgres connection and PG 17 caps out fast. Supabase ships **Supavisor** (transaction-mode pooler) for exactly this. If you forward JWTs for RLS, you must also understand transaction-mode's implications for `set local` / session state.

Missing entirely from §3 and §6. Won't show in dev at 10 users; the first load test (NFR-005/006) or traffic spike exhausts connections and fails as random 500s.

**Action:** Name Supavisor in §3; pin transaction vs. session mode in §6.

### 3. Database migrations have no tool

> **✅ RESOLVED 2026-07-18.** Chose **Supabase CLI migrations** (SQL files in `supabase/migrations/`, `supabase db push`) — native, no new dependency, RLS policies in their native SQL; coherent with #1 (PostgREST) and #2 (off Supavisor). Drizzle Kit was rejected because adopting it as the app client would reverse #1 (direct-Postgres path). §4 adds the Supabase CLI + `supabase gen types typescript` (typed access without an ORM); §6 adds the migration rule — all schema/RLS changes go through versioned migrations, hand-editing in the dashboard is prohibited, migration files are the authoritative schema a PITR/DR restore rebuilds against (NFR-010/013). _(Original finding retained below for the record.)_

No migration framework anywhere. You have `pg_cron`, `pgmq`, RLS policies, append-only history tables, JSON custom-field columns — real schema surface — and nothing to version it. "Configuration is data, not code" (ARCHITECTURE §5) covers tenant config, **not the schema itself.**

Options that fit: **Supabase CLI migrations** (SQL files, native, no new vendor — the obvious pick) or **Drizzle Kit** if you also want typed queries.

Without it, RLS policies and schema changes are applied by hand in the dashboard — unrepeatable, unreviewable — and it undermines PITR/DR, because a restored database has no authoritative schema to restore _to_.

**Action:** Pick one (recommend Supabase CLI). Add to §4 + §6.

---

## 🟠 Gaps — decide before or during early development

### 4. No rate limiting on the one public endpoint

> **✅ RESOLVED 2026-07-18.** Distinguished the two things the PRD lumped together: spam/dedup _filtering_ stays deferred (PRD §12 is right to), but a coarse per-intake-key abuse _ceiling_ is infra self-protection and goes in now. Chose a **Postgres-native counter** at the Receiver — no new vendor, consistent with the `pgmq` rejection of Upstash (§5). Upstash rejected here for the same reason + no perf need at thin-core scale. §5 adds the trade-off row, §3 notes the ceiling on the Receiver, §6 makes it a MUST that MUST NOT block within-limit submissions (NFR-002 intact). Design note: the ceiling is admission control preceding the buffer — a deliberate narrow exception to persist-before-process that applies only to over-limit (non-lead) traffic. _(Original finding retained below for the record.)_

ARCHITECTURE §7 defers rate limiting to "a later PRD." Pushing back: the **Intake Receiver is the only unauthenticated surface, under a 99.5% uptime SLA (NFR-003).** An anonymous flood burns Edge Function invocations and can inflate `pgmq` unboundedly. "Isolated from the app" protects the app, not the intake path's own SLA.

Not asking for a spam/dedup engine (genuinely later). Asking for a **floor**: per-intake-key rate limiting at the Receiver. Cheapest on-stack: a counter in Postgres, or an Upstash Redis rate-limiter (Supabase-Marketplace-installable) to keep it off the hot path.

**Action:** Add at least the decision to §3.

### 5. Secrets management is unspecified

> **✅ RESOLVED 2026-07-18.** §6 now states: secrets live in Vercel Environment Variables (app) + Supabase Vault / project secrets (Edge Functions), never committed; the service-role key and any server-only secret MUST NOT use the `NEXT_PUBLIC_` prefix (would inline into the client bundle — only Supabase URL + anon key may be public); anon/service-role keys are dashboard-rotatable via a runbook step on suspected compromise. Chose **Level A** — mechanism + rotate-on-compromise, no fixed cadence (no NFR/compliance obligation requires one per ARCHITECTURE §7; revisit if SOC 2 etc. enters scope). _(Original finding retained below for the record.)_

Service-role key ("server-side only"), Resend/Sentry/PostHog keys, intake keys, DB credentials — spread across Vercel and Supabase. §6 says nothing about **where secrets live, how they rotate, or how the boundary is enforced.** For a service-role key whose leak = full cross-tenant compromise, "don't ship it to the browser" is necessary but not sufficient.

Minimum: state secrets live in **Vercel Environment Variables + Supabase Vault**, service-role key never in `NEXT_PUBLIC_*`, and note a rotation path.

**Action:** One-paragraph addition to §6.

### 6. No CI pipeline named

> **✅ RESOLVED 2026-07-18 — with a corrected rationale.** The original justification ("Husky enforces nothing on a contributor who skips the hook") was weak here: CONTRIBUTING.md establishes this is a **solo / process-enforced** repo — no other contributor to police. The real value for a solo dev is (a) running the _full_ suite on the _actual merge state_ (pre-commit hooks only see staged files), (b) auto-running the Playwright E2E + WCAG check (NFR-012) that's too slow to gate a commit, and (c) a clean-environment build check (Supabase + `pgmq`/`pg_cron`). Chose the **split model**: a fast blocking gate (lint + `tsc --noEmit` + Vitest) + an advisory/nightly E2E+WCAG job (E2E is flaky and needs app+Supabase, so it must not block a solo merge). **Docs-only** (like #1–5): added to TECH-STACK §3 + §6 and CONTRIBUTING's tooling layer; the `.github/workflows/*.yml` is deferred to scaffolding (no `package.json` yet). CI complements, does not replace, the self-review checklist. _(Original finding retained below for the record.)_

Vitest, Playwright, ESLint, Prettier, Husky, lint-staged — all local. **Husky enforces nothing on a contributor who skips the hook**, and hooks don't run migrations or deploy gates. No GitHub Actions (or equivalent) running the suite, the WCAG check (NFR-012), and type-checking on PRs before merge. For a 2–3 person team this is the net that lets you move fast without breaking `main`. Vercel preview deploys are part of this but don't run your test suite by themselves.

**Action:** Add GitHub Actions to §3/§4.

### 7. PDF generation for quotes is hand-waved

> **✅ RESOLVED 2026-07-18.** First checked whether a server PDF is even required — PRD-020 says "printable **or** shareable," which browser print-to-PDF satisfies with no library. But §2 already commits Supabase Storage to holding "generated quote documents," and the decision is to email the quote **as a PDF attachment** via Resend, which needs a server-generated file. Chose **`@react-pdf/renderer`** (`renderToBuffer` in a route handler): verified it runs on Vercel's Node runtime with no headless Chrome, ~2 MB vs. ~100 MB Chromium — and Chromium _exceeds_ Vercel's 50 MB function limit, so browser-render was not merely heavier but non-viable. Added a **MUST**: fonts bundled/embedded locally, never fetched at render time (a serverless cold-start font fetch can time out or silently substitute, producing a wrong customer-facing doc). §4 gets the library; §2 unchanged. _(Original finding retained below for the record.)_

PRD-020 requires a "printable or shareable quote document"; §2 says Supabase Storage holds it; **nothing says what generates the PDF.** Real trade-off on serverless:

- Browser-render (Playwright/Puppeteer) → heavy, cold-start cost, may exceed Vercel function limits
- `@react-pdf/renderer` → lighter, pure JS, fits serverless
- HTML-to-PDF service → new vendor

**Action:** Name the approach (recommend `@react-pdf/renderer`) in §4.

### 8. Input validation / schema library missing

> **✅ RESOLVED 2026-07-18.** Confirmed the demand is real (4 existing mandates: custom-field validation PRD-022, mandatory opportunity fields PRD-012, XSS input validation ARCH §7, intake payload schema check) with no library named. Chose **Zod** over Valibot: validation here is server-weighted (RLS-primary / API-as-authority), so Valibot's client-bundle edge mostly evaporates, while Zod's ecosystem (React Hook Form resolver for the dynamic custom-field forms, broadest Supabase/Next patterns) wins. §4 adds the library; §6 makes it the **single** validation tool of record (no ad-hoc validation), with the intake schema defined once and shared by Receiver + Worker. Explicitly noted Zod validates _input_ but does **not** encode _output_ — stored-XSS still needs output encoding at render (ARCH §7), a boundary worth stating so "Zod covers XSS" isn't assumed. _(Original finding retained below for the record.)_

You validate custom fields against FieldDefinition, enforce mandatory opportunity fields server-side, and run a quote state machine — no validation library named. In TypeScript this is almost always **Zod**, conspicuous by its absence. Also serves the XSS mitigation (ARCHITECTURE §7 "server-side input validation") and the intake payload schema check.

**Action:** Add Zod to §4 (prevents three ad-hoc approaches).

---

## 🟡 Worth a look — lower stakes

- **`next lint` is deprecated in Next 16.** §4/§6 invoke ESLint "through `next lint`." Next 16 moved to the ESLint CLI directly. Update the invocation to avoid a day-one deprecation warning.
- **bcrypt vs. Argon2id.** NFR-007 lists Argon2id first, bcrypt as fallback; you took the fallback because that's what GoTrue provides. Defensible — but state in §6 that Supabase Auth's hash algorithm is **not yours to choose**, so a future Argon2id mandate is a platform constraint, not a config change. Currently reads as if bcrypt was preferred.
- **PostHog session replay + GDPR.** §3 enables session replay; you classify contact/inquiry data as Confidential personal data and commit to GDPR. **Session replay can capture on-screen PII** unless masked. Note the masking requirement or it's a GDPR hole in the analytics layer.
- **No staging/preview data isolation stated.** Vercel preview deploys point at _some_ database. If production Supabase, every PR branch can read tenant data. State that previews use a separate Supabase project/branch (Supabase database branching pairs with Vercel previews).

> **✅ #9–12 RESOLVED 2026-07-18.** #9 — corrected: `next lint` is **removed** in Next 16 (not just deprecated) and `next build` no longer lints, so the docs' "run through `next lint`" was a factual error; fixed to the ESLint CLI (flat config) in TECH-STACK §4/§6 **and** CONTRIBUTING. #10 — §6 note added: bcrypt is a platform constraint of GoTrue, not a preference; Argon2id would need a platform change. #11 — §3 PostHog row now MUSTs input/PII masking on session replay (closes the GDPR hole). #12 — §6 rule: preview deploys MUST NOT hit the production Supabase project; separate project/branch, prod creds never in a preview.

---

## AI-readiness

Stack is **correctly scoped to exclude AI for thin-core** (§6 bans LLM/vector tech behind a PRD gate). Keep that. Two low-cost decisions now keep the door open cleanly for the AI sales assistant PRODUCT.md §3 intends:

1. ~~**Enable `pgvector` at provision time (don't use it yet).**~~ **↩ REVERSED 2026-07-18 (#13).** Verification showed pgvector enables **anytime** (dashboard / CLI / one SQL line) with zero cost or lock-in to deferring — so pre-enabling buys nothing and nudges the PRD's hard "no AI/vector in thin-core" line for no benefit. **Resolved instead as documentation-only:** §6's AI-exclusion clause now records that the future vector path is `pgvector` (enable-on-demand, same Postgres, no vendor) and MUST NOT be enabled in thin-core. AI-readiness is documented without importing anything into scope.
2. **When AI lands, `vercel/ai-gateway` + Vercel AI SDK are already in the platform's orbit** — the natural provider-routing/failover layer. Nothing to add now; just don't reach for a separate LLM-ops vendor later.

Append-only `StageHistory`/`QuoteStatusHistory` is already exactly what a future "cold-deal flagging" model needs.

---

## What's genuinely right (don't over-correct)

- **One managed vendor (Supabase) for all persistence** — correct at this scale.
- **`pgmq` + `pg_cron` for the capture buffer** — rejecting SQS/Upstash is right; the durable buffer _in_ Postgres matches persist-before-process exactly.
- **Modular monolith over microservices** — correct; distributed services at 10 concurrent users would be self-harm.
- **shadcn/ui on Radix for WCAG 2.1 AA** — sound, traceable to NFR-012.
- **Rejecting Firebase for a relational graph** — correct and well-justified.

No unnecessary complexity, duplication, or conflicting responsibilities **at the technology layer**. The conflicts are at the **decision layer** (auth model) and the **missing-layer level** (pooler, migrations, CI, rate limiting).

---

## Short list — priority order

| #   | Gap                                                                                                                   | Add to                | Severity |
| --- | --------------------------------------------------------------------------------------------------------------------- | --------------------- | -------- |
| 1   | ✅ ~~Close RLS-primary vs. app-layer-primary contradiction~~ **Resolved 2026-07-18**                                  | §5 + reconciliation   | 🔴       |
| 2   | ✅ ~~Connection pooler (Supavisor)~~ **Resolved 2026-07-18** (severity corrected 🔴→🟠: REST path bypasses Supavisor) | §3, §6                | 🟠       |
| 3   | ✅ ~~Migration tool (Supabase CLI)~~ **Resolved 2026-07-18**                                                          | §4, §6                | 🔴       |
| 4   | ✅ ~~Intake rate-limiting floor~~ **Resolved 2026-07-18** (Postgres-native ceiling; filtering stays deferred)         | §3, §5, §6            | 🟠       |
| 5   | ✅ ~~Secrets management + rotation~~ **Resolved 2026-07-18**                                                          | §6                    | 🟠       |
| 6   | ✅ ~~CI pipeline (GitHub Actions)~~ **Resolved 2026-07-18** (split gate; docs-only, .yml deferred to scaffold)        | §3, §6 + CONTRIBUTING | 🟠       |
| 7   | ✅ ~~PDF generation library~~ **Resolved 2026-07-18** (`@react-pdf/renderer`; local-font MUST)                        | §4                    | 🟠       |
| 8   | ✅ ~~Zod (validation)~~ **Resolved 2026-07-18** (single tool of record; input≠output-encoding noted)                  | §4, §6                | 🟠       |
| 9   | ✅ ~~`next lint` deprecated in Next 16~~ **Resolved** (it's _removed_; fixed §4/§6 + CONTRIBUTING)                    | §4, §6, CONTRIBUTING  | 🟡       |
| 10  | ✅ ~~bcrypt-is-platform-constrained note~~ **Resolved**                                                               | §6                    | 🟡       |
| 11  | ✅ ~~PostHog session replay PII masking~~ **Resolved**                                                                | §3                    | 🟡       |
| 12  | ✅ ~~Preview/staging DB isolation~~ **Resolved**                                                                      | §6                    | 🟡       |
| 13  | ↩ ~~Enable `pgvector` at provision~~ **Reversed → documented path only** (enables anytime; don't pre-enable)          | §6                    | 🟡       |

**Items 1–3 cause rework or a security incident if skipped.** The rest are cheaper to add now than to retrofit.

---

## Resolution summary (2026-07-18)

All 13 findings addressed. 3 🔴 + 5 🟠 + 5 🟡. Two findings had their severity/rationale corrected on verification (#2 pooler 🔴→🟠, #6 CI rationale), one was reversed (#13 pgvector), and one surfaced an upstream contradiction that was reconciled (#4 → ARCHITECTURE §7). Changes committed to `main` across TECH-STACK.md, ARCHITECTURE.md, CONTRIBUTING.md, and the reconciliation log.
