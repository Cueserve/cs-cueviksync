# PRODUCT.md — Product Concept

**Owner:** Viral Parikh
**Last updated:** 2026-09-30
**Source of truth for:** what CuevikSync is, why it exists, who it serves, and the intended end-state scope of
Phase 1 — an AI-powered platform that helps Print & Signage businesses turn
every inbound inquiry into revenue and every booked job into faster delivery.

> Derived from: (none — starting point)
> Downstream: README.md, docs/PRD.md

---

## Contents

- [1. Overview](#1-overview)
- [2. Target Users](#2-target-users)
- [3. Features](#3-features)
- [3A. Decision Placeholders](#3a-decision-placeholders)
- [4. Scope (In / Out)](#4-scope-in-out)
- [5. Success Criteria](#5-success-criteria)
- [6. Anti-Patterns](#6-anti-patterns)
- [7. Roadmap](#7-roadmap)
- [Glossary](#glossary)

## 1. Overview

### Vision

Every Print & Signage business catches every inquiry and delivers every job on time,
from one workspace where anyone on the team can see where the work stands.

### Problem Statement

Small and mid-sized businesses don't lose revenue because they lack demand. They lose it
because incoming inquiries slip through the cracks. Requests come in by phone, email, web
form, and walk-in, and there's no single place to catch and track them all. Big CRM tools
exist, but they're built for large corporate sales teams — too heavy, too rigid, and too
expensive for a small team to actually use.

Winning the work is only half of it. Once an order is booked, the job is tracked on a
whiteboard, in a spreadsheet, or in someone's head, so nobody can say where it stands or
whether it will be delivered on time. A late job costs the customer's trust, however well
the sale was handled.

Closing those gaps has to be backed by software the team can trust — specifically:

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

In its Phase 1 thin-core release, CuevikSync must let a lean team:

- **Capture every inquiry** — each inbound inquiry becomes one record, and none is lost
  (§5: No dropped inquiries).
- **Keep every deal moving** — each active opportunity has an owner, a current stage, and a
  next action (§5: Pipeline visibility).
- **Deliver more jobs on time** — each booked job is tracked from order to
  delivery, with its on-time status visible (§5: On-time delivery).
- **Get there without help** — the team sets up and runs its own process with no consultant
  and no custom code (§5: Adoption).

### Description

CuevikSync is a single workspace where a business runs everything from the first customer
inquiry to a delivered job. Web-form inquiries land in a shared queue automatically, and staff
log phone, email, and walk-in inquiries into the same queue, so every inquiry becomes a
record. Each inquiry then becomes a tracked contact and opportunity that moves through a
pipeline the business shapes to match its own stages, with no code to write.

A won opportunity becomes a job, and an order that is already decided — a walk-in, a phone
order, a repeat of earlier work — can be booked straight into one. Each job carries its items,
dates, and status, so the team always knows where the work stands and whether it will be
delivered on time.

## 2. Target Users

CuevikSync is for Print & Signage businesses (§7) that win work from inbound inquiries and
deliver it as jobs. It starts with lean teams, where a lost inquiry hurts most and enterprise
CRMs fit worst; team size is the starting point, not the limit.

> In a lean team, one person often wears several of these hats — the owner may also sell,
> the salesperson may also quote. These are roles, not headcount. The thin-core baseline
> role-based access control (RBAC) roles map to these personas: Owner/Admin, Sales Manager,
> Sales Rep, Office Administrator, and Operations. The business's own customers are not
> users: they never log in, and client portals are a post-Phase 1 item (§4).

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
  won; they record order, promised, and completed dates on each job, so sales always
  knows where the work stands. Spoilage and reprints go unrecorded today, so nobody knows
  what rework costs.

## 3. Features

> Features describe the full product model, including roadmap intent. Only §4 "In scope —
> Phase 1 thin-core release" is committed. Each feature is tagged: _Thin-core_ is committed
> in full, _Thin-core (basic)_ is committed only at the depth §4 states, and _Roadmap_ is
> not committed.

- **Omnichannel inquiry capture & triage** _(Thin-core (basic))_ — a shared queue that pulls every lead (phone,
  email, text, web forms, walk-ins) into one place and auto-prioritizes urgent or
  high-intent messages, so nothing is lost and hot leads surface first.
- **Unified relationship management** _(Thin-core)_ — connected contact and company records that map
  people across the multiple organizations they belong to, with automatic duplicate
  detection that keeps data clean and reveals cross-sell connections.
- **Adaptive pipelines** _(Thin-core)_ — configurable pipelines that let one lean team run different
  processes side by side (quick-turn digital orders, case files, field estimates, batch
  orders, signage installs) without custom code.
- **Estimation & service catalog** _(Roadmap)_ — a configurable catalog of sellable units
  (attribute-matrix products with modifier options) feeding a structured costing engine
  with formulas, quantity-tier price breaks, and a margin-floor guardrail, so estimates are
  fast, consistent, and protect margin — no spreadsheets.
- **Quotation & order generation** _(Thin-core (basic))_ — create, send, and track quotes and orders, including
  AI that drafts them from unstructured client messages and prior purchase history.
- **Job execution & scheduling** _(Thin-core (basic))_ — turn won opportunities and direct
  bookings into trackable jobs with milestones
  and change control, then assign people, machines, and time slots on a capacity-aware
  schedule, so accepted work moves to delivery without re-entry or dispatch conflicts.
- **Repeat-order shortcut** _(Thin-core)_ — a "Reorder" action on an existing client's prior job books a
  new Job pre-filled from it and linked to it — another batch of the same work, in the same
  or a different quantity — so a repeat order skips the sales pipeline entirely. It is a
  direct booking (§3A): no Opportunity is created.
- **Job performance tracking** _(Thin-core)_ — a weekly summary of jobs completed, average
  turnaround, on-time %, and invoice value, plus a per-job waste/rework log (spoilage % and
  reprint flag), so the owner sees production performance and the cost of rework without
  asking around.
- **Unified communication timeline** _(Roadmap)_ — one chronological feed per contact combining
  calls, emails, texts, and status updates, so staff have full context before they reply.
- **AI sales assistant** _(Roadmap)_ — automated follow-ups, missed-call recovery, suggested next
  actions, and cold-deal flagging, so a busy team's follow-through runs itself.
- **Workflow automation** _(Roadmap)_ — a trigger-condition-action engine that fires notifications,
  task creation, and stage handoffs off lifecycle events, so routine handoffs across the
  pipeline run without manual chasing.
- **Pipeline reporting** _(Roadmap)_ — opportunity-level forecasting and manager analytics:
  which deals are moving, which are stalling, and where each rep needs coaching, so managers
  can forecast and coach.
- **Configurability & permissions** _(Thin-core)_ — industry-specific custom fields plus role-based
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
- **Spoilage % calculation method** — undecided. The Job/Order Waste/Rework log
  (§4) ships with manual entry only this release; no implementation may derive or
  infer a spoilage-percentage formula until this is resolved. **Decided by:**
  Product Owner, informed by the Phase 1 Print & Signage validation partner
  (PRD §10).

- **Direct booking with no Inquiry or Opportunity** — **resolved 2026-09-29** (PRD-050).
  Staff MAY book any order straight into a Job — whatever channel it arrived by, walk-in,
  phone, or email — attached to a Person and optionally an Organization, with no Inquiry or
  Opportunity. A direct-booked order is not an inquiry: it sits outside the zero-leak
  capture guarantee and the capture metrics in §5, and counts in every job-level metric
  (PRD-039 – PRD-043) like any other Job. PRD-001 and NFR-002 cover web-form submissions
  only, so neither changes. **Decided by:** Product Owner.

  > Original placeholder: a walk-in or phone order that becomes a Job without ever having
  > been an Inquiry contradicts the zero-leak capture guarantee as PRD-001 and NFR-002 are
  > currently written, and touches both Capture & Triage and Job Execution, neither of which
  > is built. Until resolved, no implementation may create a Job outside the
  > Inquiry-to-Opportunity chain.

When a placeholder closes, mark it **resolved YYYY-MM-DD** and cite the requirement that
now owns it. The entry stays in place, resolved — it is the record of the decision.

## 4. Scope (In / Out)

### In scope — Phase 1 thin-core release (committed)

- Omnichannel inquiry capture and triage into a single shared queue
- Unified contact/company relationship management with duplicate detection
- Adaptive, configurable pipelines (no custom code)
- Basic quotation (manual line items from a flat catalog plus free-form lines)
- Job/Order execution — convert a Won opportunity into a job, or book an
  already-decided order straight into one (§3A), with per-item lines, dates, status,
  and turnaround/on-time tracking (no milestones or change control
  this release — that stays roadmap depth, see below)
- Repeat-order shortcut — "Reorder" on an existing client's prior job books a new Job
  pre-filled from it and linked to it, as a direct booking (§3A); no Opportunity is
  created
- Job-level weekly KPI summary — jobs completed, turnaround, on-time %, and invoice
  value, one row per week (table only; no charts this release)
- Waste/rework logging — per-job spoilage % (manual entry — see §3A) and reprint
  flag
- Configurable custom fields and role-based access

> **Commitment rule:** This section is the only committed Phase 1 scope.
> Any broader capabilities described elsewhere in this document are roadmap intent
> and become commitment only when promoted into an approved PRD.

### Planned roadmap after thin-core (timing TBD)

- Configurable service catalog — attribute-matrix sellable units with modifier options
- Structured estimation engine — formulas, quantity-tier price breaks, and a margin-floor
  guardrail (formula undefined — see §3A)
- Structured quotation and order generation depth beyond thin-core
- Job/Order execution depth beyond thin-core — milestones and formal change
  control on top of the thin-core job record (§4)
- AI sales assistant: follow-up/next-action drafting + cold-deal flagging
- Unified per-contact communication timeline
- Pipeline/performance reporting — opportunity-level forecasting and manager
  analytics (the thin-core job-level weekly KPI summary in §4 is narrower than
  this and already committed)

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
- Recurring account & contract management (post-delivery account management, outside the
  inquiry-to-delivery flow)
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
- **Client branches and forks** — what one client does differently from another is served
  through that client's tenant configuration first. A need configuration cannot meet, and
  that no other business would use, is built as an isolated client slice — its own page or
  module, enabled for that client's tenant only — rather than generalized for the vertical.
  Never as a client branch inside shared code, and never as a fork (see the rule in §7).

## 5. Success Criteria

### Thin-Core Release Outcomes (Committed)

- **No dropped inquiries** — >= 99% of inquiries on connected digital channels (email, web form) are captured as records within 2 min; for manual channels, >= 95% of phone and walk-in inquiries are logged the same business day (100% by next business day) and >= 95% of manually logged email inquiries are captured within 4 business hours. A missed inquiry is the one failure the product exists to prevent.
- **Pipeline visibility** — 100% of active deals show a current stage and a next action; zero deals with no owner or next step.
- **On-time delivery** — the team's on-time % in the job-level weekly KPI summary (§4) is
  higher in weeks 9–12 of live use than in weeks 1–4, measured from system records.
- **Adoption** — a team of 10 users or fewer — the size the first release is proven at — is fully onboarded and running its live pipeline within 3 days of signup, with no custom development.

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
- **A new client onboards without code** — pipelines, custom fields, templates, and roles
  are sufficient to configure a Print & Signage business. A client slice (§4) adds to a
  working setup; it is never a prerequisite for going live.

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

## 7. Roadmap

CuevikSync is built for one vertical: **Print & Signage** — print shops and
printing-related businesses whose work runs from an inbound inquiry to a tracked job. Its
roadmap adds capability for that vertical as needs arise (§4); it does not expand into
other verticals.

A business outside Print & Signage is served by a separate Cuevik product, never by
generalizing this one. Such a product may start from a copy of this codebase's
foundation — auth, tenancy, UI shell — and then owns its code outright.

> **Rule:** Print & Signage behaviour is the product and belongs in code. What one client
> does differently from another — stage names, fields, catalog, timezone — is that
> client's tenant configuration first. A client-only need that configuration cannot meet
> is built as an isolated client slice, enabled for that client's tenant only. Never a
> client branch inside shared code, and never a fork of this codebase (§4).

### Print & Signage

The first production deployment targets **Print & Signage** operations — businesses
providing digital printing, commercial offset printing, wide-format output, signage,
promotional products, and design services. This vertical is selected because it
concentrates every core platform challenge in one place: high inquiry volume across
multiple channels, complex per-job quoting, artwork and specification approvals, and
production scheduling — all managed today by phone, email, and spreadsheets.

Print & Signage businesses do not all work the same way: a commercial offset printer, a
wide-format signage shop, and a promotional-products reseller each run a different process.
Configurable pipelines, custom fields, templates, and permissions let each run its own
process on the same system — which is why the rule above puts client differences in tenant
configuration, not code.

Thin-core capabilities from §4 are exercised first against real Print & Signage
workflows, and broader roadmap capabilities are validated in later releases.

Print & Signage workflows validated in Phase 1:

- Job quoting from unstructured inbound requests (phone, email, web form) —
  rep-driven, using structured catalog + estimation (AI extraction is deferred to a
  later Phase 1 release, not the Phase 1 thin-core release)
- Artwork and file specification capture at intake
- Print production status tracking inside the pipeline
- Substrate and finishing option configuration on quotes
- Pickup / delivery coordination as a deal attribute

## Glossary

Canonical object names used across CuevikSync docs. Informal synonyms in parentheses are
readable but not canonical — prefer the canonical term in specs.

- **Inquiry** — an inbound request at intake/triage, before qualification (informal: "lead").
- **Opportunity** — a qualified inquiry in the pipeline, with stage, owner, next action, and
  expected value/date (informal: "deal").
- **Quote** — a commercial offer generated from an estimate; tracks version and acceptance.
- **Job / Order** — execution work, created from a won Opportunity or booked directly (§3A).
- **Person** — an individual contact record, and the relationship entity an inquiry,
  opportunity, or job attaches to. An Organization alongside it is optional (informal:
  "contact").
- **Organization** — a company or institution record. Optional on any Person, and the
  entity a Person may hold a role and duties within (informal: "company", "account").
- **Contact** — the user-interface umbrella term for Persons and Organizations shown
  together. Never a synonym for Person alone in a data model or in code.
