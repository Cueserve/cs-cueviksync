# System Modules Brainstorming

**Owner:** Product + Architecture
**Last updated:** 2026-07-12
**Status:** Draft

This document is intentionally scoped. It is not a full module inventory.
Every proposed module must earn its place with one line:

- Problem solved
- Primary consumer
- Priority (Must-have or Later)

Draft status covers the exploration only: decisions stamped "(Product decision, DATE)" or
"Resolved" (e.g. the Phase 1 AI slice, §3/§5) are ratified and binding, not open for
re-litigation while the surrounding doc stays draft.

---

## 1. Goal Of The System

Build a configurable inquiry-to-revenue platform where any inbound request becomes a managed opportunity, estimate, quote, and executable job with minimal manual coordination. Phase 1 goal is operational reliability and speed (intake to quote to execution), not full business-suite breadth — with the capacity-scheduling (Work Orders & Scheduling) and workflow-automation layers staged just after the Phase 1 slice (§5), so Phase 1 execution ships with milestone/status tracking and manual coordination.

---

## 2. Candidate Modules

Only modules plausible for current phase are listed. Extra and duplicate concepts were merged.

| Module                                   | Problem Solved (1 line)                                                                                                                                                                                              | Primary Consumer                    | Priority       |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | -------------- |
| Inquiry Intake & Triage                  | Normalizes inbound leads from all channels into one actionable queue.                                                                                                                                                | Sales coordinator                   | Must-have      |
| Customer & Relationship Management       | Maintains a single relationship graph across leads, multi-contact business accounts, companies, clients, and partners, with configurable account-type categorization (e.g. broker, B2B, government, agency, retail). | Sales and operations                | Must-have      |
| Opportunity & Pipeline Management        | Standardizes demand intake with stages, owners, next actions, and expected value/date.                                                                                                                               | Sales manager and delivery lead     | Must-have      |
| Service Catalog                          | Defines sellable units as configurable attribute-matrix products with modifier options, plus packages and recurring offerings, for consistent estimation and quoting.                                                | Estimator and sales rep             | Must-have      |
| Estimation Engine (Configurable)         | Structured costing with formulas, components, templates, versioning, and approvals.                                                                                                                                  | Estimator                           | Must-have      |
| Quote Management                         | Turns estimates into commercial offers with versions, approvals, and acceptance tracking.                                                                                                                            | Sales rep                           | Must-have      |
| Project / Job / Order Execution          | Converts won quotes into execution units with tasks, milestones, updates, and change control.                                                                                                                        | Ops coordinator and project manager | Must-have      |
| Work Orders & Scheduling                 | Capacity-aware assignment of people, machines, and time slots.                                                                                                                                                       | Operations scheduler                | Later (staged) |
| Unified Communication Timeline           | Centralized, chronological history per account: synced emails, calls, messages, meetings, notes, file events, and linked orders.                                                                                     | Sales and support                   | Must-have      |
| Workflow Automation                      | Trigger-condition-action orchestration to eliminate manual handoffs.                                                                                                                                                 | Ops admin and sales manager         | Later (staged) |
| User, Roles, Permissions & Custom Fields | Secure access control plus no-code data model adaptation.                                                                                                                                                            | Admin                               | Must-have      |
| AI Sales Assist                          | Cold-deal flagging plus follow-up / next-action drafting — the minimal AI slice prioritized for Post-Thin-Core releases.                                                                                             | Sales rep                           | Later          |
| Dashboards & Operational Reporting       | Pipeline health, conversion, cycle time, and fulfillment bottlenecks.                                                                                                                                                | Manager and owner                   | Later          |
| Documents & Customer Portal              | Centralized artifacts plus customer-facing approvals, proofing, and order/quote tracking.                                                                                                                            | Customer and account owner          | Later          |
| Inventory & Purchasing                   | Material planning, stock control, and replenishment workflows.                                                                                                                                                       | Production and procurement          | Later          |
| AI Copilot & Document Intelligence       | Broad (advanced) summarization, extraction, enrichment, recommendations, predictive/CV, and natural language workflows — distinct from the Phase 1 AI Sales Assist slice above.                                      | Sales rep and manager               | Later          |
| Integrations & Industry Templates        | Connects email, calendar, accounting, and messaging, and provides prebuilt industry flows.                                                                                                                           | Admin and implementation lead       | Later          |

---

## 3. Why Each Module Exists

### Inquiry Intake & Triage

- Why now: Lead leakage happens before any CRM record exists, so capture must be the first controlled step.
- Why module boundary is needed: Multi-channel capture, deduplication, and routing rules differ from downstream ownership logic.
- Consequence if excluded: Inquiries stay scattered across inboxes and channels, and follow-up depends on memory.
- Scope note: Capture channels include phone, email, text, web forms, and walk-ins, plus a direct bulk/import path for lists and batch uploads. A first-response countdown (visual timer/tag on each inbound lead) surfaces intake urgency so hot inquiries do not go cold; this is a triage aid tied to the first-response success metric, distinct from contractual SLA tracking (a B2B-vertical concern, not Phase 1 intake). AI-based intent/field extraction on unstructured inbound is a demand-driven future item under AI Copilot & Document Intelligence (Later) — built only if a concrete requirement arises, not a scheduled roadmap slot (see ai-features.md §8).

### Customer & Relationship Management

- Why now: All downstream execution depends on clean, linked customer entities.
- Why module boundary is needed: Identity, deduplication, and relationship rules are shared platform primitives.
- Consequence if excluded: Duplicate records and broken ownership across the lifecycle.
- Scope note: Account-type categorization is custom-field-driven configuration, not hardcoded per-vertical enums. Credit limits and payment-terms enforcement are out of product per PRODUCT.md §4 (financials/collections). AI auto-enrichment (company profiles, logos, brand colors, decision-maker lookup) is deferred to AI Copilot & Document Intelligence (Later); LinkedIn-based enrichment must clear ToS/legal review before scoping.
- 360° profile note: The profile surfaces (a) reorder acceleration — one-click clone of a prior order/job into a new pipeline draft, sourced from the completed job's immutable spec snapshot (see Project / Job / Order Execution) so specs match exactly, generic across verticals (not "queue for print"); (b) pinned customer assets — an instance of Documents & Customer Portal (Later) rendered in the customer context, with print specifics (logos, Pantone/CMYK, templates) captured as custom fields, not a bespoke module; (c) lifetime-value rollups (revenue, order count, AOV) via Dashboards & Operational Reporting (Later; populates as order history accumulates). Payment-promptness metrics are out of product per PRODUCT.md §4 (they depend on excluded payment/collections data). Reorder acceleration is a current-phase candidate, as is CLV once order history accumulates (its Dashboards host is Later); the asset vault follows its Later host (Documents & Customer Portal).

### Opportunity & Pipeline Management

- Why now: Core promise is converting all inquiry types into managed revenue opportunities.
- Why module boundary is needed: Stage, probability, next action, and ownership need one consistent model.
- Consequence if excluded: Intake remains unstructured and follow-up quality degrades.
- Scope note: The pipeline renders as a configurable Kanban board over the opportunity stage model. A downstream production funnel is not a second set of stages inside the opportunity — it is the Project / Job / Order Execution board (a separate, linked model) shown alongside, joined by the Quote → Project win-event handoff (§4). Stage names are pipeline configuration; print production stages (prepress, press, bindery, shipping) ship as a vertical template, not platform code (mirrors the Service Catalog print-seed note). Stage transitions emit lifecycle events consumed by Workflow Automation (staged post-Phase 1, §5) — the pipeline emits these events in Phase 1, but the automated reaction (e.g. moving an opportunity to Approved auto-creating a work ticket) ships with Workflow Automation, the trigger engine, not as a pipeline feature. Probability and expected value/date are captured here as fields; weighted revenue forecasting (win-rate × expected value, rolled up monthly) is a read-side aggregation in Dashboards & Operational Reporting (Later). Closed-lost capture: a lost opportunity records a structured loss reason (configurable dropdown — e.g. price, turnaround time, competitor) as a canonical close-lost outcome, not free-text, so losses are aggregatable. Reason values are custom-field / vertical-template configuration, not hardcoded platform enums (mirrors the account-type note under Customer & Relationship Management). The downstream loss-pattern and pricing-tier-optimization analysis is a read-side rollup in Dashboards & Operational Reporting (Later); pricing-tier changes themselves live in Service Catalog / Estimation Engine, not the pipeline.

### Service Catalog

- Why now: Estimation and quoting need canonical sellable units.
- Why module boundary is needed: Catalog governance should be independent from active deals.
- Consequence if excluded: Inconsistent pricing inputs and quote quality problems.
- Scope note: Sellable units are modeled as a configurable attribute matrix — combinable
  dimensions plus modifier/add-on options — not a flat item list. Attribute dimensions,
  their values, and post-processing add-ons are catalog configuration and custom fields,
  not hardcoded per-vertical enums (mirrors the account-type note under Customer &
  Relationship Management). Print seed values (substrate weight, size, print method,
  sided-ness, finishing/bindery) ship as a vertical template, not platform code. Dynamic
  vendor/material base-cost feeds are out of catalog scope: cost inputs live in Estimation
  Engine and supplier/stock lifecycle lives in Inventory & Purchasing (Later).

### Estimation Engine (Configurable)

- Why now: Fast, accurate estimation is a key conversion lever.
- Why module boundary is needed: Cost components, formulas, and industry variation are a distinct rule domain.
- Consequence if excluded: Spreadsheet dependency and slow response times persist.
- Scope note: The costing model is a configurable multi-variable formula engine (cost components + rules), not a fixed cost sheet — mirrors the attribute-matrix approach in Service Catalog. Two generic capabilities are in-scope here: (a) quantity-tier price breaks — sliding-scale unit pricing across quantity bands (e.g. unit price at 500 vs. 5,000), for any volume-priced vertical; (b) a margin-floor guardrail — flags an estimate when computed profitability falls below a configured target percentage (a threshold rule, not AI). Vertical-specific cost variables (offset plate/setup cost, digital click fees, ink-coverage weight, material waste %) are print vertical-template seed values and custom fields, not platform formula code (mirrors the Service Catalog print-seed note). Market-cost intelligence (e.g. inflation-adjusted material costs feeding the margin advisor) is deferred to AI Copilot & Document Intelligence (Later).

### Quote Management

- Why now: Revenue capture requires formal, trackable quote lifecycle.
- Why module boundary is needed: Versioning, approvals, expiry, and acceptance need cohesive policy.
- Consequence if excluded: Commercial leakage and poor conversion tracking.
- Scope note: Acceptance tracking here means the quote outcome (sent / viewed / accepted / rejected / expired) and version lifecycle, recorded manually in phase 1 (e.g. a rep marks it accepted). Quote-interaction telemetry — automated logging of when a customer opens the web quote, view duration, and whether they downloaded the proposal — depends on the customer-facing web-quote surface in Documents & Customer Portal (Later); per the Must-have gating rule it cannot ship before its host surface exists, so it is a Later capability, not Phase 1. The engagement analytics (view counts / duration rollups) are a Dashboards & Operational Reporting read-side concern, still gated behind that Later portal telemetry source.

### Project / Job / Order Execution

- Why now: Won work must transition cleanly into delivery without re-entry.
- Why module boundary is needed: Execution artifacts (milestones, budget, progress) differ from pre-sale records.
- Consequence if excluded: Fulfillment visibility and accountability break.
- Scope note: Execution status is a configurable milestone model on this board, distinct from the opportunity stage model (Opportunity & Pipeline Management) — the two are separate, linked models joined by the Quote → Project win event (§4). The print production milestone chain (File Received → Preflight Passed → Plates Made → On Press → Bindery Finished → Ready for Pick-up) ships as a vertical template, not platform code (mirrors the Service Catalog print-seed note). Completed jobs retain an immutable spec snapshot — attribute-matrix values, custom fields (e.g. Pantone/CMYK), and assigned resources/operator captured at completion — which is the canonical source for reorder acceleration (see the Customer & Relationship Management 360° profile note); assigned operator is retained as historical metadata, not a match-guarantee input. Printable barcode job-jacket documents and shop-floor scan-based status capture are out of Phase 1 scope (see §7).

### Work Orders & Scheduling

- Why now: Staged, not Must-have — PRODUCT.md §4 defers capacity-aware scheduling to just after the Phase 1 slice. Phase 1 job execution (committed) already tracks milestones and status; assigning resources against machine capacity is the added planning layer that ships next.
- Why module boundary is needed: Capacity and assignment logic should not be hardcoded inside projects.
- Consequence if excluded: Phase 1 runs job execution with status/milestones but without capacity scheduling; assignment stays manual until this ships. No Must-have module depends on it upstream, so deferral breaks no build order.
- Scope note: The surface is a capacity-aware scheduling board — a Gantt / drag-and-drop calendar assigning jobs to specific resources (people, machines, stations) and time slots against each resource's speed/throughput. It layers on the committed Project / Job / Order Execution board (§4 dependency). Named resource types (e.g. wide-format plotter, offset press) are vertical-template seeds, not platform enums (mirrors the Service Catalog print-seed note). Rush/priority routing — one-click queue re-sequencing — ships with this module; the rush-fee pricing that authorizes it lives in Estimation Engine / Quote, and the re-sequence fires as a Workflow Automation event (also staged). Depth is gated by Open Question §6: the staged release may start at calendar + assignment only, with full machine-speed capacity modeling and Gantt as the "full capacity planning" end.

### Unified Communication Timeline

- Why now: Teams need full customer context before responding or deciding.
- Why module boundary is needed: Multi-channel ingestion and search are shared capabilities.
- Consequence if excluded: Fragmented communication and inconsistent customer experience.
- Scope note: File events surface in the timeline, but document version control lives in Documents & Customer Portal (Later). Linked orders are references to Project / Job / Order Execution records, not duplicated data. This module is also the base for a reply-capable omni-inbox: inbound SMS, email, WhatsApp Business, and web-portal chat render as one actionable conversation thread, distinct from the read-only history framing — but outbound send on non-email channels (SMS, WhatsApp) requires per-channel connectors under Integrations & Industry Templates (Later). Phase 1 stays context/history-first with reply only where an email connector already exists.

### Workflow Automation

- Why now: Staged, not Must-have — PRODUCT.md §4 defers the trigger-condition-action engine to just after the Phase 1 slice. Phase 1 modules still emit stage/lifecycle events; the centralized engine that reacts to them (auto-tasks, notifications, stage handoffs) ships next.
- Why module boundary is needed: Event-driven orchestration must be centralized for maintainability.
- Consequence if excluded: Phase 1 handoffs are manual, with cold-deal follow-up covered narrowly by AI Sales Assist drafting; operational drag is accepted until this ships. The §5 follow-through metric is met via AI-drafted follow-ups plus manual logging, so it does not block on this module.

### User, Roles, Permissions & Custom Fields

- Why now: Security and configurability are mandatory from day one for cross-industry fit.
- Why module boundary is needed: Authorization and schema-extensibility are platform concerns, not feature add-ons.
- Consequence if excluded: Unsafe access and rigid model that fails industry adaptation.
- Scope note: Thin-core ships with a concrete baseline role pack aligned to PRODUCT personas: Owner/Admin, Sales Manager, Sales Rep, and Office Administrator. Permission depth can expand later, but these baseline roles and boundaries are part of the initial contract.

### AI Sales Assist

- Why now: This is the smallest AI slice with direct operational value after thin-core reliability is validated. It is scoped as the first AI candidate release, not a thin-core dependency.
- Why module boundary is needed: AI surfaces inline in Opportunity and Timeline, but its models, confidence handling, and policy are a shared, isolated capability (mirrors the AI Copilot boundary) — not logic hardcoded into each module.
- Scope note: The candidate Post-Thin-Core slice is (a) cold-deal flagging and (b) follow-up / next-action drafting. Cold-deal flagging is on a hybrid path — a deterministic staleness rule at launch (a new tenant has no closed-deal history to train on), upgrading to a learned risk model as outcome data accumulates; labeled honestly per maturity — launch surfaces it as "auto-flagged" (a staleness rule, not yet AI), with "AI-flagged" reserved for the learned model. AI-drafted quotes and missed-call recovery stay later: quote drafting depends on RFQ/field extraction (a demand-driven future item; see ai-features.md §8) and missed-call recovery depends on a telephony connector (Integrations, Later). Human-in-the-loop is absolute: drafts and flags only, no client-facing action sent without explicit approval (PRODUCT.md §6).
- Consequence if excluded: Teams keep manual follow-up discipline in the near term and realize AI-driven response gains later.

### Dashboards & Operational Reporting

- Why now: Dashboards are a high-value read side after thin-core is producing stable transactional data. They are roadmap-prioritized, but not required to ship thin-core.
- Why module boundary is needed: Aggregation, metrics, and visualization are read-side concerns separate from the operational modules that produce the data.
- Consequence if excluded: Managers lose the pipeline and performance visibility PRODUCT.md §3–§4 commit to.

### Documents & Customer Portal

- Why now: Valuable for experience, but not required to prove core internal workflow.
- Why module boundary is needed: External identity and artifact sharing require separate governance.
- Consequence if excluded: More manual sharing, but core system still works.
- Scope note: The customer-facing proofing surface is an interactive web canvas where clients review uploaded proofs, annotate (pins + threaded comments), and record a binding "Approve for Print" e-approval as the canonical proof-acceptance outcome. The generic capabilities — proof rendering, annotation, and a binding approval event — are platform; print-specific overlays (measurement grids, color separations, Pantone/CMYK inspection) are custom-field-driven config, not platform code (mirrors the Service Catalog print-seed note). This surface also hosts AI artwork defect detection (see §9 and ai-features.md) and quote-interaction telemetry (see the Quote Management scope note) — both gated behind this Later surface. Proofing stays advisory-plus-approval: the system flags and records the client's decision but never auto-approves work on their behalf (PRODUCT.md §6).

### Inventory & Purchasing

- Why now: Deferred; material planning matters mainly for production-heavy verticals and depends on stable execution data.
- Why module boundary is needed: Stock, replenishment, and procurement follow their own lifecycle distinct from job execution.
- Consequence if excluded: Material tracking stays in external tools, but intake-to-execution still works.

### AI Copilot & Document Intelligence

- Why now: Strong differentiator, but depends on high-quality baseline data. This is the broad, advanced layer — distinct from the Phase 1 AI Sales Assist slice above.
- Why module boundary is needed: AI pipelines, confidence handling, and policy controls require isolation. The isolated AI layer is surfaced inline in each module where the user works, not in a separate "AI" destination (shared framing with ai-features.md §1).
- Consequence if excluded: More manual effort, but workflow remains viable.

### Integrations & Industry Templates

- Why now: Accelerates scale and onboarding after core workflow is stable.
- Why module boundary is needed: Connector lifecycle and template governance are independent concerns.
- Consequence if excluded: Slower onboarding and more manual setup effort.

---

## 4. Dependencies Between Modules

Only dependencies that materially affect build order are shown.

| Upstream Module                                                    | Downstream Module                  | Dependency Type       | Why It Exists                                                                                               |
| ------------------------------------------------------------------ | ---------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| Inquiry Intake & Triage                                            | Customer & Relationship Management | Capture handoff       | Triaged inquiries create or attach to trusted customer entities.                                            |
| Customer & Relationship Management                                 | Opportunity & Pipeline Management  | Entity integrity      | Opportunities must attach to trusted customer entities.                                                     |
| Service Catalog                                                    | Estimation Engine (Configurable)   | Pricing input         | Estimation needs canonical items and units.                                                                 |
| Opportunity & Pipeline Management                                  | Estimation Engine (Configurable)   | Commercial context    | Estimation starts from scoped opportunity requirements.                                                     |
| Estimation Engine (Configurable)                                   | Quote Management                   | Conversion contract   | Estimates become quote line items and totals.                                                               |
| Quote Management                                                   | Project / Job / Order Execution    | Win event handoff     | Accepted quote creates executable work.                                                                     |
| Project / Job / Order Execution                                    | Work Orders & Scheduling           | Execution planning    | Jobs require assignment and calendarized capacity.                                                          |
| Opportunity / Quote / Project modules                              | Workflow Automation                | Event stream          | Automations react to lifecycle events.                                                                      |
| Unified Communication Timeline                                     | AI Copilot & Document Intelligence | Retrieval context     | AI quality depends on complete interaction history.                                                         |
| Opportunity & Pipeline Management + Unified Communication Timeline | AI Sales Assist                    | Signal input          | Cold-deal flagging and next-action need deal activity and interaction history.                              |
| Opportunity / Quote / Project / Job execution modules              | Dashboards & Operational Reporting | Read-side data source | Reporting aggregates the transactional data these modules produce; views populate as that data accumulates. |
| User, Roles, Permissions & Custom Fields                           | All modules                        | Cross-cutting control | Access and schema rules apply platform-wide.                                                                |

Notes:

- Circular dependencies are not allowed.
- If a module depends on unstable events or undefined schema, it cannot be Must-have.
- Work Orders & Scheduling (row: downstream of Project / Job / Order Execution) and Workflow Automation (row: downstream of Opportunity / Quote / Project) are downstream-only and staged post-Phase 1 (§5). No Must-have module depends on either as upstream, so deferring them breaks no build-order constraint.

---

## 5. Must-Have Vs Later

### Must-Have (Current Phase)

- Inquiry Intake & Triage: Required to capture and normalize inbound demand before it is lost.
- Customer & Relationship Management: Required for trusted customer identity and ownership.
- Opportunity & Pipeline Management: Required to standardize intake-to-revenue workflow across industries.
- Service Catalog: Required to standardize what can be estimated and quoted.
- Estimation Engine (Configurable): Required to replace manual costing and accelerate response time.
- Quote Management: Required to control commercial conversion lifecycle.
- Project / Job / Order Execution: Required to execute accepted work.
- Unified Communication Timeline: Required for contextual coordination and customer continuity.
- User, Roles, Permissions & Custom Fields: Required for secure, configurable multi-business usage.

### Later (Deferred)

Staged (post Phase 1 slice — in scope, delivered just after the committed cut, ahead of the fully-deferred items below):

- Work Orders & Scheduling: Staged per PRODUCT.md §4. Phase 1 job execution (Must-have) tracks milestones/status; capacity-aware resource assignment and calendar/Gantt scheduling layer on next. No Must-have module depends on it upstream, so deferral breaks no build order. Scheduling depth is Open Question §6.
- Workflow Automation: Staged per PRODUCT.md §4. Phase 1 modules emit stage/lifecycle events, but the centralized trigger-condition-action engine that reacts to them ships just after the slice. The §5 follow-through metric is met via AI Sales Assist follow-up drafting plus manual logging, so it does not block on this module.

Fully deferred:

- Documents & Customer Portal: Defer external collaboration surface until internal flow is stable.
- Inventory & Purchasing: Defer material planning until execution data is stable and a production-heavy vertical needs it.
- AI Copilot & Document Intelligence: Defer the broad/advanced AI scope (extraction, enrichment, recommendations, predictive/CV, NL workflows) until core data quality is proven.
- Integrations & Industry Templates: Defer broad connectors/template packs until baseline process is hardened.

Prioritized Post-Thin-Core candidates:

- AI Sales Assist: Candidate for the first release after thin-core, with cold-deal flagging plus follow-up / next-action drafting.
- Dashboards & Operational Reporting: Candidate for the first release after thin-core, starting with pipeline health, conversion, and cycle-time views.

Decision rule:

- If removing the module does not prevent Phase 1 success metrics and PRODUCT.md does not commit it to Phase 1 scope, move it to Later.

---

## 6. Open Questions

| Question                                                                                                                                                                                                                              | Impacted Modules                         | Owner                 | Target Decision Date | Status |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | --------------------- | -------------------- | ------ |
| What is the minimum entity set in Customer & Relationship Management for launch (lead/contact/company only, or include vendors/partners too)?                                                                                         | Customer & Relationship Management       | Product Owner         | 2026-07-12           | Open   |
| Do we support project and job as separate models in phase 1, or one model with type flags?                                                                                                                                            | Project / Job / Order Execution          | Architecture Lead     | 2026-07-14           | Open   |
| What is the minimum scheduling capability for the staged Work Orders & Scheduling release (calendar + assignment only, or full capacity planning)? Module is now staged post-Phase 1 (§5).                                            | Work Orders & Scheduling                 | Ops Lead              | 2026-07-16           | Open   |
| Which dynamic custom field types are mandatory for phase 1?                                                                                                                                                                           | User, Roles, Permissions & Custom Fields | Product + Engineering | 2026-07-13           | Open   |
| Post-Thin-Core AI slice is decided (AI Sales Assist: cold-deal flagging + follow-up/next-action — resolved 2026-07-06). Remaining: which advanced (Later) AI capabilities can run as a controlled pilot without increasing core risk? | AI Copilot & Document Intelligence       | AI Lead               | 2026-07-20           | Open   |
| Which one-click industry template ships first after phase 1 stabilization?                                                                                                                                                            | Integrations & Industry Templates        | Product + GTM         | 2026-07-25           | Open   |

---

## 7. Rejected Or Deferred Modules

This table re-evaluates each rough-note item explicitly to avoid ambiguity.

| Rough Item                                               | Decision | Mapped Module                                                          | Reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------- | -------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Customer Management                                   | Keep     | Customer & Relationship Management                                     | Core identity and relationship graph.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2. Opportunity Management                                | Keep     | Opportunity & Pipeline Management                                      | Core cross-industry demand model.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 3. Estimation Engine                                     | Keep     | Estimation Engine (Configurable)                                       | Core conversion lever and configurability requirement.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 4. Service Catalog                                       | Keep     | Service Catalog                                                        | Required input model for estimation and quote.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 5. Project/Job Management                                | Keep     | Project / Job / Order Execution                                        | Required post-win execution control.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 6. Work Orders                                           | Merge    | Work Orders & Scheduling                                               | Dispatch and assignment coupled with scheduling.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 7. Scheduling                                            | Merge    | Work Orders & Scheduling                                               | Same planning domain as work orders.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 8. Resource Management                                   | Merge    | Work Orders & Scheduling                                               | Resource capacity belongs in the scheduling domain (Work Orders & Scheduling, staged post-Phase 1 per §5).                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 9. Field Service Module                                  | Defer    | Documents & Customer Portal (later extension point)                    | Vertical-specific and mobile-heavy; not Phase 1 core.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 10. AI Estimator                                         | Defer    | AI Copilot & Document Intelligence                                     | Strong differentiator, but depends on clean baseline data.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 11. Customer Portal                                      | Defer    | Documents & Customer Portal                                            | External surface deferred until internal reliability.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 12. AI Communication Hub                                 | Merge    | Unified Communication Timeline                                         | Timeline is the base; AI layer comes later.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 13. AI Copilot                                           | Defer    | AI Copilot & Document Intelligence                                     | Later-phase productivity layer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 14. Document Management                                  | Merge    | Documents & Customer Portal                                            | Keep as integrated artifact capability, not standalone now.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 15. Finance                                              | Reject   | Out of product (external finance tools)                                | Invoicing, payments, collections, expenses, and profitability are out of product per PRODUCT.md §4 ("not financials or collections"), not a Later phase. CuevikSync tracks quotes and orders; financial records live in external tools (e.g. QuickBooks). Rationale retained for future revisit only if the product's financial-processing boundary changes.                                                                                                                                                                        |
| 16. Industry Templates                                   | Defer    | Integrations & Industry Templates                                      | High value for scale, not core proof requirement.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Dynamic Custom Fields (Critical)                         | Keep     | User, Roles, Permissions & Custom Fields                               | Required for no-code industry adaptability.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Deal Tracking — Loss Cause Analysis                      | Merge    | Opportunity & Pipeline Management                                      | Structured close-lost outcome; loss-pattern analysis rolls up in Dashboards (read-side).                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Deal Tracking — Quote Interaction Tracking               | Defer    | Quote Management + Documents & Customer Portal                         | View-level telemetry depends on the Later web-quote surface.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Job Costing — Theoretical vs. Actual Variance            | Reject   | Out of product (external finance tools)                                | Estimate-vs-actual cost/margin variance is job costing, out of product per PRODUCT.md §4. Purely-operational signals (e.g. planned vs actual runtime) fold into Dashboards & Operational Reporting (Later); the financial variance itself is excluded.                                                                                                                                                                                                                                                                              |
| Job Costing — Outsourcing Cost Ledger                    | Reject   | Out of product (external finance tools)                                | Tracking external vendor/trade costs is expense/financial tracking, out of product per PRODUCT.md §4. Procurement/PO workflow (non-cost) still maps to Inventory & Purchasing (Later); the cost ledger itself is excluded.                                                                                                                                                                                                                                                                                                          |
| Order Status/Tracking — Granular Production Milestones   | Merge    | Project / Job / Order Execution                                        | Production stage chain is a print vertical-template seed on the execution board, not new module code.                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Order Status/Tracking — Automated Barcode Job Tickets    | Defer    | Documents & Customer Portal + shop-floor scan capture (Later)          | Printable job-jacket doc is a Later template; barcode/shop-floor scanning exceeds Phase 1 intake-to-execution and violates no-vertical-code.                                                                                                                                                                                                                                                                                                                                                                                        |
| Order History — Archived Specification Ledger            | Merge    | Project / Job / Order Execution + Customer & Relationship Management   | Immutable completed-job spec snapshot feeds reorder acceleration; specs are custom fields, operator is historical metadata.                                                                                                                                                                                                                                                                                                                                                                                                         |
| Automated Invoicing & Payments — Trigger-Based Invoicing | Reject   | Workflow Automation (trigger) + out of product (invoice generation)    | Auto-generating an electronic invoice on a job status change (e.g. "QC Approved" or "Shipped") is invoicing, out of product per PRODUCT.md §4 ("not financials or collections"). The status-change trigger lives in Workflow Automation (staged post-Phase 1, §5); only the invoice generation is excluded. Detail retained for future revisit only if the product's financial-processing boundary changes.                                                                                                                         |
| Automated Invoicing & Payments — Deposit Lockouts        | Reject   | Workflow Automation (stage gate) + out of product (payment processing) | Blocking a job from entering a production stage until an upfront deposit (e.g. 50%) is paid online requires online payment processing, out of product per PRODUCT.md §4. The generic stage-entry gate is a valid Workflow Automation concept, but its deposit-paid precondition depends on the excluded payment layer; "prepress queues" would also need generalizing to a configurable stage gate under the no-vertical-code rule. Detail retained for future revisit only if the product's financial-processing boundary changes. |

---

## 8. Should-Have Backlog Reconciliation (Omni-Channel / AI Automation Wishlist)

A separate "Should Have — AI Automation & Omni-Channel Scaling" note was reconciled against the modules above. **No new modules resulted.** Every item maps to an existing module or to already-deferred/excluded scope. These decisions preserve the Must-have/Later split (§5) and the PRODUCT.md §4 scope boundaries — they do not pull deferred scope forward. Items marked ⚠ contradict a locked scope decision and are recorded here so the wishlist does not silently reopen them.

| Wishlist Item                                                                                           | Decision            | Mapped Module                                              | Reason                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Centralized Omni-Inbox (SMS/email/WhatsApp/web in one thread)                                           | Merge               | Unified Communication Timeline (+ Inquiry Intake & Triage) | Merged conversation view is the timeline's job; adds a reply-capable inbox framing (captured in the Timeline scope note). Outbound on SMS/WhatsApp is a channel connector under Integrations & Industry Templates (Later).                               |
| AI Reply Co-Pilot (drafts responses from stock + lead-time context)                                     | Merge / Defer       | AI Copilot & Document Intelligence (Later)                 | Contextual reply drafting already in ai-features.md (Communication Intelligence, Wave 1). Grounding on stock (Inventory, Later) and print lead-times (vertical config). Drafts only — no auto-send, per PRODUCT.md §6 anti-pattern.                      |
| Stale Quote Reminders (24h / 3d / 7d cadence on unapproved quotes)                                      | Merge               | Workflow Automation + Quote Management                     | Automated follow-up cadence is a Workflow Automation capability (staged post-Phase 1, §5); the 24h/3d/7d schedule is per-tenant config, not platform code. In Phase 1 the AI cold-deal flagging path covers stale-deal follow-up (drafts + manual send). |
| Abandoned Cart / Draft Recovery (nudge on unfinished web order)                                         | Defer               | Documents & Customer Portal (Later)                        | Depends on the Later customer-facing web-order surface; "cart" is e-commerce framing and CuevikSync is not a webstore. The recovery nudge itself is a Workflow Automation event once the surface exists.                                                 |
| Multi-Channel Status Alerts (proof ready / on press / labels printed)                                   | Merge               | Workflow Automation                                        | Event-driven client notifications map to Workflow Automation (staged post-Phase 1, §5); the named production states are print vertical-template seeds, not platform code (no-vertical-code rule).                                                        |
| Internal Urgency Pings (alert reps/designers on proof comment or rush change)                           | Merge               | Workflow Automation                                        | Internal micro-alerts are trigger-condition-action events (Workflow Automation, staged post-Phase 1, §5). The proof-comment source depends on portal/proofing (Later).                                                                                   |
| ⚠ B2B Client Ordering Portals (password-protected repeat-order storefront over pre-negotiated catalogs) | Defer               | Documents & Customer Portal (Later)                        | Deferred per PRODUCT.md §4 ("client portals"). A repeat-order storefront over static negotiated catalogs is a new commerce surface beyond the Later portal's tracking/approval scope — needs its own scoping if pursued.                                 |
| ⚠ On-the-Go Estimator (native mobile estimating for traveling reps)                                     | Reject (this phase) | Estimation Engine (Configurable)                           | Estimation logic exists; a native mobile surface is deferred (Later) per PRODUCT.md §4 ("no native mobile surface in this release"). Responsive web use of the existing estimator is fine; a mobile app is not Phase 1.                                  |
| ⚠ Driver Pick-Up & Delivery Module (route optimization, digital signature, POD image capture)           | Defer               | Field Service Module (§7 — already Deferred)               | Phase 1 slice is "pickup/delivery as a deal attribute" (PRODUCT.md §7, Phase 1 Vertical). Route optimization + signature + proof-of-delivery capture is the deferred, mobile-heavy field-service module.                                                 |
| ⚠ Event-Driven Print Campaigns (seasonal outreach to behavior-filtered clients)                         | Reject (this phase) | Out of product scope                                       | Marketing campaign / email-blast automation is deferred per PRODUCT.md §4. The behavioral customer filters that drive it are a Dashboards & Operational Reporting segmentation concern; the marketing-campaign use itself is deferred per PRODUCT.md §4. |

---

## 9. Phase-03 Advanced Integrations Reconciliation (Web-to-Print / MIS / AI Prepress)

A separate "Phase 03: Future — Advanced Integrations & AI Prepress Front-Office" note was reconciled against the modules above. **No new modules resulted.** Every item maps to an existing module or to already-deferred/excluded scope, and every integration is a print **vertical-template connector**, not platform code (no-vertical-code rule). Items marked ⚠ contradict a locked scope decision (PRODUCT.md §4 financials boundary, or §6 AI-acts-silently anti-pattern) and are recorded here so the note does not silently reopen them.

| Phase-03 Item                                                                                                               | Decision               | Mapped Module                                                  | Reason                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Preflight Hotfolders & Enfocus Switch Sync (auto-scan PDFs for fonts/resolution/bleed, feed status back)                    | Defer                  | Integrations & Industry Templates (Later)                      | Prepress connector is a print vertical-template integration, not platform code. Preflight results surface as lifecycle events (Workflow Automation) on the execution board; the scanning itself is the external tool's job. Exceeds Phase 1 intake-to-execution.                                                                                                                                                                                                         |
| DFE (Digital Front End) Handshake — push layouts into Fiery / HP Indigo / Xerox queues                                      | Defer                  | Integrations & Industry Templates (Later)                      | Deep press-queue push is a print vertical-template connector. Named DFEs are template seeds, not platform enums (mirrors the Service Catalog print-seed note). Production-equipment integration is beyond the Phase 1 core.                                                                                                                                                                                                                                              |
| ⚠ Real-time bi-directional Ledger Sync (QuickBooks Online / Xero) — match invoices, POs, tax categories, incoming payments  | Split → Defer + Reject | Integrations & Industry Templates (Later) + out of product     | A one-way push of quote/order data to external finance tools fits the stated boundary (§7 Finance: "financials live in QuickBooks") and defers to Integrations. But the bi-directional pull of invoices, tax categories, and **incoming payments** back into the product is financials/collections, out of product per PRODUCT.md §4. Only the push-out is a candidate; the inbound ledger/payment sync stays excluded unless the financial-processing boundary changes. |
| Interactive Web Proofing Canvas (measurement grids, color separations, pins, comments, legally-binding "Approve for Print") | Merge                  | Documents & Customer Portal (Later)                            | Customer-facing proofing/approvals is already this module's job. The added fidelity folds into its scope note: annotation (pins/comments) and a binding e-approval outcome are portal sub-capabilities; color-separation/measurement overlays are print custom-field-driven config, not platform code. Still gated behind the Later portal surface.                                                                                                                      |
| AI Artwork Defect Detector (computer-vision check of uploaded artwork vs. order dimensions / resolution / borders)          | Defer                  | AI Copilot & Document Intelligence (Later)                     | CV capability already in ai-features.md as a deferred (Wave 3) vision check (§2 Proofing and Prepress, §3 Proof / Artwork surface, Wave 3). Depends on the Later portal upload surface and on order specs to check against. The generic check (dimension/resolution/margin) is platform; print thresholds are vertical config. Advisory only — warns the client, does not block or auto-reject (human-in-loop, §6 governance).                                           |
| ⚠ AI Phone Receptionist & Agent (after-hours voice agent answering callers, reading order status, dictating quotes)         | Reject (this phase)    | Inquiry Intake & Triage (phone capture only) + out of scope    | Phone is already a capture channel. An autonomous, client-facing voice agent that answers and dictates quotes after-hours contradicts PRODUCT.md §6 ("do not let AI act silently on the customer's behalf") and the deferred AI-scheduling/voice scope (PRODUCT.md §4). Order-status readback could return later as a portal/timeline read layer; the autonomous voice front-office is not Phase 1.                                                                      |
| Autonomous Quote Draft Generation (read attachments, calc raw sheets, draft quote, stage for rep validation)                | Merge                  | AI Copilot & Document Intelligence (Later) + Estimation Engine | Already covered: RFQ extraction + quote drafting (PRODUCT.md §4; demand-driven future item, not Phase 1 — see ai-features.md §8; AI Copilot). "Staged for rep validation" aligns with the human-in-loop guardrail — it is not truly autonomous. The only new detail — raw-sheet / imposition calculation — is a print vertical-template estimation seed (mirrors the Estimation Engine print-seed note), not platform formula code.                                      |

---

## Guardrails

- No standalone module for every capability; support capabilities are merged unless ownership or lifecycle clearly diverges.
- Merge first, split with evidence.
- Do not add AI modules that compensate for missing core process quality.
- Phase 1 remains intake-to-estimate-to-execution reliability, not end-to-end business suite completeness.
