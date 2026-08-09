# PRODUCT.md — Product Concept

**Owner:** Viral Parikh (Product Owner)
**Last updated:** 2026-08-08
**Source of truth for:** what CuevikSync is, why it exists, and the intended end-state scope of
Phase 1 — an AI-powered platform to accelerate inquiry-to-revenue workflows for small and mid-sized businesses, 
validated first against Print & Signage operations.

> Derived from: (none — starting point)
> Downstream: README.md, docs/PRD.md, docs/BACKLOG.md

---

## 1. Overview

### Vision

An AI-powered platform that helps small and mid-sized businesses capture every inbound inquiry and turn it into revenue.

### Problem Statement

Small and mid-sized businesses don't lose revenue because they lack demand. They lose it
because incoming inquiries slip through the cracks. Requests come in by phone, email, web
form, and walk-in, and there's no single place to catch and track them all. Big CRM tools
exist, but they're built for large corporate sales teams — too heavy, too rigid, and too
expensive for a small team to actually use.

Closing that gap has to be backed by software the team can trust — specifically:

- **Zero-leak capture** — an inbound request that reaches the business must become a
  record. Losing one is the single failure this product exists to prevent, so intake
  reliability outranks every other property here.
- **One record per inquiry** — a retry, a redelivery, or the same customer reaching out
  twice must not fragment into duplicate leads that staff have to reconcile by hand.
- **Configuration, not code** — a team must be able to shape pipelines, fields, catalog,
  and roles to its own process without a developer or a consultant. If serving a customer
  needs code, the platform is wrong, not the customer.
- **A human owns anything the customer sees** — AI drafts and suggests; a person approves.
  Nothing reaches a customer that someone did not explicitly send.

### Objective

CuevikSync must let a lean team run its entire inquiry-to-revenue process in one place:
every inbound lead captured, moved through a pipeline the team controls, and closed
without deals leaking or stalling — with no consultant and no custom code to get there.

### Description

CuevikSync is a single workspace where a business runs everything from the first customer
inquiry to a closed order. Every inbound request — by phone, email, text, web form, or
walk-in — lands in one shared queue, is logged as a record, and is prioritized so the team
sees the most urgent and highest-intent leads first. Each inquiry then becomes a tracked
contact and deal that moves through a pipeline the business shapes to match its own stages,
with no code to write.

Around that core, CuevikSync brings together the work a lean team usually spreads across
separate tools and spreadsheets, so contacts, conversations, quotes, and follow-ups all
live in one place. An AI assistant works alongside the team — drafting follow-ups,
recovering missed calls, suggesting the next action, and flagging deals going cold — but it
only suggests and drafts; a person approves anything a customer sees.

Because pipelines, custom fields, templates, and permissions are all configurable, very
different businesses — a professional practice, a field-service crew, an order-fulfillment
shop — can each run their own process on the same system. A team of ten or fewer can be
onboarded and working its live pipeline within days, with no consultant and no custom
development.

This document describes the full product model and the current committed scope for
**Phase 1 thin-core**. Broader capabilities described here remain roadmap intent and
become commitment only when captured in an approved PRD.

## 2. Target Users

> In a lean team, one person often wears several of these hats — the owner may
> also sell, the salesperson may also quote. These are roles, not headcount.
> Thin-core baseline RBAC roles map to these personas: Owner/Admin, Sales Manager,
> Sales Rep, and Office Administrator.

- **Business owner** — runs the business and often closes deals too,
  but has no single view of the pipeline, so inquiries slip through and revenue
  is left on the table.
- **Sales rep** — works the leads every day: qualifies them, sends
  quotes, and chases follow-ups. Today this is spread across email, texts, and
  sticky notes, so deals get forgotten and quotes go out late.
- **Sales manager** — needs to see which deals are moving and which are stalling
  to coach the team and forecast, but that view is scattered across people's
  heads and spreadsheets.
- **Office administrator** — the first person to catch an inbound
  inquiry by phone, email, web form, or walk-in; needs every lead logged the
  moment it arrives so nothing is lost.
- **Operations staff** — the people who fulfill the order once it's
  won; they update job status in the pipeline so sales and the customer always
  know where things stand.

## 3. Features

- **Omnichannel inquiry capture & triage** — a shared queue that pulls every lead (phone,
  email, text, web forms, walk-ins) into one place and auto-prioritizes urgent or
  high-intent messages, so nothing is lost and hot leads surface first.
- **Unified relationship management** — connected contact and company records that map
  people across the multiple organizations they belong to, with automatic duplicate
  detection that keeps data clean and reveals cross-sell connections.
- **Adaptive pipelines** — configurable pipelines that let one lean team run different
  processes side by side (case files, field estimates, batch orders) without custom code.
- **Estimation & service catalog** — a configurable catalog of sellable units
  (attribute-matrix products with modifier options) feeding a structured costing engine
  with formulas, quantity-tier price breaks, and a margin-floor guardrail, so estimates are
  fast, consistent, and protect margin — no spreadsheets.
- **Quotation & order generation** — create, send, and track quotes and orders, including
  AI that drafts them from unstructured client messages and prior purchase history.
- **Job execution & scheduling** — convert won quotes into trackable jobs with milestones
  and change control, then assign people, machines, and time slots on a capacity-aware
  schedule, so accepted work moves to delivery without re-entry or dispatch conflicts.
- **Unified communication timeline** — one chronological feed per contact combining
  calls, emails, texts, and status updates, so staff have full context before they reply.
- **AI sales assistant** — automated follow-ups, missed-call recovery, suggested next
  actions, and cold-deal flagging, so a busy team's follow-through runs itself.
- **Workflow automation** — a trigger-condition-action engine that fires notifications,
  task creation, and stage handoffs off lifecycle events, so routine handoffs across the
  pipeline run without manual chasing.
- **Visibility & reporting** — pipeline and performance insight so managers can forecast
  and coach.
- **Configurability & permissions** — industry-specific custom fields plus role-based
  access that keeps interfaces simple and sensitive data hidden.

## 3A. Decision Placeholders

Open product decisions that block implementation. Each names what is undecided, what it
blocks, and who resolves it. A placeholder is closed only by an approved PRD — never by an
implementation quietly picking a default.

- **Estimation formula and price-break structure** — undefined. The estimation engine
  (costing formulas, quantity-tier price breaks, margin-floor guardrail) is deferred to a
  later PRD (PRD §9). Until that PRD is approved, no implementation may invent or infer
  calculation order, rounding points, tier boundaries, or margin-floor behavior — and no
  thin-core quote field may be shaped to anticipate one. **Decided by:** Product Owner.
- **Work-orders and scheduling depth** — undecided between calendar plus resource
  assignment and full capacity planning. Blocks the scheduling roadmap item in §4 and any
  data model that would presume capacity. Until resolved, no implementation may introduce
  capacity, machine, or time-slot concepts. **Decided by:** Product Owner, informed by the
  Phase 1 Print & Signage validation partner (PRD §10).
- **Trigger for AI-drafted quotes** — described as demand-driven, but the concrete
  requirement that unblocks it is not written down. Until it exists as an approved
  requirement, no implementation may add inbound-message parsing for quote drafting.
  **Decided by:** Product Owner.

When a placeholder closes, mark it **resolved YYYY-MM-DD** and cite the requirement that
now owns it. The entry stays in place, resolved — it is the record of the decision.

## 4. Scope (In / Out)

### In scope — Phase 1 thin-core release (committed)

- Omnichannel inquiry capture and triage into a single shared queue
- Unified contact/company relationship management with duplicate detection
- Adaptive, configurable pipelines (no custom code)
- Basic quotation (manual line items from a flat catalog plus free-form lines)
- Configurable custom fields and role-based access

> **Commitment rule:** This section is the only committed Phase 1 scope.
> Any broader capabilities described elsewhere in this document are roadmap intent
> and become commitment only when promoted into an approved PRD.

### Planned roadmap after thin-core (timing TBD)

- Configurable service catalog — attribute-matrix sellable units with modifier options
- Structured estimation engine — formulas, quantity-tier price breaks, and a margin-floor
  guardrail (formula undefined — see §3A)
- Structured quotation and order generation depth beyond thin-core
- Project/job/order execution — won quotes converted to trackable work with milestones and change control
- AI sales assistant: follow-up/next-action drafting + cold-deal flagging
- Unified per-contact communication timeline
- Pipeline/performance reporting

- Work Orders & Scheduling — capacity-aware resource assignment and calendar scheduling on
  top of job execution (depth is an open decision — see §3A)
- Workflow Automation — trigger-condition-action orchestration of lifecycle events;
  the Phase 1 thin-core release emits the stage/lifecycle events, while automated
  reactions ship in a later Phase 1 release
- Missed-call recovery (requires telephony connector)
- AI-drafted quotes from unstructured inbound (unblocking requirement is an open decision —
  see §3A)

### In scope — post-Phase 1 releases

Planned for releases after Phase 1, demand-driven — not committed to Phase 1:

- AI scheduling / appointment booking
- Mobile field-capture app (voice dictation) — no native mobile surface in this release
- Recurring account & contract management (post-sale account management, outside the
  inquiry-to-revenue funnel)
- White-label branding / client portals
- Marketing campaign / email-blast automation

### Out of scope

Permanently excluded — not deferred. Each carries the reason it stays out, so the decision
does not get re-argued every release:

- **Accounting, invoicing, and payment processing** — CuevikSync tracks quotes and orders
  through acceptance; financials and collections stay in the customer's existing finance
  tools. Owning them would pull the product into regulated payment handling and reconciliation
  work that has nothing to do with capturing an inquiry and closing it.
- **Consultant-led or code-dependent setup** — any capability that the customer's own team
  cannot configure is out, however valuable. The moment setup needs custom code or a
  certified admin, CuevikSync has become the heavy tool it exists to replace (§6).
- **Vertical-specific code paths** — verticals are served entirely through configuration;
  a vertical that needs code is a signal to extend the generic platform, never to fork it
  (see the rule in §7).

## 5. Success Criteria

### Thin-Core Release Outcomes (Committed)

- **No dropped inquiries** — >= 99% of inquiries on connected digital channels (email, web form) are captured as records within 2 min; for manual channels, >= 95% of phone and walk-in inquiries are logged the same business day (100% by next business day) and >= 95% of manually logged email inquiries are captured within 4 business hours. A missed inquiry is the one failure the product exists to prevent.
- **Pipeline visibility** — 100% of active deals show a current stage and a next action; zero deals with no owner or next step.
- **Adoption** — a lean team (10 users or fewer) is fully onboarded and running its live pipeline within 3 days of signup, with no custom development.

### Structural Criteria (Verifiable Before Launch)

Binary properties — true or false on any build, with no adoption data required. Stated at
product level; the mechanism that delivers each is ARCHITECTURE.md's to choose, but the
property itself is not negotiable.

- **One record per inbound submission** — a retried or redelivered submission resolves to
  the one inquiry it represents: never a duplicate, never a lost original.
- **Nothing is silently discarded** — a submission that cannot be processed surfaces for a
  human with its original content intact, rather than being dropped to keep the queue clean.
- **Permissions hold outside the UI** — a role restriction denies a direct request for the
  record, not merely hides the control that would have made it.
- **Every stage change is attributable** — who moved an opportunity, and when, is recorded
  and readable on the record.
- **Customer-facing output requires a human action** — no artifact reaches a customer
  without a person explicitly sending it.
- **A vertical ships without code** — pipelines, custom fields, templates, and roles are
  sufficient to configure one.

### Post-Thin-Core Outcomes (Owned Roadmap Targets)

- **Faster response** — median time from inquiry received to first response drops below 1 hour for teams using the AI assistant.
- **Follow-through** — at least 90% of flagged cold deals get a follow-up action logged within 3 days.
- **Quote velocity** — median time from inquiry to quote sent reduced by 50% versus the team's prior process.

Ownership and measurement for Post-Thin-Core outcomes are tracked in the PRD carry-forward table.

## 6. Anti-Patterns

- **Do not rebuild an enterprise CRM.** The moment setup requires a consultant or an admin
  certification, we have become the heavy tool we are replacing. Every feature must be
  usable by a lean team out of the box.
- **Do not force teams to change how they work.** Adapt to the customer's existing process;
  never impose a rigid workflow they must conform to.
- **Do not let AI act silently on the customer's behalf.** AI suggests, drafts, and flags —
  a human stays in control of anything client-facing. No auto-sent messages the user did
  not see or approve.
- **Do not bury the core flow under configuration.** Capturing an inquiry and moving it
  toward revenue must stay fast; customization is optional depth, never a prerequisite to
  start.
- **Do not build features without a named user problem.** Every capability traces to a
  target-user problem in this document; no "nice to have" additions.
- **Do not sacrifice zero-leak capture for polish.** Reliability of intake beats new
  surface area — a missed inquiry is the one failure the product exists to prevent.

## 7. Target Verticals — Expansion Roadmap

CuevikSync is architected as a single, horizontal platform. Phase 1 validates the
core platform against a single vertical. Releases after Phase 1 expand to the verticals
below — each one runs the same platform engine with different pipeline configurations,
custom field sets, and workflow templates, not different codebases.

> **Rule:** No vertical-specific code enters the platform. Every vertical must be
> served entirely through configuration — pipelines, custom fields, templates, and
> role-based access. If serving a vertical requires writing code, that is a signal to
> extend the generic platform, not to build a vertical fork.

### Phase 1 Vertical — Print & Signage

The first production deployment targets **Print & Signage** operations — businesses
providing digital printing, commercial offset printing, wide-format output, signage,
promotional products, and design services. This vertical is selected because it
concentrates every core platform challenge in one place: high inquiry volume across
multiple channels, complex per-job quoting, artwork and specification approvals, and
production scheduling — all managed today by phone, email, and spreadsheets.

Building for this vertical first produces a hardened, battle-tested core. Thin-core
capabilities from §4 are exercised first against real Print & Signage workflows,
and broader roadmap capabilities are validated in later releases.

Print & Signage workflows validated in Phase 1:

- Job quoting from unstructured inbound requests (phone, email, web form) —
  rep-driven, using structured catalog + estimation (AI extraction is deferred to a
  later Phase 1 release, not the Phase 1 thin-core release)
- Artwork and file specification capture at intake
- Print production status tracking inside the pipeline
- Substrate and finishing option configuration on quotes
- Pickup / delivery coordination as a deal attribute

| # | Vertical | Representative Workflows |
| --- | --- | --- |
| 1 | **Print Shops** *(Phase 1)* | Job quoting, artwork approval, print scheduling, substrate/ink inventory |
| 2 | **Contractors** | Estimates, site measurements, change orders, crew scheduling, client approvals |
| 3 | **Professional Services** | Client intake, proposal-to-contract, document collaboration |
| 4 | **Manufacturing** | Job tickets, BOMs, production scheduling, quality checks, packaging specs |
| 5 | **Agencies** | Campaign briefs, asset proofing, client approvals, time & resource tracking |
| 6 | **Home & Industrial Services** | Dispatching, parts tracking, service scheduling |
| 7 | **B2B Service Providers** | Contract tracking, SLA tracking, multi-site coordination |

> Representative Workflows describe each vertical's real-world process. CuevikSync
> covers the inquiry-to-order slice of each; billing, invoicing, and payments are
> handled by the customer's external finance tools (see §4), never in-product.

### What each vertical expansion requires

- Pipeline template pre-configured for the vertical's deal stages
- Custom field set covering the vertical's job/project attributes
- Quote line-item templates for common service or product types
- Onboarding checklist that gets a team live within 3 days (per Success Criteria)

No additional vertical ships until the Phase 1 core is stable and the Success Criteria in
Section 5 are met in production.

## Glossary

Canonical object names used across CuevikSync docs. Informal synonyms in parentheses are
readable but not canonical — prefer the canonical term in specs.

- **Inquiry** — an inbound request at intake/triage, before qualification (informal: "lead").
- **Opportunity** — a qualified inquiry in the pipeline, with stage, owner, next action, and
  expected value/date (informal: "deal").
- **Quote** — a commercial offer generated from an estimate; tracks version and acceptance.
- **Job / Order** — a won quote converted into execution work.
- **Account / Customer** — the relationship entity that inquiries, opportunities, and jobs
  attach to.
