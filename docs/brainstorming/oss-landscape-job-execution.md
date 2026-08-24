# OSS Landscape — Job/Project/Order Execution & Dashboards (Brainstorming Draft)

**Owner:** Viral Parikh
**Last updated:** 2026-08-22
**Status:** Draft

Companion doc: [oss-landscape-sales.md](oss-landscape-sales.md) covers Inquiry Intake, CRM,
Pipeline, Catalog, Estimation, and Quote Management. This doc covers Project/Job/Order
Execution, Work Orders & Scheduling, and — researched deeper, per your steer that job tracking
and an intelligent weekly/monthly/quarterly/yearly dashboard are the client's first preference —
the reporting/analytics layer that sits on top of it. Nothing here is authoritative — see
[README.md](README.md).

---

## Contents

- [1. Method](#1-method)
- [2. Closest OSS Analogs — Job/Order Execution](#2-closest-oss-analogs--joborder-execution)
- [3. Deep Dive — Job Tracking + Intelligent Dashboards](#3-deep-dive--job-tracking--intelligent-dashboards)
- [4. The Honest Gap Assessment](#4-the-honest-gap-assessment)
- [5. Build vs. Reference vs. Integrate](#5-build-vs-reference-vs-integrate)
- [6. Quick-Win Options (Job Side) — and a Direct Conflict With the Sales Doc](#6-quick-win-options-job-side--and-a-direct-conflict-with-the-sales-doc)
- [7. Open Questions for You](#7-open-questions-for-you)

## 1. Method

Web research against public docs, GitHub repos, and 2026 comparison write-ups — no local
install or code read of any of these projects. Treat feature claims as vendor/reviewer-reported,
not independently verified. Sources listed inline. §3 goes a level deeper than the rest of this
doc because it's the stated client priority.

## 2. Closest OSS Analogs — Job/Order Execution

| CuevikSync Module (system-modules.md)    | Closest OSS Match                                                                   | What It Actually Covers                                                                                                                                                                     | What It Doesn't                                                                                                                                                                                                                                                                             |
| ---------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project / Job / Order Execution          | **ERPNext manufacturing** (job cards, work orders), **OpenProject**, **Focalboard** | ERPNext auto-creates job cards from a work order and tracks them through production, with operating-cost rollup per job card. OpenProject/Focalboard give generic kanban/Gantt task boards. | Nothing OSS models a **won-quote → job with an immutable spec snapshot** the way PRODUCT.md's Job/Order does; ERPNext job cards are shop-floor manufacturing units, not sales-linked execution records with turnaround/on-time KPIs baked in.                                               |
| Work Orders & Scheduling (staged, Later) | **ERPNext work orders**, **OpenProject Gantt**                                      | Resource/time-slot assignment against a work order; ERPNext ties this to BOM consumption.                                                                                                   | Neither is built for named, throughput-rated resources (a wide-format plotter vs. an offset press) as first-class scheduling entities — that's the print-vertical-template layer system-modules.md already scopes as custom, not platform.                                                  |
| Print & Signage-specific MIS             | **None found.**                                                                     | —                                                                                                                                                                                           | Every print-shop MIS surfaced (PrintPLANR, shopVOX, Printavo, InfoFlo Print, PrintSmith Vision) is closed-source SaaS. There is no open-source reference implementation for print-vertical job/production tracking at all — see §3 for the same finding applied to dashboards specifically. |

Sources: [ERPNext manufacturing/work orders](https://frappe.io/erpnext/manufacturing/work-orders), [ERPNext job cards](https://frappe.io/erpnext/manufacturing/job-cards), [ERPNext manufacturing dashboard](https://docs.frappe.io/erpnext/manufacturing-dashboard), [PrintPLANR](https://www.printplanr.com/), [SoftwareConnect print shop roundup](https://softwareconnect.com/roundups/best-print-shop-management-software/).

## 3. Deep Dive — Job Tracking + Intelligent Dashboards

This is the client's stated first preference, so it gets the harder look you asked for:
job tracking depth, then the weekly/monthly/quarterly/yearly analytics layer on top of it.

### 3.1 What already exists in this repo, and why it matters

PRD.md already commits to the foundation this needs — check it before assuming a gap:

- **PRD-039** (turnaround/on-time calculation, Must) and **PRD-040** (overdue flag, Must) —
  the system already computes turnaround days and on-time status automatically per job.
- **PRD-043** (weekly job KPI summary, Should) — jobs completed, average turnaround, on-time
  percentage, total invoice value, one row per week. **The PRD text itself says: "This release
  ships the summary as a table; chart visualization is deferred pending a charting-library
  decision (see TECH-STACK.md)."**
- Checked TECH-STACK.md directly: **no charting library has been chosen yet.** That decision
  is open, not stalled on research — this section exists to inform it.
- CLAUDE.md's Project State also notes the `/dashboard` route today is a **pitch mockup** with
  hardcoded data, explicit in its own header comment that Jobs is the one KPI area grounded in
  a committed requirement (PRD-043) — Sales and Finance on that mockup are speculative and
  should not be treated as scaffolding.

So the immediate, concrete gap is narrow and already named in your own docs: **pick a charting
library, then build monthly/quarterly/yearly rollups on top of the weekly one PRD-043 already
committed to.** The research below is aimed at that decision plus the "intelligent" framing you
asked about (drill-down, trend, anomaly-style views beyond a static table).

### 3.2 Embedded BI platforms (Metabase, Superset, Lightdash) — evaluated and not recommended as the primary layer

Researched because "intelligent dashboard" could mean bolting on a general BI tool instead of
building charts natively:

- **Metabase** (AGPL core) — self-hostable, connects to Postgres directly, has row-level
  permissions. But true **multi-tenant embedded analytics (per-tenant data isolation via JWT)
  is gated to the paid Enterprise plan** — the free/OSS tier is not built for a SaaS product
  embedding tenant-scoped dashboards inside its own UI.
- **Apache Superset** (Apache 2.0) — the most capable free option, broader connector library,
  larger contributor base, and better open row-level-security support than Metabase's free
  tier. Still a separate service to deploy, operate, and keep in sync with RLS semantics
  that already live in Postgres via ARCHITECTURE.md's `tenant_id` model — duplicating the
  access-control boundary in a second system.
- **Lightdash** (MIT-ish, open core) — the strongest option for teams already using dbt; it's
  built around a dbt semantic layer. Nothing in TECH-STACK.md uses dbt, and adding it just to
  get Lightdash would be a second new dependency to justify, not a plug-in for what exists.

None of these three is purpose-built for weekly/monthly/quarterly/yearly job-KPI rollups —
they're generic BI on top of whatever schema you point them at. You would still design the
rollup logic and the specific KPI views yourself even if you adopted one. Given that, and given
the multi-tenant embedding gap in the free tiers, **a separate BI service is not the fit for
CuevikSync's Server Component + RLS architecture** — noted as researched-and-rejected rather
than left unexamined.

### 3.3 Native in-app charting — the fit for this stack

- **Tremor** (Apache 2.0) — a React component library purpose-built for dashboards: KPI cards,
  trend charts, trackers, tables. Built on **Recharts** + Tailwind + Radix, now backed by
  Vercel, and its stated design philosophy ("show the data, hide the chrome") matches a
  shadcn/ui-adjacent aesthetic. Copy-paste component model, same pattern CuevikSync already
  uses for its shadcn primitives.
- **Recharts** (MIT) — the underlying charting engine either way; 2.4M weekly downloads,
  SVG-based, composable React API. Tremor is Recharts pre-styled for dashboard use; picking
  Tremor doesn't mean giving up direct Recharts access for anything Tremor doesn't cover.
- Both render **server-computed aggregates** as props — no client-side data-fetching library
  needed, consistent with TECH-STACK.md's existing "no client-side server-state cache" rule and
  the Server Components-first architecture. This is the one place in this research where the
  OSS option and the existing architecture pull in the same direction rather than requiring a
  trade-off.

### 3.4 The aggregation pattern — weekly → monthly → quarterly → yearly

PRD-043 already defines the weekly rollup (jobs completed, avg turnaround, on-time %, invoice
value). Extending to monthly/quarterly/yearly is a well-trodden Postgres pattern, not new
territory:

- **Layered materialized views**: a daily or weekly view as the base, with monthly, quarterly,
  and yearly views built as further aggregations on top of it rather than each re-scanning raw
  job rows — this is the standard "hierarchy of pre-aggregated data" pattern for dashboard
  responsiveness.
- **Refresh cadence**: CLAUDE.md's Project State already flags that **`pg_cron` is not enabled
  yet but is deferred to the migration that first uses it** — a scheduled `REFRESH MATERIALIZED
VIEW` job is exactly that first use case. This isn't a new infra decision; it's the trigger
  for one already anticipated in the repo.
- **Rollup tables vs. materialized views**: for a lean-team data volume (tens to low hundreds
  of jobs/week per tenant), a materialized view refreshed on a schedule is simpler to operate
  than incrementally-maintained rollup tables, and the data volume here doesn't yet justify the
  extra complexity rollup tables exist to solve at larger scale.

### 3.5 "Intelligent" — what that could mean without pulling in AI Copilot scope

The word "intelligent" is worth pinning down before it becomes an AI Copilot dependency it
doesn't need to be. Three tiers, cheapest first:

1. **Trend + comparison, no AI at all** — period-over-period deltas (this month vs. last,
   this quarter vs. same quarter last year), sparklines, on-time % trending up/down. This is
   pure SQL over the rollups in §3.4 plus Tremor/Recharts trend components — zero AI, zero new
   package beyond the charting library.
2. **Threshold-based flags** — an on-time % or turnaround trend crossing a configured
   threshold gets visually flagged. Same deterministic-rule pattern already approved for
   cold-deal flagging in ai-features.md §5 ("auto-flagged," not AI) — reusable pattern, no new
   AI surface.
3. **AI-narrated dashboard** ("explain why turnaround dipped this month") — this is already
   scoped in ai-features.md §2/§3 as **Wave 3, gated behind Dashboards & Operational Reporting
   being Must-have-delivered first, and explicitly deferred to AI Copilot (Later)**. Nothing in
   this research changes that gating — it's flagged here only so "intelligent dashboard" isn't
   read as license to pull Wave 3 forward.

### 3.6 Reference-only: Frappe Insights

**Frappe Insights** (AGPL, part of the Frappe ecosystem that includes ERPNext) is a genuinely
open-source, no-code BI tool — drag-and-drop dashboard builder, dozen-plus chart types, built
for exactly this "let a non-technical team build its own report" ethos. Worth knowing about as
a **UX reference** for what a tenant-admin-configurable dashboard builder could look like if
that ever becomes a roadmap item (it would match the "config not code" philosophy in PRODUCT.md
§1). It's Frappe-framework-coupled, though — not portable to a Next.js/Supabase stack, so this
is a pattern to study, not a dependency to adopt.

## 4. The Honest Gap Assessment

- **No OSS project — general BI or print-specific — ships a weekly/monthly/quarterly/yearly job
  KPI dashboard shaped for a lean job shop.** §3.2 confirms even the general BI tools require
  you to design that layer yourself; §2 confirms no print-vertical product is open source at
  all. This is real build territory, but §3.3–3.4 show the _how_ is standard, low-risk Postgres
  - React work, not exotic engineering.
- **The charting-library decision PRD-043 explicitly deferred is the actual unblock**, not a
  new capability to research from scratch. §3.3 is written to be actionable against that
  specific open decision.
- **ERPNext's job-card model is the closest execution-tracking analog** but is shop-floor
  manufacturing framing (workstations, BOM consumption), not a sales-linked job record with an
  immutable spec snapshot — confirmed gap, not a build-vs-buy question.

## 5. Build vs. Reference vs. Integrate

| Module / Decision                                                       | Recommendation                                                                                                                                                                                                                                            | Why                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Print production board / vertical template                              | **Build.** No reference exists.                                                                                                                                                                                                                           | §2 — zero OSS prior art for print-vertical job execution.                                                                                                                                                                                                                                           |
| Job/Order execution model (immutable spec snapshot, turnaround/on-time) | **Build (already committed, PRD-039/040/041).** Don't reconsider.                                                                                                                                                                                         | Nothing OSS models this joint (won-quote → job with spec snapshot) — confirmed gap, not a shortcut opportunity.                                                                                                                                                                                     |
| Charting library for PRD-043 + rollups                                  | **Recommend Tremor (built on Recharts) over a separate BI platform.** This is the one place this research produces a fairly clear lean — still your call, and still a TECH-STACK.md package-approval decision either way (CLAUDE.md Decision escalation). | §3.2 vs §3.3 — BI platforms either gate multi-tenant embedding behind Enterprise pricing or require operating a second service that duplicates your RLS boundary; Tremor/Recharts render server-computed aggregates natively inside the existing Server Component architecture with no new service. |
| Weekly→monthly→quarterly→yearly rollups                                 | **Build as layered materialized views, refreshed via `pg_cron`.**                                                                                                                                                                                         | §3.4 — standard Postgres pattern; `pg_cron` enablement is already anticipated in Project State for exactly this kind of scheduled job, not a new infra decision.                                                                                                                                    |
| Tenant-configurable dashboard builder (not scoped anywhere yet)         | **Reference Frappe Insights's UX** only if/when this becomes a real roadmap item.                                                                                                                                                                         | §3.6 — good pattern reference, not a portable dependency (Frappe-framework-coupled).                                                                                                                                                                                                                |

## 6. Quick-Win Options (Job Side) — and a Direct Conflict With the Sales Doc

The sales-side companion doc's §5 Option A suggested deferring Job/Order execution entirely for
a v0, to validate the intake-to-quote loop first before building execution tracking. **You've
now told me job tracking + dashboards is the client's _first_ preference — that directly
contradicts deferring it.** Flagging this rather than quietly resolving it: these two inputs
point in opposite directions, and only you can say which one wins.

Two ways to reconcile, not a recommendation between them:

**Reconciliation 1 — Job side leads, sales side goes minimal.**
Build just enough of Inquiry Intake + CRM + Pipeline + a bare manual Quote to produce a Won
opportunity that can convert to a Job (PRODUCT.md's committed win-event handoff), then put the
real build investment into Job/Order execution + the PRD-043 weekly summary + the
monthly/quarterly/yearly rollups from §3.4. This matches "job tracking + dashboard is the first
preference" literally.

- _Pro:_ Ships the client's actual stated priority first.
- _Con:_ The upstream funnel (intake reliability, pipeline) that feeds jobs is thinner and less
  battle-tested when the job-tracking half goes live — bad intake data would show up as noisy
  job-KPI data downstream.

**Reconciliation 2 — Both halves ship thin-core as already committed, dashboard gets the extra
depth.**
Keep PRODUCT.md §4 thin-core as scoped (it already includes Job/Order execution and the weekly
KPI summary — see PRD-039/040/043), and treat "job tracking + dashboards is the priority" as a
signal to invest the _extra_ research/design effort specifically in §3's dashboard layer
(monthly/quarterly/yearly, trend views) rather than in trimming other modules.

- _Pro:_ No re-litigation of the already-committed thin-core scope; the client preference gets
  honored by depth, not by reordering.
- _Con:_ Slower to first ship than Reconciliation 1 if "job tracking + dashboards" really means
  "show me that first, everything else can wait."

## 7. Open Questions for You

- Which reconciliation in §6 matches what "client's first preference" actually means here —
  ship job tracking/dashboards _before_ the rest, or build the rest to committed thin-core scope
  and put the extra depth into dashboards specifically?
- Does "intelligent dashboard" mean §3.5 tier 1 (trend/comparison, no AI), tier 2 (threshold
  flags), or does the client actually want tier 3 (AI-narrated) sooner than ai-features.md's
  Wave 3 gating currently allows?
- Tremor vs. plain Recharts (§3.3) — worth a half-day spike building PRD-043's weekly table as a
  chart before committing the TECH-STACK.md package decision either way?
