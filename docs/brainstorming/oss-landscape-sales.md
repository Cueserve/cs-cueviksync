# OSS Landscape — Sales Side (Brainstorming Draft)

**Owner:** Viral Parikh
**Last updated:** 2026-08-22
**Status:** Draft

Companion doc: [oss-landscape-job-execution.md](oss-landscape-job-execution.md) covers
Project/Job/Order execution and the dashboard research — split out because that half is the
client's stated first preference and needed deeper research on its own. This doc covers the
inquiry-to-quote side only: Inquiry Intake & Triage, Customer & Relationship Management,
Opportunity & Pipeline Management, Service Catalog, Estimation Engine, Quote Management (see
system-modules.md for module definitions). Nothing here is authoritative — see
[README.md](README.md).

---

## Contents

- [1. Method](#1-method)
- [2. Closest OSS Analogs](#2-closest-oss-analogs)
- [3. The Honest Gap Assessment](#3-the-honest-gap-assessment)
- [4. Build vs. Reference vs. Integrate](#4-build-vs-reference-vs-integrate)
- [5. Quick-Win Options (Sales Side)](#5-quick-win-options-sales-side)
- [6. Open Questions for You](#6-open-questions-for-you)

## 1. Method

Web research against public docs, GitHub repos, and 2026 comparison write-ups — no local
install or code read of any of these projects. Treat feature claims as vendor/reviewer-reported,
not independently verified. Sources listed inline.

## 2. Closest OSS Analogs

| CuevikSync Module (system-modules.md)                       | Closest OSS Match                                                                  | What It Actually Covers                                                                                                                                                                                                            | What It Doesn't                                                                                                                                                                                                                    |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inquiry Intake & Triage                                     | **Chatwoot** (MIT), **Zammad** (AGPL)                                              | True omnichannel inbox — email, WhatsApp, Instagram, Telegram, live chat unified per-contact into one thread. Zammad adds SLA/trigger/queue discipline.                                                                            | Neither models "inquiry → durable record before triage" as a zero-leak guarantee — they're support-ticket tools, not lead-capture-with-audit tools. No pipeline/quote concept downstream.                                          |
| Customer & Relationship Mgmt + Pipeline                     | **Twenty** (AGPL core), **EspoCRM** (GPLv3), **Krayin** (MIT), **SuiteCRM** (AGPL) | Contacts/companies, kanban pipeline with stages/probability, custom objects/fields, RBAC. Twenty is the most modern stack (React/NestJS/Postgres) and has a native MCP server. EspoCRM is ~90% admin-configurable, no fork needed. | None ship native RLS-enforced multi-tenancy on the OSS tier — Krayin's multi-tenant support is a paid add-on; Twenty/EspoCRM self-host is one workspace per deployment.                                                            |
| Service Catalog + Estimation Engine                         | **ERPNext** (GPLv3, Frappe framework)                                              | Item/price-list catalog, quotation-from-item flow, BOM-driven costing for manufacturing.                                                                                                                                           | Not an attribute-matrix product configurator (no modifier-option combinatorics) and no margin-floor guardrail or quantity-tier price-break concept as a first-class rule — you'd build that layer yourself even on top of ERPNext. |
| Quote Management                                            | **ERPNext**, **SuiteCRM + CPQ add-on**                                             | Quote versioning, lead→opportunity→quotation→sales-order chain in one DB (ERPNext), so no re-entry across the funnel.                                                                                                              | No open-source project has a client-facing proofing/annotation/e-approval surface (CuevikSync's Later Documents & Customer Portal) — that's commercial-only or bespoke everywhere.                                                 |
| Workflow Automation (staged, Later — stale-quote reminders) | **n8n** (Sustainable Use License, not pure OSS), **Twenty's built-in triggers**    | n8n is the de facto self-hostable trigger-condition-action engine; even Twenty's own reviewers say its native automation is "not powerful enough" for real sales automation and teams bolt on n8n/Zapier.                          | n8n's license is source-available, not permissive OSS — flag before treating it as a drop-in dependency (TECH-STACK.md package-approval gate applies either way).                                                                  |

Sources: [Twenty product page](https://twenty.com/product), [Twenty review — Times of Claw](https://www.dench.com/blog/twenty-crm-review), [growcrm.io OSS CRM ranking](https://growcrm.io/2026/01/04/top-20-open-source-self-hosted-crms-in-2025/), [Krayin GitHub](https://github.com/krayin/laravel-crm), [Krayin review](https://www.dench.com/blog/krayin-crm-review), [Chatwoot](https://openalternative.co/chatwoot), [Zammad vs Chatwoot](https://openalternative.co/alternatives/zammad), [ERPNext overview](https://silenceper.com/en/article/2026-06-13-erpnext-open-source-erp/).

## 3. The Honest Gap Assessment

Pushing back on the premise before answering it: **most of PRODUCT.md's committed thin-core
sales scope is not novel.** Contacts, companies, a kanban pipeline, custom fields, RBAC, basic
line-item quotes — Twenty, EspoCRM, and Krayin all do this today, well, for free. Building that
from scratch is table stakes you're paying for, not a moat.

The actual gaps on the sales side:

1. **No OSS project treats the record as zero-leak-guaranteed.** "One record per inquiry,
   nothing silently discarded" (PRODUCT.md §5 structural criteria) isn't a feature these tools
   advertise — it's an architectural commitment CuevikSync is making that the closest analogs
   don't.
2. **No OSS multi-tenant RLS story at this depth.** Every CRM surveyed either has no
   multi-tenancy on the free tier or paywalls it. The Supabase RLS-enforced `tenant_id` model
   in ARCHITECTURE.md is a real differentiator, not a reimplementation of something already
   solved.
3. **The "config not code" verticalization promise (PRODUCT.md §1, §7) is the actual bet.**
   EspoCRM gets closest (~90% admin-configurable) but nothing surveyed lets a non-technical
   team stand up a _different vertical's_ pipeline + catalog without a developer.

Where thin-core is arguably **not** buying anything over installing an existing tool: the
CRM/pipeline slice alone is close enough to Twenty/Krayin/EspoCRM out of the box that if the
only goal were "prove a lean print shop will use a pipeline," you could validate that assumption
with Krayin in a weekend instead of building it. The reason to still build it in CuevikSync is
that the pipeline alone isn't the product — the product is pipeline-to-quote-to-job as one
record with one tenant-scoped identity, and that joint is what nothing OSS has (see the
companion job-execution doc for the other half of that joint).

## 4. Build vs. Reference vs. Integrate

Not a decision — trade-offs for you to weigh per module:

| Module                                                            | Recommendation                                                                                                                                                                                                          | Why                                                                                                                                                                                                                                           |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CRM / Pipeline (thin-core, committed)                             | **Build**, but study Twenty's data model for custom-object/field UX patterns.                                                                                                                                           | Closest modern stack (Postgres/TS) to reference for RBAC + custom-field ergonomics; not a fork candidate since the product's value is the downstream joint, not the pipeline alone (§3).                                                      |
| Estimation Engine formula/tier design (undecided, PRODUCT.md §3A) | **Reference ERPNext's quotation-from-item flow + CPQ add-on patterns** before the estimation PRD is written.                                                                                                            | Formula/price-break structure is an open PRODUCT.md decision — cheaper to study a working implementation than invent from zero.                                                                                                               |
| Omnichannel connectors (Later, Integrations)                      | **Evaluate integrating Chatwoot** as the channel layer instead of building WhatsApp/SMS connectors in-house when Integrations & Industry Templates comes off Later.                                                     | Chatwoot's per-contact cross-channel threading is exactly the Unified Communication Timeline's "reply-capable omni-inbox" scope note (system-modules.md) — building this from scratch is the highest-effort, least-differentiated Later item. |
| Workflow Automation (staged, Later)                               | **Evaluate n8n as the automation backend** instead of a bespoke trigger-condition-action engine — flag the license (Sustainable Use, not permissive OSS) for the TECH-STACK.md package-approval gate before committing. | Even Twenty's own users outgrow its built-in automation and reach for n8n; building a competing engine in-house is effort spent re-solving a solved problem.                                                                                  |
| Multi-tenant RLS architecture                                     | **Build (already the plan).** Don't reconsider.                                                                                                                                                                         | §3 point 2 — this is the one place where "just use an existing OSS CRM" is a real regression, not a shortcut.                                                                                                                                 |

## 5. Quick-Win Options (Sales Side)

**Read the companion doc's §5 first.** It flags a tension: the client's stated first preference
is job tracking + dashboards, not the sales side — so before trimming the sales scope below,
check whether that changes how much sales-side v0 needs to be before job execution gets the
real build investment.

Two independent cuts, on top of the already-scoped PRODUCT.md §4 thin-core:

**Option B — Single-channel intake only, defer omnichannel.**
Thin-core §4 already limits capture channels to phone/email/text/web-form/walk-in with manual
logging for non-digital channels. A tighter v0 could take just email + manual entry (covers
walk-in/phone by a rep typing it in) and defer the web-form connector.

- _Pro:_ Fewer intake code paths to build and test before the zero-leak guarantee has to hold.
- _Con:_ Web-form is likely the highest-volume channel for a Print & Signage shop's site
  traffic — deferring it may mean v0 doesn't capture the leads that matter most.

**Option C — One tenant, no multi-tenant onboarding flow yet.**
Multi-tenancy (tenants/profiles/RLS) is already built per the repo's Project State. A v0 could
skip building self-serve tenant provisioning (still undesigned) and hand-provision the first
pilot tenant directly in Supabase, deferring the provisioning flow until a second tenant is
actually needed.

- _Pro:_ Removes an entire undesigned system path (provisioning) from the v0 critical path.
- _Con:_ Doesn't validate the provisioning UX at all — fine with one design partner lined up,
  riskier if a second shop shows up before that flow exists.

Neither requires a PRODUCT.md change to try internally — they're build-sequencing choices
within existing committed scope, not scope changes.

## 6. Open Questions for You

- Given the client's stated preference is job tracking + dashboards (see companion doc), is the
  sales side now the _thinner_ half of v0 — build just enough intake/CRM/quote to feed a job
  record, then spend the real effort on execution + reporting?
- Worth a throwaway hour installing Krayin or Twenty locally to pressure-test §3's claim that
  the CRM/pipeline slice alone isn't the differentiator — before committing engineering time to
  building that slice from scratch?
- Chatwoot-as-channel-layer (§4) — worth a spike when Integrations & Industry Templates comes
  off Later, or is owning the connector code a deliberate choice regardless of build cost?
