# PRD.md — Product Requirements Document

**Owner:** Product Owner
**Last updated:** 2026-07-13
**Source of truth for:** the testable requirements for the CuevikSync thin-core release — inquiry capture, configurable pipeline, and basic quoting.

> Derived from: docs/PRODUCT.md
> Downstream: docs/ARCHITECTURE.md, docs/TECH-STACK.md, README.md, docs/BACKLOG.md

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

## Contents

1. [Overview](#1-overview)
2. [Target Users](#2-target-users)
3. [Problem Statements](#3-problem-statements)
4. [Features / Capabilities](#4-features--capabilities)
5. [User Stories](#5-user-stories)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Acceptance Criteria](#8-acceptance-criteria)
9. [Out of Scope (This Release)](#9-out-of-scope-this-release)
10. [Dependencies & Assumptions](#10-dependencies--assumptions)
11. [Constraints (Non-Architectural)](#11-constraints-non-architectural)
12. [Risks & Edge Cases](#12-risks--edge-cases)

---

## 1. Overview

CuevikSync is a single workspace where a lean small and mid-sized business (SMB)
runs its inquiry-to-revenue process: every inbound inquiry captured in one queue,
moved through a pipeline the team configures without code, and turned into a quote —
without the weight, cost, or consultant setup of an enterprise Customer Relationship
Management (CRM) system.

This PRD specifies the **thin-core release**: the smallest slice that proves the
product's central promise — zero-leak capture — and a configurable path from an
inquiry to a tracked quote. It is validated against Print & Signage operations (see
PRODUCT.md §7). Estimation depth, job execution, the AI sales assistant, workflow
automation, and reporting are deferred to later PRDs and listed in §9.

Core goals for this release:

- Capture every inbound inquiry so none is lost.
- Let a team shape its own pipeline with no code.
- Turn a captured inquiry into a tracked, sendable quote.
- Keep sensitive data scoped through role-based access.

## 2. Target Users

Roles, not headcount — in a lean team one person often wears several hats. This
release serves the roles that touch the capture-to-quote loop.

- **Office administrator** — first to catch inbound inquiries; needs every lead
  logged the instant it arrives (web-form leads captured automatically; email,
  phone, and walk-in logged in seconds) so nothing is lost.
- **Sales rep** — works leads daily; needs one queue and one pipeline to triage,
  qualify, own, and quote each opportunity instead of email and sticky notes.
- **Business owner** — closes deals and needs a single current view of the pipeline
  to see what is in flight and where revenue is stalling.
- **Sales manager** — needs each active opportunity to carry a stage, an owner, and a
  next action to coach the team. (Reporting and forecasting are deferred; this
  release supplies the underlying per-deal visibility.)

## 3. Problem Statements

Every feature in §4 traces to one of these problems.

- **PS-1 — Inquiries slip through the cracks.** Requests arrive by phone, email, web
  form, and walk-in with no single place to catch them, so leads are lost. Reflects
  the office administrator and business-owner need for zero-leak capture.
- **PS-2 — No shared, current pipeline view.** Deal status lives in people's heads,
  email, and spreadsheets, so deals stall and no one owns the next step. Reflects the
  sales rep, sales manager, and owner need.
- **PS-3 — Existing CRMs are too heavy.** They assume a large corporate sales org,
  need consultants or admin certification, and impose a rigid process, so a lean team
  cannot adopt them. Reflects every user's need for a tool usable out of the box.
- **PS-4 — Quoting is slow and ad hoc.** Quotes are assembled by hand in
  spreadsheets, so they go out late and inconsistently. This release addresses basic
  quote creation and tracking; speed gains from the estimation engine are a later PRD.
- **PS-5 — Sensitive data is over-exposed.** Without role-based access everyone sees
  everything; even a lean team needs to scope who can see and edit what.

## 4. Features / Capabilities

- **Omnichannel inquiry capture & triage** — a shared queue that auto-creates a
  record from every web-form submission and lets staff log email, phone, and walk-in
  inquiries with a channel tag and priority, so no inquiry is lost and the team
  triages everything in one place. (PS-1)
- **Contact & company management with duplicate detection** — connected contact and
  company records with a duplicate warning at create time, so relationship data stays
  clean. (PS-2)
- **Adaptive pipelines** — team-configurable stages, with each opportunity carrying a
  stage, owner, and next action through to a terminal Won/Lost outcome — no code.
  (PS-2, PS-3)
- **Basic quotation** — create a line-item quote from a flat service catalog or
  free-form lines, produce a sendable document, and track its status from draft to
  accepted or declined, so demand converts to a tracked commercial offer. (PS-4)
- **Configurable custom fields** — add fields to records to match the team's process,
  without code. (PS-3)
- **Role-based access control (RBAC)** — role-scoped visibility and edit rights so
  sensitive data stays hidden from users who should not see it. (PS-5)

## 5. User Stories

Every feature in §4 maps to at least one story below.

- As an office administrator, I want web-form submissions to appear as inquiry
  records automatically so that no online lead is ever missed.
- As an office administrator, I want to log a phone or walk-in inquiry with its
  channel and priority in seconds so that it enters the same queue as everything else.
- As a sales rep, I want one shared queue of open inquiries so that I can see and
  triage every lead in one place.
- As a sales rep, I want the system to warn me when a contact or company looks like a
  duplicate so that I do not create fragmented records.
- As a sales rep, I want to qualify an inquiry into an opportunity linked to a contact
  and company so that a captured lead enters the pipeline with context.
- As a business owner, I want to configure my own pipeline stages so that the system
  matches how we actually work, without code.
- As a sales rep, I want every opportunity to have a stage, an owner, and a next
  action so that no deal stalls without someone responsible for it.
- As a sales manager, I want to see every active opportunity's stage and owner so that
  I know what is moving and what is stuck.
- As a sales rep, I want to build a quote from catalog items or free-form lines and
  send it so that a captured inquiry becomes a tracked offer.
- As a sales rep, I want to see whether a sent quote is accepted or declined so that I
  know which deals to advance.
- As a business owner, I want to add custom fields to records so that we track the
  attributes our work needs.
- As a business owner, I want to control which roles can see and edit which data so
  that sensitive information stays scoped.

## 6. Functional Requirements

Requirements are grouped by capability (mirroring §4). Each carries a unique ID and a
MoSCoW priority (Must / Should / Could).

### Omnichannel Inquiry Capture & Triage

- **PRD-001** — ***Automatic web-form capture*** *(Must)* — The system MUST create an
  inquiry record automatically from each web-form submission received at the
  configured intake endpoint. Capture happens without any staff action, so no online
  lead depends on someone remembering to log it. This is the release's core proof of
  zero-leak capture.
- **PRD-002** — ***Manual inquiry logging*** *(Must)* — The system MUST let a user
  manually create an inquiry record for an email, phone, or walk-in contact. Each
  manual entry carries a channel tag and a priority of High or Normal. This keeps
  non-digital channels in the same queue as web-form leads.
- **PRD-003** — ***Single shared queue*** *(Must)* — The system MUST present all open
  inquiries in one shared queue that any authorized user can view. A newly captured
  inquiry — web or manual — appears there without a rebuild or deploy. The queue is
  the single place the team triages incoming demand.
- **PRD-004** — ***Inquiry provenance*** *(Must)* — The system MUST record, for every
  inquiry, its source channel, capture timestamp, and original message content where
  provided. This preserves the context a rep needs before responding. No inquiry is
  stored without its origin.
- **PRD-005** — ***Priority control*** *(Must)* — The system MUST let a user set and
  change an inquiry's priority between High and Normal. Priority is a manual signal
  this release, not an automated judgment. It lets staff mark urgent leads for faster
  handling.
- **PRD-006** — ***Queue ordering*** *(Should)* — The system SHOULD order or filter
  the shared queue so that High-priority and unassigned inquiries surface first. This
  helps the team act on the most urgent, unowned leads before older or already-handled
  ones. Ordering is a convenience, never a precondition to capture.
- **PRD-007** — ***Qualify into opportunity*** *(Must)* — The system MUST let a user
  qualify an inquiry into an opportunity, attaching it to a contact and a company.
  Qualification is the handoff from triage into the pipeline. The resulting
  opportunity links back to the originating inquiry for traceability.

### Contact & Company Management

- **PRD-008** — ***Contact and company records*** *(Must)* — The system MUST let a
  user create, view, edit, and delete contact and company records. Deleting a record
  that has linked opportunities MUST warn before proceeding. These records are the
  relationship backbone every inquiry and opportunity attaches to.
- **PRD-009** — ***Multi-company contacts*** *(Should)* — The system SHOULD let a
  contact be associated with more than one company. A single person often acts across
  several organizations, and each association SHOULD be visible from the contact
  record. This reveals cross-sell connections without duplicating the person.
- **PRD-010** — ***Duplicate detection*** *(Must)* — The system MUST detect a potential
  duplicate when a user creates a contact or company whose name or email matches an
  existing record, and warn before saving. The warning lists the suspected match and
  lets the user proceed or cancel. It keeps relationship data clean without blocking
  legitimate entries.

### Adaptive Pipelines

- **PRD-011** — ***Configurable stages*** *(Must)* — The system MUST let an
  administrator define, rename, reorder, and remove pipeline stages without code.
  Changes MUST take effect without a deploy. This lets each team shape the pipeline to
  its own process.
- **PRD-012** — ***Mandatory opportunity fields*** *(Must)* — The system MUST require
  every opportunity to have a current stage, an owner, and a next action. Saving
  without all three MUST be blocked with a validation message. This guarantees no deal
  sits in the pipeline without someone responsible and a defined next step.
- **PRD-013** — ***Stage movement with audit*** *(Must)* — The system MUST let a user
  move an opportunity between stages, recording the acting user and timestamp. The
  movement history MUST be viewable on the opportunity. This makes pipeline changes
  traceable and accountable.
- **PRD-014** — ***Terminal outcomes*** *(Must)* — The system MUST support a terminal
  outcome stage that marks an opportunity Won or Lost. Terminal opportunities MUST
  drop out of the active pipeline view. This keeps the working pipeline focused on
  live deals.
- **PRD-015** — ***Parallel pipelines*** *(Should)* — The system SHOULD support more
  than one configurable pipeline so a lean team can run different processes side by
  side. Opportunities in each pipeline SHOULD remain independent. This serves teams
  whose work splits into distinct flows without custom code.

### Basic Quotation

- **PRD-016** — ***Quote creation*** *(Must)* — The system MUST let a user create a
  quote associated with an opportunity, composed of line items. A new quote starts in
  draft. This turns a qualified opportunity into a tracked commercial offer.
- **PRD-017** — ***Line-item entry*** *(Must)* — The system MUST let a line item be
  selected from a flat service catalog (named item plus unit price) or entered
  free-form. Each line MUST have an editable quantity and unit price. This covers both
  catalog-based and one-off pricing without an estimation engine.
- **PRD-018** — ***Quote total*** *(Must)* — The system MUST compute a quote total as
  the sum of (quantity × unit price) across its line items. The total MUST update
  whenever a line changes. Automatic calculation removes manual math errors from the
  offer.
- **PRD-019** — ***Quote status lifecycle*** *(Must)* — The system MUST track a quote's
  status through draft → sent → accepted or declined. Invalid transitions MUST be
  rejected. This tells the team which offers are live and which are closed.
- **PRD-020** — ***Quote issuance*** *(Must)* — The system MUST let a user produce a
  printable or shareable quote document, mark the quote as sent, and record the send
  timestamp. Sending is an explicit human action; nothing goes to a customer
  automatically. This preserves human control over every customer-facing artifact.
- **PRD-021** — ***Catalog maintenance*** *(Should)* — The system SHOULD let an
  administrator add, edit, and deactivate flat catalog items with a unit price. A
  deactivated item SHOULD no longer appear in the line-item picker. This keeps the
  sellable-item list current without altering past quotes.

### Configurable Custom Fields

- **PRD-022** — ***Custom fields*** *(Must)* — The system MUST let an administrator add
  configurable custom fields to inquiry, contact, company, and opportunity records
  without code. Added fields MUST appear on the record form and persist their values.
  This lets a team capture the attributes its work needs without a code change.

### Role-Based Access Control

- **PRD-023** — ***Authentication*** *(Must)* — The system MUST authenticate a user
  before granting access to any record. Unauthenticated requests MUST be denied.
  Access control has no meaning without a verified identity.
- **PRD-024** — ***Distinct roles*** *(Must)* — The system MUST support at least two
  roles with distinct permission sets, such as administrator and member. Assigning a
  role MUST change what the user can see and do. Roles are the unit that scopes access.
- **PRD-025** — ***Server-side enforcement*** *(Must)* — The system MUST enforce
  role-based visibility and edit rights on records server-side, not by hiding data in
  the client alone. A user whose role lacks access MUST be denied even if the client
  is bypassed. This prevents access rules from being trivially circumvented.
- **PRD-026** — ***Admin-only configuration*** *(Must)* — The system MUST restrict
  pipeline, custom-field, and catalog configuration to an administrator role.
  Non-administrators MUST NOT reach those configuration screens or endpoints. This
  keeps structural changes in trusted hands.

## 7. Non-Functional Requirements

Measurable quality attributes. Each is a requirement, not a solution. Percentile
latency is written `p95` / `p99`.

- **NFR-001 — Capture latency.** A web-form submission MUST appear as an inquiry
  record within 2 minutes of submission (p99).
- **NFR-002 — Capture reliability.** At least 99% of web-form submissions received at
  the intake endpoint MUST be persisted as inquiry records, with no silent drops.
- **NFR-003 — Capture availability.** The web-form intake endpoint MUST maintain
  ≥ 99.5% monthly uptime, because a missed inquiry is the product's defining failure.
- **NFR-004 — Onboarding time.** A team of 10 users or fewer MUST be able to configure
  a pipeline, custom fields, roles, and a flat catalog and begin logging live
  inquiries within 3 days of signup, with no custom development.
- **NFR-005 — Interactive performance.** Queue, pipeline, and record views MUST return
  in p95 < 2 s and p99 < 5 s with 10 concurrent users.
- **NFR-006 — Scale.** The system MUST support at least 10 concurrent users and 50,000
  inquiry records per tenant without breaching the NFR-005 latency targets.
- **NFR-007 — Credential security.** User passwords MUST be stored using a memory-hard
  hash (Argon2id, or bcrypt with work factor ≥ 12); no plaintext credentials are
  stored anywhere.
- **NFR-008 — Access enforcement.** RBAC checks MUST be enforced server-side on every
  record read and write.
- **NFR-009 — Transport security.** All traffic MUST be served over Transport Layer
  Security (TLS) 1.2 or higher.
- **NFR-010 — Durability.** Committed inquiry, contact, opportunity, and quote records
  MUST be recoverable with a Recovery Point Objective (RPO) of ≤ 24 hours.
- **NFR-011 — Auditability.** Stage changes and quote status changes MUST record the
  acting user and a timestamp.
- **NFR-012 — Accessibility.** Primary capture and pipeline screens SHOULD meet Web
  Content Accessibility Guidelines (WCAG) 2.1 level AA.

## 8. Acceptance Criteria

Testable conditions that define "done" for each requirement.

> **Success-criteria scope.** This release binds acceptance to PRODUCT.md §5 criteria
> it can prove: zero-leak web-form capture (NFR-001, NFR-002), pipeline visibility
> (PRD-012), and 3-day onboarding (NFR-004). The three criteria that depend on
> deferred features — median first response < 1 hour (AI assistant), quote velocity
> −50% (estimation engine), and 90% cold-deal follow-through (AI flagging) — are
> **next-release targets** and are not part of this release's definition of done.

| Requirement ID | Acceptance criteria |
| --- | --- |
| PRD-001 | Submitting the embedded web form creates a matching inquiry in the queue within 2 minutes with channel = "web form"; the raw submission content is retained. |
| PRD-002 | A user can create an inquiry choosing channel ∈ {email, phone, walk-in} and priority ∈ {High, Normal}; the saved record shows both. |
| PRD-003 | A newly captured inquiry (web or manual) appears in one shared queue for an authorized user without any deploy or rebuild. |
| PRD-004 | Every inquiry record displays its source channel, capture timestamp, and original message content when it was supplied. |
| PRD-005 | A user can change an inquiry's priority between High and Normal and the change persists on reload. |
| PRD-006 | With mixed inquiries present, the default queue order or filter places High-priority and unassigned inquiries above Normal or assigned ones. |
| PRD-007 | A user can convert an inquiry into an opportunity and attach an existing or new contact and company; the opportunity links back to the originating inquiry. |
| PRD-008 | A user can create, view, edit, and delete a contact and a company; deleting a record that has linked opportunities warns before proceeding. |
| PRD-009 | A contact can be linked to two or more companies and each association is visible from the contact record. |
| PRD-010 | Creating a contact or company whose name or email matches an existing record shows a duplicate warning listing the suspected match; the user can proceed or cancel. |
| PRD-011 | An administrator can add, rename, reorder, and remove pipeline stages and the change takes effect without a code deploy. |
| PRD-012 | An opportunity cannot be saved without a stage, an owner, and a next action; missing any one blocks save with a validation message. |
| PRD-013 | Moving an opportunity to another stage records the acting user and timestamp, viewable in the opportunity's history. |
| PRD-014 | An opportunity can be set to a terminal Won or Lost stage; terminal opportunities no longer appear in the active pipeline view. |
| PRD-015 | An administrator can create a second pipeline with its own stages; opportunities in each pipeline are independent. |
| PRD-016 | A user can create a quote from an opportunity; the quote references that opportunity and starts in draft. |
| PRD-017 | A quote line can be added from a catalog item (name and unit price pre-filled) or entered free-form; each line has an editable quantity and unit price. |
| PRD-018 | The displayed quote total equals the sum of (quantity × unit price) across lines and updates when any line changes. |
| PRD-019 | A quote status can move draft → sent → accepted or declined; an invalid transition (for example accepted → draft) is rejected. |
| PRD-020 | A user can generate a printable or shareable quote document and mark the quote sent; the send timestamp is recorded and shown. |
| PRD-021 | An administrator can add, edit, and deactivate catalog items with a unit price; a deactivated item no longer appears in the line-item picker. |
| PRD-022 | An administrator can add a custom field to a record type without a code deploy; the field appears on that record's form and its value persists. |
| PRD-023 | An unauthenticated request for any record is denied and redirected to sign-in; no record data is returned. |
| PRD-024 | At least two roles exist with different permission sets, and assigning a role changes what the user can see and do. |
| PRD-025 | A user whose role lacks read access to a record cannot retrieve it through the UI or a direct record request; the denial is enforced server-side, not merely hidden in the UI. |
| PRD-026 | A non-administrator cannot open or call the pipeline, custom-field, or catalog configuration screens or endpoints. |
| NFR-001 | Under test, 99% of web-form submissions surface as records within 2 minutes (measured at p99). |
| NFR-002 | In a batch of submissions to the intake endpoint, ≥ 99% are persisted as records and zero are dropped without an error being recorded. |
| NFR-003 | Monitored over a calendar month, the intake endpoint reports ≥ 99.5% uptime. |
| NFR-004 | A fresh 10-user team completes pipeline, field, role, and catalog setup and logs a live inquiry within 3 days, using configuration only. |
| NFR-005 | Load test with 10 concurrent users shows queue, pipeline, and record views returning in p95 < 2 s and p99 < 5 s. |
| NFR-006 | With 50,000 inquiry records and 10 concurrent users, NFR-005 latency targets still hold. |
| NFR-007 | Stored password values are non-reversible memory-hard hashes; no plaintext password exists in the database or logs. |
| NFR-008 | A record request from a role without permission is denied by the server even when the client is bypassed. |
| NFR-009 | All endpoints reject plaintext HTTP and serve only over TLS 1.2 or higher. |
| NFR-010 | A restore from the most recent backup loses no more than 24 hours of committed records. |
| NFR-011 | Each stage change and quote status change shows the acting user and timestamp in the record history. |
| NFR-012 | The capture and pipeline screens pass an automated WCAG 2.1 AA check with no critical violations. |

## 9. Out of Scope (This Release)

Explicit exclusions for the thin-core release. Each moves to a later PRD unless noted
as permanently out.

- **Automated email and phone ingestion** — email-to-record parsing and telephony
  capture; only the web form auto-ingests this release, and email, phone, and
  walk-in are logged manually.
- **AI intent auto-prioritization** — automatic ranking of urgent or high-intent
  messages; priority is set manually this release.
- **Attribute-matrix product catalog and modifier options** — the release ships a
  flat catalog (item plus unit price) only.
- **Estimation engine** — costing formulas, quantity-tier price breaks, and the
  margin-floor guardrail; quotes are manual line items this release.
- **Job / Order execution** — converting a Won quote into a trackable job with
  milestones and change control; the pipeline stops at a terminal Won/Lost stage.
- **Work orders and scheduling** — capacity-aware resource assignment and calendar
  scheduling.
- **AI sales assistant** — follow-up drafting, missed-call recovery, next-action
  suggestions, and cold-deal flagging.
- **Workflow automation** — the trigger-condition-action engine and automated stage
  handoffs.
- **Unified communication timeline** — the chronological cross-channel feed per
  contact; the inquiry record still stores its origin channel and message.
- **Pipeline and performance reporting** — dashboards, forecasting, and manager
  analytics.
- **Accounting, invoicing, and payment processing** — permanently out per PRODUCT.md;
  handled by the customer's external finance tools.
- **Mobile field-capture app, recurring account/contract management, white-label
  branding / client portals, and marketing automation** — PRODUCT.md deferred items,
  not part of this release.

## 10. Dependencies & Assumptions

- **Web-form intake endpoint** — auto-capture depends on a hosted form or webhook
  receiver embedded in the customer's site; if it is not embedded, web-form
  auto-capture does not occur and all channels fall back to manual logging.
- **Outbound email service** — sending a quote depends on a configured email or
  transactional-mail provider; without it a quote can be produced but not delivered
  from within the product.
- **User identity / authentication** — accounts are provisioned and an authentication
  mechanism exists before RBAC can apply (see PRD-023).
- **Assumption: SMB scale** — teams are 10 users or fewer; sizing, performance
  (NFR-005/006), and onboarding (NFR-004) targets assume this.
- **Assumption: external finance tools** — customers handle invoicing and payments
  outside CuevikSync; the product never stores payment data.
- **Assumption: Print & Signage validation partner** — a real Print & Signage
  operation provides workflows and data to validate acceptance for this release.
- **Managed hosting** — the availability (NFR-003) and durability (NFR-010) targets
  assume managed infrastructure; specific hosting is decided in ARCHITECTURE.md /
  TECH-STACK.md.

## 11. Constraints (Non-Architectural)

- **No custom code for setup** — configuration (pipelines, fields, catalog, roles)
  MUST cover the team's process; any need for code is out of scope, per PRODUCT.md.
- **Human-in-the-loop for customer-facing output** — every customer-facing artifact
  (a quote) MUST be explicitly sent by a person; nothing auto-sends, even absent AI.
- **3-day onboarding budget** — features MUST be usable without a consultant or admin
  certification; this caps configuration complexity.
- **Data-protection compliance** — contact data is personal data; storage, access,
  and deletion MUST comply with applicable data-protection law (for example the
  General Data Protection Regulation (GDPR) or local equivalents).
- **No financial data** — the product MUST NOT store payment instruments or process
  payments.
- **Single validation vertical** — this release is validated only against Print &
  Signage, and no vertical-specific code may enter the platform.

## 12. Risks & Edge Cases

| Risk / edge case | Impact | Handling |
| --- | --- | --- |
| Duplicate or spam web-form submissions | Queue floods with junk and real leads are buried | Rate-limit and spam-filter the intake endpoint; dedup on submission; allow manual dismiss/merge |
| Web-form endpoint downtime | Inbound inquiries lost during an outage — the one failure the product exists to prevent | NFR-003 uptime target; webhook retry/queue on the receiver; alert on intake failures |
| Malformed or partial web-form payload | Record created with missing fields, or submission rejected and lost | Accept and flag incomplete records for manual completion; never reject and drop a lead |
| Manual channels not logged | Email, phone, and walk-in still depend on staff discipline, so leaks persist | Fast manual-log UI; residual risk flagged explicitly; automated ingestion moves to the next PRD |
| Duplicate-detection false positive/negative | Records wrongly merged or left fragmented | Warn, do not block, on create (PRD-010); provide manual merge; tune match rules |
| Free-form quote line priced wrong | An incorrect total reaches the customer | Total auto-computed (PRD-018); explicit human send step (PRD-020) forces review |
| RBAC misconfiguration | Sensitive data exposed, or legitimate work blocked | Default-deny for non-admin roles; server-side enforcement (NFR-008); admin-only config (PRD-026) |
| Over-configuration at setup | An over-complex pipeline or field set blows the 3-day onboarding budget | Ship Print & Signage starter defaults and an onboarding checklist |
| Concurrent edits to one opportunity | Two users move the same deal and one change is lost | Record actor and timestamp on every change (NFR-011); last-write-wins with visible history, or optimistic lock |
