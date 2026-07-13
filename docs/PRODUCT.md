# PRODUCT.md — Product Concept

**Owner:** Product Owner
**Last updated:** 2026-07-12
**Source of truth for:** what CuevikSync is and why it exists — an AI-powered platform to accelerate inquiry-to-revenue workflows for small and mid-sized businesses, with MVP validated against Print & Signage operations.

> Derived from: (none — starting point)
> Downstream: PRD.md, README.md, BACKLOG.md

## Document References

| # | Document | Role |
| --- | --- | --- |
| 1 | PRODUCT.md | What we are building and why |
| 2 | PRD.md | Testable requirements |
| 3 | ARCHITECTURE.md | System structure & design decisions |
| 4 | TECH-STACK.md | Approved technologies & usage rules |
| 5 | AI-TOOL-GUIDE.md | Rules & constraints for AI tools |
| 6 | README.md | Setup, env config, how to run |
| 7 | BACKLOG.md | Epics/stories manifest |

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

## 2. Target Users

> In a lean team, one person often wears several of these hats — the owner may
> also sell, the salesperson may also quote. These are roles, not headcount.

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

## 4. Scope (In / Out)

### In scope — Phase 1 (committed)

- Omnichannel inquiry capture and triage into a single shared queue
- Unified contact/company relationship management with duplicate detection
- Adaptive, configurable pipelines (no custom code)
- Configurable service catalog — attribute-matrix sellable units with modifier options
- Structured estimation engine — formulas, quantity-tier price breaks, and a margin-floor guardrail
- Structured quotation and order generation
- Project/job/order execution — won quotes converted to trackable work with milestones and change control
- AI sales assistant: follow-up/next-action drafting + cold-deal flagging
- Unified per-contact communication timeline
- Pipeline/performance reporting
- Configurable custom fields and role-based access

> **Phase-1 scope boundary:** Phase 1 ships configuration only — pipelines, custom
> fields, templates, and quotation — and is validated against a single vertical
> (Print & Signage; see §7). Any workflow that requires custom code is out of Phase 1 scope.

### In scope — staged (post Phase-1 slice)

- Work Orders & Scheduling — capacity-aware resource assignment and calendar scheduling on
  top of job execution (depth pending the scheduling-scope decision: calendar + assignment
  vs. full capacity planning)
- Workflow Automation — trigger-condition-action orchestration of lifecycle events;
  Phase-1 emits stage/lifecycle events, but automated reactions ship here
- Missed-call recovery (requires telephony connector)
- AI-drafted quotes from unstructured inbound (demand-driven; built on concrete requirement)

### In scope — deferred (Later / market-driven)

Planned for later releases, demand-driven — not committed to a Phase:

- AI scheduling / appointment booking
- Mobile field-capture app (voice dictation) — no native mobile surface in this release
- Recurring account & contract management (post-sale account management, outside the
  inquiry-to-revenue funnel)
- White-label branding / client portals
- Marketing campaign / email-blast automation

### Out of scope

Not part of the product:

- Accounting / invoicing / payment processing — CuevikSync tracks quotes and orders, not
  financials or collections

## 5. Success Criteria

- **No dropped inquiries** — ≥99% of inquiries on connected digital channels (email, web form) captured as a record within 2 min; phone and walk-in logged same business day. A missed inquiry is the one failure the product exists to prevent.
- **Faster response** — median time from inquiry received to first response drops below 1
  hour for teams using the AI assistant.
- **Pipeline visibility** — 100% of active deals show a current stage and a next action;
  zero deals with no owner or next step.
- **Follow-through** — at least 90% of flagged cold deals get a follow-up action logged
  within 3 days.
- **Adoption** — a lean team (10 users or fewer) is fully onboarded and running its live
  pipeline within 3 days of signup, with no custom development.
- **Quote velocity** — median time from inquiry to quote sent reduced by 50% versus the
  team's prior process.

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
core platform against a single vertical. Subsequent releases expand to the verticals
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

Building for this vertical first produces a hardened, battle-tested core. Every
capability listed under §4 Phase 1 (committed) is exercised against real Print & Signage
workflows before any horizontal expansion begins.

Print & Signage workflows validated in Phase 1:

- Job quoting from unstructured inbound requests (phone, email, web form) —
  rep-driven, using structured catalog + estimation (AI extraction is staged, not Phase 1)
- Artwork and file specification capture at intake
- Print production status tracking inside the pipeline
- Substrate and finishing option configuration on quotes
- Pickup / delivery coordination as a deal attribute

| # | Vertical | Representative Workflows |
|---|---|---|
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

No vertical ships until the Phase 1 core is stable and the Success Criteria in
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
