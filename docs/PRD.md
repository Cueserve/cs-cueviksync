# PRD.md — Product Requirements Document

**Owner:** Viral Parikh
**Last updated:** 2026-07-13
**Source of truth for:** the testable requirements for the CuevikSync Phase 1 thin-core release — inquiry capture, configurable pipeline, and basic quoting.

> Derived from: docs/PRODUCT.md
> Downstream: docs/ARCHITECTURE.md, docs/TECH-STACK.md, README.md, docs/BACKLOG.md

---

## Contents

1. [Overview](#1-overview)
2. [Target Users](#2-target-users)
3. [Problem Statements](#3-problem-statements)
4. [Features / Capabilities](#4-features--capabilities)
5. [User Stories](#5-user-stories)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
   7A. [Placeholder Specifications](#7a-placeholder-specifications)
8. [Acceptance Criteria](#8-acceptance-criteria)
9. [Out of Scope (Phase 1 Thin-Core Release)](#9-out-of-scope-Phase 1-thin-core-release)
10. [Dependencies & Assumptions](#10-dependencies--assumptions)
11. [Constraints (Non-Architectural)](#11-constraints-non-architectural)
12. [Risks & Edge Cases](#12-risks--edge-cases)

---

## 1. Overview

PRODUCT.md defines the full product narrative and the intended end-state scope of
Phase 1. This PRD defines the **Phase 1 thin-core release**: the first release
inside Phase 1, limited to the smallest slice that proves the product's central
promise — zero-leak capture — and a configurable path from an inquiry to a tracked
quote.

The Phase 1 thin-core release covers inquiry capture, contact/company management,
adaptive pipelines, basic quotation, custom fields, and role-based access. It is
validated against Print & Signage operations (see PRODUCT.md §7). Estimation depth,
job execution, the AI sales assistant, workflow automation, and reporting are
deferred to later Phase 1 PRDs and listed in §9.

This PRD defines the only committed Phase 1 release scope at this time (thin-core).
Any broader capabilities mentioned in PRODUCT.md or brainstorming docs are roadmap
intent, not a Phase 1 commitment, until a subsequent PRD is approved.

Core goals for this release:

- Capture every inbound inquiry so none is lost.
- Let a team shape its own pipeline with no code.
- Turn a captured inquiry into a tracked, sendable quote.
- Keep sensitive data scoped through role-based access.

## 2. Target Users

Canonical role definitions live in PRODUCT.md §2. This PRD uses the subset of
those product roles that directly touch the thin-core capture-to-quote loop.
The thin-core RBAC baseline uses these same four roles: Owner/Admin, Sales Manager,
Sales Rep, and Office Administrator (see PRD-024).

- **Office administrator** — capture inbound inquiries into the shared queue.
- **Sales rep** — triage, qualify, own, and quote opportunities.
- **Business owner** — inspect current pipeline state and control configuration.
- **Sales manager** — coach active opportunities through stage, ownership, and next
  action discipline.
- **Operations staff** — update job status, dates, and flags on accepted work as it
  moves toward delivery.

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
  quote creation and tracking; speed gains from the estimation engine land in a later
  Phase 1 PRD.
- **PS-5 — Sensitive data is over-exposed.** Without role-based access everyone sees
  everything; even a lean team needs to scope who can see and edit what.
- **PS-6 — Won work has no execution record.** An accepted quote converts into
  production work with no shared tracking of dates, status, or delivery, so nothing
  tells the team what's due, late, or delivered. Reflects the operations-staff and
  business-owner need to see accepted work through to delivery.

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
- **Job/Order execution & tracking** — convert a Won opportunity into a job with
  per-item lines, dates, and status, with automatic turnaround and on-time
  calculation, a weekly KPI summary, and a waste/rework log, so accepted work is
  tracked from acceptance to delivery. (PS-6)

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
- As operations staff, I want a Won opportunity to become a trackable job so that I
  know what's been sold and needs to be produced.
- As operations staff, I want to record a job's order, promised, completed, and
  delivered dates so that the team knows what's due and what's late.
- As operations staff, I want to flag a job item's material shortage or equipment
  issue so that a delay has a recorded reason.
- As a business owner, I want a weekly summary of jobs completed, turnaround, and
  on-time rate so that I can see production performance without asking around.
- As operations staff, I want to log spoilage and reprints per job so that waste is
  tracked even before we have a formula for the rate.

## 6. Functional Requirements

Requirements are grouped by capability (mirroring §4). Each carries a unique ID and a
MoSCoW priority (Must / Should / Could).

### Omnichannel Inquiry Capture & Triage

- **PRD-001** — _**Automatic web-form capture**_ _(Must)_ — The system MUST create an
  inquiry record automatically from each web-form submission received at the
  configured intake endpoint. Capture happens without any staff action, so no online
  lead depends on someone remembering to log it. This is the release's core proof of
  zero-leak capture.
- **PRD-002** — _**Manual inquiry logging**_ _(Must)_ — The system MUST let a user
  manually create an inquiry record for an email, phone, or walk-in contact. Each
  manual entry carries a channel tag and a priority of High or Normal. This keeps
  non-digital channels in the same queue as web-form leads.
- **PRD-003** — _**Single shared queue**_ _(Must)_ — The system MUST present all open
  inquiries in one shared queue that any authorized user can view. A newly captured
  inquiry — web or manual — appears there without a rebuild or deploy. The queue is
  the single place the team triages incoming demand.
- **PRD-004** — _**Inquiry provenance**_ _(Must)_ — The system MUST record, for every
  inquiry, its source channel, capture timestamp, and original message content where
  provided. This preserves the context a rep needs before responding. No inquiry is
  stored without its origin.
- **PRD-005** — _**Priority control**_ _(Must)_ — The system MUST let a user set and
  change an inquiry's priority between High and Normal. Priority is a manual signal
  this release, not an automated judgment. It lets staff mark urgent leads for faster
  handling.
- **PRD-006** — _**Queue ordering**_ _(Should)_ — The system SHOULD order or filter
  the shared queue so that High-priority and unassigned inquiries surface first. This
  helps the team act on the most urgent, unowned leads before older or already-handled
  ones. Ordering is a convenience, never a precondition to capture.
- **PRD-007** — _**Qualify into opportunity**_ _(Must)_ — The system MUST let a user
  qualify an inquiry into an opportunity, attaching it to a contact and a company.
  Qualification is the handoff from triage into the pipeline. The resulting
  opportunity links back to the originating inquiry for traceability.
- **PRD-028** — _**Manual-channel logging SLA**_ _(Must)_ — The system MUST track
  whether manually logged channels meet a same-business-day intake discipline.
  For phone and walk-in channels, at least 95% of inquiries MUST be logged the same
  business day and 100% by the next business day. For manually logged email, at least
  95% MUST be logged within 4 business hours. This keeps non-automated channels from
  becoming silent leak paths.
- **PRD-029** — _**Raw submission retention & purge**_ _(Should)_ — The system SHOULD
  purge the raw web-form submission payload 30 days after its inquiry record is created.
  A submission held in the dead-letter state (never transformed) MUST be retained until
  resolved, to a hard cap of 90 days, after which it MUST be escalated and exported before
  purge — never silently deleted. This minimizes retained personal data (GDPR, see §11)
  while preserving forensics and reprocessing.
- **PRD-030** — _**Capture retry & dead-letter handling**_ _(Must)_ — The system MUST
  retry a failed submission transform. A deterministic failure (a malformed or
  schema-invalid payload) MUST move the submission to a dead-letter state after at most 3
  attempts and raise an alert; the raw submission MUST NOT be dropped. A transient failure
  (for example a datastore outage) MUST be retried by redelivery from the durable buffer
  with backoff until it succeeds, and MUST raise an alert on sustained processing lag. The
  transform MUST be idempotent, so one submission yields at most one inquiry. This makes the
  NFR-002 "no silent drops" guarantee concrete on the failure path.

### Contact & Company Management

- **PRD-008** — _**Contact and company records**_ _(Must)_ — The system MUST let a
  user create, view, edit, and delete contact and company records. Deleting a record
  that has linked opportunities MUST warn before proceeding. These records are the
  relationship backbone every inquiry and opportunity attaches to.
- **PRD-009** — _**Multi-company contacts**_ _(Should)_ — The system SHOULD let a
  contact be associated with more than one company. A single person often acts across
  several organizations, and each association SHOULD be visible from the contact
  record. This reveals cross-sell connections without duplicating the person.
- **PRD-010** — _**Duplicate detection**_ _(Must)_ — The system MUST detect a potential
  duplicate when a user creates a contact or company whose name or email matches an
  existing record, and warn before saving. The warning lists the suspected match and
  lets the user proceed or cancel. It keeps relationship data clean without blocking
  legitimate entries.

### Adaptive Pipelines

- **PRD-011** — _**Configurable stages**_ _(Must)_ — The system MUST let an
  administrator define, rename, reorder, and remove pipeline stages without code.
  Changes MUST take effect without a deploy. This lets each team shape the pipeline to
  its own process.
- **PRD-012** — _**Mandatory opportunity fields**_ _(Must)_ — The system MUST require
  every opportunity to have a current stage, an owner, and a next action. Saving
  without all three MUST be blocked with a validation message. This guarantees no deal
  sits in the pipeline without someone responsible and a defined next step.
- **PRD-013** — _**Stage movement with audit**_ _(Must)_ — The system MUST let a user
  move an opportunity between stages, recording the acting user and timestamp. The
  movement history MUST be viewable on the opportunity. This makes pipeline changes
  traceable and accountable.
- **PRD-014** — _**Terminal outcomes**_ _(Must)_ — The system MUST support a terminal
  outcome stage that marks an opportunity Won or Lost. Terminal opportunities MUST
  drop out of the active pipeline view. This keeps the working pipeline focused on
  live deals.
- **PRD-015** — _**Parallel pipelines**_ _(Should)_ — The system SHOULD support more
  than one configurable pipeline so a lean team can run different processes side by
  side. Opportunities in each pipeline SHOULD remain independent. This serves teams
  whose work splits into distinct flows without custom code.

### Basic Quotation

- **PRD-016** — _**Quote creation**_ _(Must)_ — The system MUST let a user create a
  quote associated with an opportunity, composed of line items. A new quote starts in
  draft. This turns a qualified opportunity into a tracked commercial offer.
- **PRD-017** — _**Line-item entry**_ _(Must)_ — The system MUST let a line item be
  selected from a flat service catalog (named item plus unit price) or entered
  free-form. Each line MUST have an editable quantity and unit price. This covers both
  catalog-based and one-off pricing without an estimation engine.
- **PRD-018** — _**Quote total**_ _(Must)_ — The system MUST compute a quote total as
  the sum of (quantity × unit price) across its line items. The total MUST update
  whenever a line changes. Automatic calculation removes manual math errors from the
  offer.
- **PRD-019** — _**Quote status lifecycle**_ _(Must)_ — The system MUST track a quote's
  status through draft → sent → accepted or declined. Invalid transitions MUST be
  rejected. This tells the team which offers are live and which are closed.
- **PRD-020** — _**Quote issuance**_ _(Must)_ — The system MUST let a user produce a
  printable or shareable quote document, mark the quote as sent, and record the send
  timestamp. Sending is an explicit human action; nothing goes to a customer
  automatically. Delivery MAY happen through an in-product email integration or an
  external channel chosen by the user, but marking sent MUST always be an explicit
  user action. This preserves human control over every customer-facing artifact.
- **PRD-021** — _**Catalog maintenance**_ _(Should)_ — The system SHOULD let an
  administrator add, edit, and deactivate flat catalog items with a unit price. A
  deactivated item SHOULD no longer appear in the line-item picker. This keeps the
  sellable-item list current without altering past quotes.

### Job / Order Execution

- **PRD-031** — _**Job creation from Won opportunity**_ _(Must)_ — The system MUST
  let a user convert a Won opportunity into a job, carrying forward the linked
  contact and company. This is the handoff from a closed deal into production
  work. (PS-6)
- **PRD-032** — _**Job line items**_ _(Must)_ — The system MUST let a job carry one
  or more item lines under a shared job number, each with an item description and
  quantity. A job with three items is three lines sharing one job number, matching
  how the team already tracks multi-item orders.
- **PRD-033** — _**Mandatory job dates**_ _(Must)_ — The system MUST require an
  order date and a promised date on every job item line. Saving a line missing
  either date MUST be blocked with a validation message, mirroring the mandatory
  stage/owner/next-action guarantee on opportunities (PRD-012).
- **PRD-034** — _**Completion and delivery tracking**_ _(Must)_ — The system MUST
  let a user record a job's completed date and delivered date at the job level.
  An unset completed date means the job is still in production.
- **PRD-035** — _**Overdue reason capture**_ _(Should)_ — The system SHOULD let a
  user record a reason when a job is overdue against its promised date. This
  preserves the context behind a late job without blocking the record.
- **PRD-036** — _**This-week scheduling flag**_ _(Should)_ — The system SHOULD let
  a user flag a job as scheduled for the current week and present those flagged
  jobs in a filtered view. This is a manual Yes/No flag, not capacity- or
  resource-aware scheduling, which remains out of scope (see §9).
- **PRD-037** — _**Material and equipment issue flags**_ _(Should)_ — The system
  SHOULD let a user flag a material shortage or equipment issue per job item, with
  a free-text note. This surfaces production blockers on the item they affect.
- **PRD-038** — _**Job invoice value**_ _(Must)_ — The system MUST let a user
  record an invoice value at the job level. This MAY differ from the originating
  quote total to account for rework or scope change during production.
- **PRD-039** — _**Turnaround and on-time calculation**_ _(Must)_ — The system
  MUST automatically compute a completed job's turnaround in days (completed date
  minus order date) and whether it was on-time (completed date on or before
  promised date). This removes manual date math from the weekly review.
- **PRD-040** — _**Overdue flag and days overdue**_ _(Must)_ — The system MUST
  automatically flag an incomplete job as overdue once its promised date has
  passed, and show the number of days overdue. This surfaces at-risk jobs without
  manual tracking.
- **PRD-041** — _**Job status derivation**_ _(Must)_ — The system MUST derive a
  job's status as Completed or Pending from whether its completed date is set,
  and present Completed and Pending jobs as separate filtered views.
- **PRD-042** — _**Waste/rework log**_ _(Should)_ — The system SHOULD let a user
  log a spoilage percentage (manual entry — no computed formula this release, see
  PRODUCT.md §3A), a reprint Yes/No flag, and a note against a job. This captures
  waste data even before a spoilage-rate calculation is decided.
- **PRD-043** — _**Weekly job KPI summary**_ _(Should)_ — The system SHOULD present
  a weekly summary table of jobs completed, average turnaround, on-time
  percentage, and total invoice value, one row per week. This release ships the
  summary as a table; chart visualization is deferred pending a charting-library
  decision (see TECH-STACK.md).

### Configurable Custom Fields

- **PRD-022** — _**Custom fields**_ _(Must)_ — The system MUST let an administrator add
  configurable custom fields to inquiry, contact, company, and opportunity records
  without code. Added fields MUST appear on the record form and persist their values.
  This lets a team capture the attributes its work needs without a code change.

### Role-Based Access Control

- **PRD-023** — _**Authentication**_ _(Must)_ — The system MUST authenticate a user
  before granting access to any record. Unauthenticated requests MUST be denied.
  Access control has no meaning without a verified identity.
- **PRD-024** — _**Baseline thin-core roles**_ _(Must)_ — The system MUST support
  these five roles with distinct permission sets: Owner/Admin, Sales Manager,
  Sales Rep, Office Administrator, and Operations. Assigning one of these roles
  MUST change what the user can see and do. Roles are the unit that scopes access.
- **PRD-027** — _**Baseline permission boundaries**_ _(Must)_ — The system MUST enforce
  this minimum permission baseline for thin-core roles:
  - Owner/Admin: full read/write on inquiry, contact, company, opportunity, and quote
    records; can configure pipelines, custom fields, catalog, users, and role assignments.
  - Sales Manager: read/write on inquiry, contact, company, opportunity, and quote
    records; can assign ownership and update stage/next action; cannot access admin
    configuration or role assignment.
  - Sales Rep: read/write on opportunities and quotes they own, plus shared inquiry queue
    access for triage and qualification; cannot access admin configuration or role assignment.
  - Office Administrator: create and update inquiry records and related contact/company
    basics; view shared inquiry queue; cannot configure system structure, cannot assign roles,
    and cannot administer pipeline/catalog settings.
  - Operations: read/write on job records only — dates, status, this-week flag,
    material/equipment issue notes, and the waste/rework log; no access to inquiries,
    contacts, companies, opportunities, quotes, or admin configuration.
- **PRD-025** — _**Server-side enforcement**_ _(Must)_ — The system MUST enforce
  role-based visibility and edit rights on records server-side, not by hiding data in
  the client alone. A user whose role lacks access MUST be denied even if the client
  is bypassed. This prevents access rules from being trivially circumvented.
- **PRD-026** — _**Admin-only configuration**_ _(Must)_ — The system MUST restrict
  pipeline, custom-field, and catalog configuration to the Owner/Admin role.
  Non-admin roles MUST NOT reach those configuration screens or endpoints. This keeps
  structural changes in trusted hands.

## 7. Non-Functional Requirements

Measurable quality attributes. Each is a requirement, not a solution. Percentile
latency is written `p95` / `p99`.

- **NFR-001 — Capture latency.** A web-form submission MUST appear as an inquiry
  record within 2 minutes of submission (p99).
- **NFR-002 — Capture reliability.** At least 99% of web-form submissions received at
  the intake endpoint MUST be persisted as inquiry records, with no silent drops.
- **NFR-003 — Capture availability.** The web-form intake endpoint MUST maintain
  > = 99.5% monthly uptime, because a missed inquiry is the product's defining failure.
- **NFR-004 — Onboarding time.** A team of 10 users or fewer MUST be able to configure
  a pipeline, custom fields, roles, and a flat catalog and begin logging live
  inquiries within 3 days of signup, with no custom development.
- **NFR-005 — Interactive performance.** Queue, pipeline, job, and record views MUST
  return in p95 < 2 s and p99 < 5 s with 10 concurrent users.
- **NFR-006 — Scale.** The system MUST support at least 10 concurrent users and 50,000
  inquiry records per tenant without breaching the NFR-005 latency targets.
- **NFR-007 — Credential security.** User passwords MUST be stored using a memory-hard
  hash (Argon2id, or bcrypt with work factor >= 12); no plaintext credentials are
  stored anywhere.
- **NFR-008 — Access enforcement.** RBAC checks MUST be enforced server-side on every
  record read and write.
- **NFR-009 — Transport security.** All traffic MUST be served over Transport Layer
  Security (TLS) 1.2 or higher.
- **NFR-010 — Durability.** Committed inquiry, contact, opportunity, and quote records
  MUST be recoverable with a Recovery Point Objective (RPO) of <= 24 hours.
- **NFR-011 — Auditability.** Stage changes and quote status changes MUST record the
  acting user and a timestamp.
- **NFR-012 — Accessibility.** Primary capture and pipeline screens SHOULD meet Web
  Content Accessibility Guidelines (WCAG) 2.1 level AA.
- **NFR-013 — Recovery time.** After a disaster requiring a restore, the system MUST
  return to full service within 8 business hours (Recovery Time Objective (RTO) <= 8
  business hours). This complements the NFR-010 Recovery Point Objective.

## 7A. Placeholder Specifications

_Not yet authored._ CuevikSync's open product decisions are held in
[docs/PRODUCT.md](PRODUCT.md) §3A rather than here. This section exists so the two repos carry
the same skeleton; if a requirement-level placeholder ever needs its own specification — the
shape a decision must take before it can be built against — it goes here, not in PRODUCT.

## 8. Acceptance Criteria

Testable conditions that define "done" for each requirement.

> **Success-criteria scope.** This release binds acceptance to PRODUCT.md §5 criteria
> it can prove: zero-leak web-form capture (NFR-001, NFR-002), pipeline visibility
> (PRD-012), manual-channel discipline (PRD-028), and 3-day onboarding (NFR-004). The three criteria that depend on
> deferred features — median first response < 1 hour (AI assistant), quote velocity
> −50% (estimation engine), and 90% cold-deal follow-through (AI flagging) — are
> **Post-Thin-Core release targets** and are not part of this release's definition of done.

### Phase 1 Outcome Carry-Forward (Post-Thin-Core)

Deferred outcomes remain owned and measurable. Any PRD that claims these outcomes MUST
include mapped requirements and acceptance criteria before approval.

| Outcome ID | Product outcome          | Owner role                         | Target release PRD                              | Measurement method                                                                                                              | Exit target                                        |
| ---------- | ------------------------ | ---------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| OUT-001    | Faster response          | Product Owner + Sales Lead         | Post-Thin-Core AI Sales Assist PRD              | Median elapsed time from inquiry capture timestamp to first outbound response timestamp, measured weekly on production data     | Median < 1 hour for teams using AI assist features |
| OUT-002    | Quote velocity           | Product Owner + Revenue Operations | Post-Thin-Core Estimation & Quotation Depth PRD | Median elapsed time from inquiry capture timestamp to quote-sent timestamp, measured against pre-implementation baseline cohort | Median time reduced by 50% versus prior process    |
| OUT-003    | Cold-deal follow-through | Product Owner + Sales Manager      | Post-Thin-Core AI Sales Assist PRD              | Percentage of flagged cold opportunities with a logged follow-up action within 3 calendar days, measured weekly                 | >= 90% follow-through within 3 days                |

Carry-forward review cadence: owners review OUT-001/002/003 weekly and publish status in the release readiness checklist for each Post-Thin-Core PRD.

| Requirement ID | Acceptance criteria                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PRD-001        | Submitting the embedded web form creates a matching inquiry in the queue within 2 minutes with channel = "web form"; the raw submission content is retained.                                                                                                                                                                                                                                                                                                                                        |
| PRD-002        | A user can create an inquiry choosing channel ∈ {email, phone, walk-in} and priority ∈ {High, Normal}; the saved record shows both.                                                                                                                                                                                                                                                                                                                                                                 |
| PRD-003        | A newly captured inquiry (web or manual) appears in one shared queue for an authorized user without any deploy or rebuild.                                                                                                                                                                                                                                                                                                                                                                          |
| PRD-004        | Every inquiry record displays its source channel, capture timestamp, and original message content when it was supplied.                                                                                                                                                                                                                                                                                                                                                                             |
| PRD-005        | A user can change an inquiry's priority between High and Normal and the change persists on reload.                                                                                                                                                                                                                                                                                                                                                                                                  |
| PRD-006        | With mixed inquiries present, the default queue order or filter places High-priority and unassigned inquiries above Normal or assigned ones.                                                                                                                                                                                                                                                                                                                                                        |
| PRD-007        | A user can convert an inquiry into an opportunity and attach an existing or new contact and company; the opportunity links back to the originating inquiry.                                                                                                                                                                                                                                                                                                                                         |
| PRD-028        | Over a rolling 2-week sample, >= 95% of phone and walk-in inquiries are logged the same business day and 100% by next business day; >= 95% of manually logged email inquiries are logged within 4 business hours.                                                                                                                                                                                                                                                                                   |
| PRD-008        | A user can create, view, edit, and delete a contact and a company; deleting a record that has linked opportunities warns before proceeding.                                                                                                                                                                                                                                                                                                                                                         |
| PRD-009        | A contact can be linked to two or more companies and each association is visible from the contact record.                                                                                                                                                                                                                                                                                                                                                                                           |
| PRD-010        | Creating a contact or company whose name or email matches an existing record shows a duplicate warning listing the suspected match; the user can proceed or cancel.                                                                                                                                                                                                                                                                                                                                 |
| PRD-011        | An administrator can add, rename, reorder, and remove pipeline stages and the change takes effect without a code deploy.                                                                                                                                                                                                                                                                                                                                                                            |
| PRD-012        | An opportunity cannot be saved without a stage, an owner, and a next action; missing any one blocks save with a validation message.                                                                                                                                                                                                                                                                                                                                                                 |
| PRD-013        | Moving an opportunity to another stage records the acting user and timestamp, viewable in the opportunity's history.                                                                                                                                                                                                                                                                                                                                                                                |
| PRD-014        | An opportunity can be set to a terminal Won or Lost stage; terminal opportunities no longer appear in the active pipeline view.                                                                                                                                                                                                                                                                                                                                                                     |
| PRD-015        | An administrator can create a second pipeline with its own stages; opportunities in each pipeline are independent.                                                                                                                                                                                                                                                                                                                                                                                  |
| PRD-016        | A user can create a quote from an opportunity; the quote references that opportunity and starts in draft.                                                                                                                                                                                                                                                                                                                                                                                           |
| PRD-017        | A quote line can be added from a catalog item (name and unit price pre-filled) or entered free-form; each line has an editable quantity and unit price.                                                                                                                                                                                                                                                                                                                                             |
| PRD-018        | The displayed quote total equals the sum of (quantity × unit price) across lines and updates when any line changes.                                                                                                                                                                                                                                                                                                                                                                                 |
| PRD-019        | A quote status can move draft → sent → accepted or declined; an invalid transition (for example accepted → draft) is rejected.                                                                                                                                                                                                                                                                                                                                                                      |
| PRD-020        | A user can generate a printable or shareable quote document and mark the quote sent; the send timestamp is recorded and shown whether delivery is done via in-app email integration or an external/manual channel.                                                                                                                                                                                                                                                                                  |
| PRD-021        | An administrator can add, edit, and deactivate catalog items with a unit price; a deactivated item no longer appears in the line-item picker.                                                                                                                                                                                                                                                                                                                                                       |
| PRD-031        | A Won opportunity can be converted into a job; the job carries forward the linked contact and company.                                                                                                                                                                                                                                                                                                                                                                                              |
| PRD-032        | A job can hold two or more item lines under one shared job number, each with its own description and quantity.                                                                                                                                                                                                                                                                                                                                                                                      |
| PRD-033        | Saving a job item line without an order date or a promised date is blocked with a validation message.                                                                                                                                                                                                                                                                                                                                                                                               |
| PRD-034        | A user can set a job's completed date and delivered date; a job with no completed date is treated as still in production.                                                                                                                                                                                                                                                                                                                                                                           |
| PRD-035        | A user can record a reason on an overdue job; the reason is visible on the job record.                                                                                                                                                                                                                                                                                                                                                                                                              |
| PRD-036        | A user can flag a job as scheduled for the current week and see it in a filtered this-week view; the flag has no effect on capacity or resource assignment.                                                                                                                                                                                                                                                                                                                                         |
| PRD-037        | A user can flag a material shortage or equipment issue on a job item with a free-text note, and the flag is visible on that item.                                                                                                                                                                                                                                                                                                                                                                   |
| PRD-038        | A user can set a job's invoice value independent of the originating quote total.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| PRD-039        | For a completed job, the displayed turnaround (days) and on-time flag are computed automatically from order, promised, and completed dates without manual entry.                                                                                                                                                                                                                                                                                                                                    |
| PRD-040        | An incomplete job past its promised date is automatically flagged overdue with a computed days-overdue count.                                                                                                                                                                                                                                                                                                                                                                                       |
| PRD-041        | Jobs with a completed date appear in a Completed view; jobs without one appear in a Pending view, with no manual status field to set.                                                                                                                                                                                                                                                                                                                                                               |
| PRD-042        | A user can log a spoilage percentage, a reprint Yes/No flag, and a note against a job; no automatic spoilage-rate calculation is performed.                                                                                                                                                                                                                                                                                                                                                         |
| PRD-043        | A weekly summary table shows jobs completed, average turnaround, on-time percentage, and total invoice value, with one row added per week.                                                                                                                                                                                                                                                                                                                                                          |
| PRD-022        | An administrator can add a custom field to a record type without a code deploy; the field appears on that record's form and its value persists.                                                                                                                                                                                                                                                                                                                                                     |
| PRD-023        | An unauthenticated request for any record is denied and redirected to sign-in; no record data is returned.                                                                                                                                                                                                                                                                                                                                                                                          |
| PRD-024        | The system provides exactly the thin-core baseline roles (Owner/Admin, Sales Manager, Sales Rep, Office Administrator, Operations), and changing a user's role changes accessible screens and allowed actions accordingly.                                                                                                                                                                                                                                                                          |
| PRD-027        | Permission checks match the baseline boundaries: Owner/Admin can configure and assign roles; Sales Manager can manage pipeline work but cannot access admin configuration; Sales Rep can manage owned opportunities/quotes plus shared inquiry triage; Office Administrator can log/manage inquiries but cannot access configuration or role assignment; Operations can read/write job records only and cannot reach inquiries, contacts, companies, opportunities, quotes, or admin configuration. |
| PRD-025        | A user whose role lacks read access to a record cannot retrieve it through the UI or a direct record request; the denial is enforced server-side, not merely hidden in the UI.                                                                                                                                                                                                                                                                                                                      |
| PRD-026        | A non-admin role cannot open or call the pipeline, custom-field, or catalog configuration screens or endpoints.                                                                                                                                                                                                                                                                                                                                                                                     |
| NFR-001        | Under test, 99% of web-form submissions surface as records within 2 minutes (measured at p99).                                                                                                                                                                                                                                                                                                                                                                                                      |
| NFR-002        | In a batch of submissions to the intake endpoint, >= 99% are persisted as records and zero are dropped without an error being recorded.                                                                                                                                                                                                                                                                                                                                                             |
| NFR-003        | Monitored over a calendar month, the intake endpoint reports >= 99.5% uptime.                                                                                                                                                                                                                                                                                                                                                                                                                       |
| NFR-004        | A fresh 10-user team completes pipeline, field, role, and catalog setup and logs a live inquiry within 3 days, using configuration only.                                                                                                                                                                                                                                                                                                                                                            |
| NFR-005        | Load test with 10 concurrent users shows queue, pipeline, and record views returning in p95 < 2 s and p99 < 5 s.                                                                                                                                                                                                                                                                                                                                                                                    |
| NFR-006        | With 50,000 inquiry records and 10 concurrent users, NFR-005 latency targets still hold.                                                                                                                                                                                                                                                                                                                                                                                                            |
| NFR-007        | Stored password values are non-reversible memory-hard hashes; no plaintext password exists in the database or logs.                                                                                                                                                                                                                                                                                                                                                                                 |
| NFR-008        | A record request from a role without permission is denied by the server even when the client is bypassed.                                                                                                                                                                                                                                                                                                                                                                                           |
| NFR-009        | All endpoints reject plaintext HTTP and serve only over TLS 1.2 or higher.                                                                                                                                                                                                                                                                                                                                                                                                                          |
| NFR-010        | A restore from the most recent backup loses no more than 24 hours of committed records.                                                                                                                                                                                                                                                                                                                                                                                                             |
| NFR-011        | Each stage change and quote status change shows the acting user and timestamp in the record history.                                                                                                                                                                                                                                                                                                                                                                                                |
| PRD-029        | A raw submission is no longer retrievable 30 days after its inquiry is created; a dead-lettered submission remains available until resolved and, at the 90-day cap, is escalated and exported before purge with a record retained — never dropped silently.                                                                                                                                                                                                                                         |
| PRD-030        | A malformed submission is retried up to 3 times, then appears in a dead-letter state with an alert raised and its raw content retained; during a simulated datastore outage, in-flight submissions are not dead-lettered but are redelivered and each produces exactly one inquiry once the datastore recovers.                                                                                                                                                                                     |
| NFR-012        | The capture and pipeline screens pass an automated WCAG 2.1 AA check with no critical violations.                                                                                                                                                                                                                                                                                                                                                                                                   |
| NFR-013        | A disaster-recovery drill restores the system to full service within 8 business hours of the declared start.                                                                                                                                                                                                                                                                                                                                                                                        |

## 9. Out of Scope

Explicit exclusions for the Phase 1 thin-core release. Each moves to a later Phase 1
PRD or a post-Phase 1 PRD unless noted as permanently out.

- **Automated email and phone ingestion** — email-to-record parsing and telephony
  capture; only the web form auto-ingests this release, and email, phone, and
  walk-in are logged manually.
- **AI intent auto-prioritization** — automatic ranking of urgent or high-intent
  messages; priority is set manually this release.
- **Attribute-matrix product catalog and modifier options** — the release ships a
  flat catalog (item plus unit price) only.
- **Estimation engine** — costing formulas, quantity-tier price breaks, and the
  margin-floor guardrail; quotes are manual line items this release.
- **Job/Order execution depth beyond thin-core** — milestones and formal change
  control on a job; this release's job record is a flat tracking record only (see
  PRD-031–043).
- **Work orders and scheduling** — capacity-aware resource assignment and calendar
  scheduling; the thin-core this-week flag (PRD-036) is a manual Yes/No marker,
  not capacity- or resource-aware scheduling.
- **AI sales assistant** — follow-up drafting, missed-call recovery, next-action
  suggestions, and cold-deal flagging.
- **Workflow automation** — the trigger-condition-action engine and automated stage
  handoffs.
- **Unified communication timeline** — the chronological cross-channel feed per
  contact; the inquiry record still stores its origin channel and message.
- **Opportunity/pipeline-level performance reporting** — forecasting and manager
  analytics across opportunities; the thin-core job-level weekly KPI summary
  (PRD-043) is narrower than this and is in scope.
- **Spoilage-rate calculation** — an automatic formula for the waste/rework log's
  spoilage percentage; this release captures the value as manual entry only (see
  PRODUCT.md §3A).
- **Accounting, invoicing, and payment processing** — permanently out per PRODUCT.md;
  handled by the customer's external finance tools.
- **Mobile field-capture app, recurring account/contract management, white-label
  branding / client portals, and marketing automation** — PRODUCT.md deferred items,
  not part of this release.

## 10. Dependencies & Assumptions

- **Web-form intake endpoint** — auto-capture depends on a hosted form or webhook
  receiver embedded in the customer's site; if it is not embedded, web-form
  auto-capture does not occur and all channels fall back to manual logging.
- **Outbound email service (optional for in-app delivery)** — in-product email delivery
  depends on a configured email or transactional-mail provider. Without it, a quote
  can still be shared through external/manual channels and then marked sent in-product.
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

Rows that cite PRD/NFR IDs are in-scope controls for this release. Rows without
explicit requirement IDs are candidate mitigations for later PRDs and are not
thin-core commitments.

| Risk / edge case                            | Impact                                                                                  | Mapped control or candidate mitigation                                                                                                                                   |
| ------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Duplicate or spam web-form submissions      | Queue floods with junk and real leads are buried                                        | Candidate: rate-limit/spam-filter intake, submission dedup, and manual dismiss/merge workflow in a later PRD.                                                            |
| Web-form endpoint downtime                  | Inbound inquiries lost during an outage — the one failure the product exists to prevent | Mapped: NFR-003 uptime target (plus operational alerting/runbook design in implementation docs).                                                                         |
| Malformed or partial web-form payload       | Record created with missing fields, or submission rejected and lost                     | Mapped: PRD-030 retries then dead-letters a malformed payload with its raw content retained and an alert raised — flagged for manual completion, never silently dropped. |
| Manual channels not logged                  | Email, phone, and walk-in still depend on staff discipline, so leaks persist            | Mapped: PRD-028 manual-channel SLA metrics and escalation path.                                                                                                          |
| Duplicate-detection false positive/negative | Records wrongly merged or left fragmented                                               | Mapped + candidate: PRD-010 warning-on-create is in scope; manual-merge/tuning rules are candidate later enhancements.                                                   |
| Free-form quote line priced wrong           | An incorrect total reaches the customer                                                 | Mapped: PRD-018 total auto-calculation plus PRD-020 explicit human send action.                                                                                          |
| RBAC misconfiguration                       | Sensitive data exposed, or legitimate work blocked                                      | Mapped: NFR-008 server-side enforcement and PRD-026 admin-only configuration scope.                                                                                      |
| Over-configuration at setup                 | An over-complex pipeline or field set blows the 3-day onboarding budget                 | Candidate: starter defaults and onboarding checklist depth to be defined in implementation docs/later PRD.                                                               |
| Concurrent edits to one opportunity         | Two users move the same deal and one change is lost                                     | Mapped + candidate: NFR-011 actor/timestamp audit is in scope; conflict strategy (last-write-wins vs optimistic lock) is candidate implementation design.                |
| Spoilage % formula undefined                | Waste/rework data collected but not comparable across jobs until a formula is locked    | Mapped: PRD-042 manual entry only this release; formula decision is PRODUCT.md §3A, owned by the Product Owner.                                                          |
