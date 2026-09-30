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
  next action that is not overdue (§5: Pipeline visibility).
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
> users: they never log in, and client portals are on the Wish-list (§4).

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
> in full, _Thin-core (partial)_ is committed only in the part §4 states, and _Roadmap_ is
> not committed.

- **Zero-leak inquiry capture** _(Thin-core (partial))_ — every inquiry, from web form,
  email, phone, text, or walk-in, lands in one shared queue as one record that keeps its
  source, and is prioritized so the most urgent and highest-intent inquiries are answered
  first; a submission that cannot be processed is held for a person, never dropped. So no
  inquiry is lost, and the hottest are handled first. The thin-core release captures web
  forms automatically, lets staff log email, phone, and walk-in inquiries by hand, and sets
  priority manually.
- **Complete customer record** _(Thin-core)_ — one record for each Person and Organization,
  with a lifecycle status, the role a person holds at each organization they work with, and
  links between related organizations. Every inquiry, opportunity, and job attaches to it,
  and likely duplicates are flagged. So anyone on the team knows who a customer is and what
  has happened with them before they reply.
- **Adaptive pipelines** _(Thin-core)_ — an Owner/Admin defines, renames, and reorders each
  pipeline's stages with no code, and a team can run several pipelines side by side
  (quick-turn digital orders, field estimates, batch orders, signage installs). Every open
  opportunity must have an owner, a stage, and a next action with a due date; every stage
  move records who
  made it and when; and a deal leaves the active pipeline once it is Won or Lost. So no
  deal stalls unnoticed, and each process runs the way the shop actually works.
- **Margin-safe estimating** _(Roadmap)_ — a catalog of products defined by their options
  (for example size, substrate, quantity, and finishing), where each option adds its own
  cost, priced by formula with quantity-based price breaks and a minimum margin the shop
  sets. The formulas, the price-break structure, and what happens below the minimum margin
  are open decisions (§3A). So estimates are fast, consistent, and protect margin, without
  a spreadsheet.
- **Quote to order** _(Thin-core (partial))_ — quotes built from catalog and free-form line
  items, with a total, issued as a document, and tracked from draft to sent to accepted or
  declined; each revision is kept as a version, and a won opportunity with an accepted
  quote becomes the job. Pricing comes from Margin-safe estimating, and AI drafts quotes
  from unstructured customer messages and past orders. A person reviews and sends every
  quote. So an inquiry becomes a priced, tracked offer quickly, and a yes becomes work. The
  thin-core release ships manual line items from a flat catalog plus free-form lines, the
  quote document, and the status lifecycle.
- **Order-to-delivery tracking** _(Thin-core)_ — a won opportunity or a direct booking
  becomes a Job with its item lines, order and promised dates, and any production issues.
  Turnaround and on-time are computed, and status follows from the job's dates, so no one
  has to keep it updated. Past-due jobs are listed with days overdue. So the team always
  knows where each job stands and whether it will ship on time, without re-entering the
  order.
- **Deadline early warning** _(Roadmap)_ — AI checks each Job's progress against its
  promised date (time left, open production issues, and whether it is scheduled this week)
  and warns operations staff, then escalates to a manager, when a job is at risk or past
  due. Warnings reach only someone who can act, stop once the job is back on track, and
  never reach the customer. It builds on the past-due list in Order-to-delivery tracking.
  So late work surfaces before the customer has to chase it.
- **Clash-free scheduling** _(Roadmap)_ — milestones on each job (for example proof
  approved, printed, finished) and change control that records a customer's changes after
  approval with their effect on price and dates; then people, machines, and time slots
  assigned on a schedule, so two jobs are never booked on the same press at once. How deep
  scheduling goes, from a calendar with assignments to full capacity planning, is an open
  decision (§3A). It builds on the thin-core this-week flag. So work moves to delivery
  without clashes over people or machines.
- **One-step reorder** _(Thin-core)_ — a Reorder action on a customer's past job books a
  new Job pre-filled from it and linked to it (the same work again, in the same or a
  different quantity) with new order and promised dates. It is a direct booking (§3A): no
  Opportunity is created. So a repeat order skips the sales pipeline and is booked in one
  step.
- **Production at a glance** _(Thin-core)_ — a weekly summary of jobs completed, average
  turnaround, on-time %, and invoice value, with a spoilage % and reprint flag logged on
  each job. So the owner sees production performance and how much work is redone, without
  asking around.
- **Communication center** _(Thin-core (partial))_ — one timeline per Person and
  Organization of every call, email, text, note, and status update; emails and texts from
  known contacts are filed automatically by their address or number. So staff have full
  context before they reply. The thin-core release ships a manual notes log: staff record
  notes, calls, and emails by hand against a Person or Organization, shown in time order.
- **Human-approved AI** _(Roadmap)_ — AI that drafts follow-ups and replies to missed calls,
  suggests each deal's next action, flags deals going cold, and flags jobs at risk of
  missing their promised date. Flags are advisory; a draft reaches a customer only when a
  person sends it. So a busy team's follow-through keeps pace without losing control of
  what customers see.
- **No-chase automation** _(Roadmap)_ — Owner/Admin-defined rules in the form "when this
  happens, if this is true, do this": for example, when an opportunity is won, notify
  operations; when a job passes its promised date, create a follow-up task. Rules act
  inside the business (notify, create tasks, hand off to the next stage) and never send
  anything to a customer, and every change a rule makes records the rule as its author.
  They run on the stage and lifecycle events the thin-core release already records. So
  routine hand-offs happen without anyone chasing them.
- **Pipeline forecast** _(Roadmap)_ — expected revenue from open opportunities by stage and
  expected close date, and which deals are moving, which are stalling, and where each rep
  needs coaching. So managers can forecast revenue and coach the team.
- **Need-to-see access** _(Thin-core)_ — five roles (Owner/Admin, Sales Manager, Sales Rep,
  Office Administrator, and Operations), each seeing and editing only what its work needs,
  with every restriction enforced by the system, not just hidden on screen. Only
  Owner/Admin can change pipelines and the catalog. Each business's data is isolated from
  every other's, and every stage move records who made it and when. So screens stay simple,
  sensitive data stays hidden, and every change to a deal can be traced.
- **Business-defined fields** _(Roadmap)_ — an Owner/Admin adds custom fields to inquiries,
  persons, organizations, opportunities, and jobs (text, number, date, or a choice list)
  with no code, and each appears on its record's form. So each shop captures what its work
  needs, such as substrate, finish, or install site, without waiting for a release.

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

- **Zero-leak inquiry capture** (thin-core part) — web-form submissions captured
  automatically as one Inquiry each, none dropped (a failed submission is held for a
  person); staff log email, phone, and walk-in inquiries by hand; one shared queue; each
  Inquiry keeps its source; priority set manually.
- **Complete customer record** — Person and Organization records with a lifecycle status,
  a person's role at each organization, and links between related organizations;
  inquiries, opportunities, and jobs attached; likely duplicates flagged.
- **Adaptive pipelines** — stages an Owner/Admin defines, renames, and reorders with no
  code; several pipelines side by side; every open opportunity has an owner, a stage, and a
  next action with a due date; every stage move recorded; Won or Lost closes a deal.
- **Quote to order** (thin-core part) — manual line items from a flat catalog plus
  free-form lines, a quote total, a quote document, and draft → sent → accepted or
  declined, with "sent" always marked by a person.
- **Order-to-delivery tracking** — a Won opportunity or a direct booking (§3A) becomes a
  job with per-item lines, order and promised dates, production issue flags, a this-week
  flag, an invoice value, computed turnaround and on-time, status derived from its dates,
  and an overdue flag with days overdue.
- **One-step reorder** — Reorder on a customer's past job books a new job pre-filled from
  it and linked to it, with new order and promised dates, as a direct booking (§3A); no
  Opportunity is created.
- **Production at a glance** — a weekly summary of jobs completed, turnaround, on-time %,
  and invoice value, one row per week (table only; no charts this release); per-job
  spoilage % (manual entry — see §3A) and reprint flag.
- **Communication center** (thin-core part) — a notes log where staff record notes, calls,
  and emails by hand against a Person or Organization, shown in time order.
- **Need-to-see access** — five roles (Owner/Admin, Sales Manager, Sales Rep, Office
  Administrator, Operations) enforced by the system; pipeline and catalog settings for
  Owner/Admin only; each business's data isolated from every other's.

> **Commitment rule:** This section is the only committed Phase 1 scope.
> Any broader capabilities described elsewhere in this document are roadmap intent
> and become commitment only when promoted into an approved PRD.

### Planned roadmap after thin-core (order in §7)

- **Zero-leak inquiry capture** (beyond thin-core) — automatic capture of email, phone,
  and text inquiries; AI prioritization of urgent and high-intent inquiries.
- **Margin-safe estimating** — a catalog of products defined by their options, priced by
  formula with quantity-based price breaks and a minimum margin the shop sets (formulas,
  price breaks, and margin behaviour are open decisions — see §3A).
- **Quote to order** (beyond thin-core) — quote versions, pricing from Margin-safe
  estimating, and AI-drafted quotes from unstructured customer messages (the requirement
  that unblocks AI drafting is an open decision — see §3A).
- **Deadline early warning** — AI-assisted warnings before a job's promised date and
  escalation to managers, on top of the thin-core overdue flag.
- **Clash-free scheduling** — job milestones and change control; people, machines, and
  time slots assigned on a schedule, building on the thin-core this-week flag (depth is an
  open decision — see §3A).
- **Communication center** (beyond thin-core) — one timeline per Person and Organization of
  calls, emails, texts, and status updates, with emails and texts from known contacts filed
  automatically.
- **Human-approved AI** — drafted follow-ups and missed-call replies (missed-call recovery
  requires a telephony connector), next-action suggestions, and going-cold and at-risk-job
  flags; flags are advisory, and a person sends every draft.
- **No-chase automation** — rules that act on the stage and lifecycle events the thin-core
  release already records; automated reactions ship in a later Phase 1 release.
- **Pipeline forecast** — expected revenue by stage and close date, and manager analytics
  (the thin-core Production at a glance summary is narrower and already committed).
- **Business-defined fields** — custom fields on inquiries, persons, organizations,
  opportunities, and jobs, added by an Owner/Admin with no code.

### Wish-list (not committed)

Each item below is out of scope until PRODUCT.md is updated to move it in. Moving one in
needs a named problem for a §2 persona.

- AI scheduling / appointment booking
- Mobile field-capture app (voice dictation) — no native mobile surface in this release
- Recurring account & contract management (post-delivery account management, outside the
  inquiry-to-delivery flow)
- White-label branding / client portals
- Marketing campaign / email-blast automation
- Artwork and file capture at intake, with proof approval
- Pickup and delivery coordination on the job

### Out of scope

Permanently excluded — not deferred. Each carries the reason it stays out, so the decision
does not get re-argued every release:

- **Accounting, invoicing, and payment processing** — CuevikSync tracks quotes through
  acceptance and records each job's invoice value for reporting, but raises no invoices;
  financials and collections stay in the customer's existing finance tools. Owning them would pull the product into regulated payment handling and reconciliation
  work that has nothing to do with capturing an inquiry and closing it.
- **Consultant-led or code-dependent setup** — any capability that the customer's own team
  cannot configure is out, however valuable. The moment setup needs custom code or a
  certified admin, CuevikSync has become the heavy tool it exists to replace (§6).
- **Client branches and forks** — a client-specific need is never met by a branch in shared
  code or a fork; it follows §6, Serving one customer in shared code.

## 5. Success Criteria

### Thin-Core Release Outcomes (Committed)

- **No dropped inquiries** — at least 99% of web-form submissions become inquiry records
  within 2 minutes. Of inquiries staff log by hand, at least 95% of phone and walk-in
  inquiries are logged the same business day and all by the next business day, and at
  least 95% of email inquiries are logged within 4 business hours, measured from the
  received time staff record. A missed inquiry is the one failure the product exists to
  prevent.
- **Pipeline visibility** — at least 90% of open opportunities have a next action due today
  or later, measured weekly from system records.
- **On-time delivery** — the team's on-time % in Production at a glance, measured against
  each job's original promised date, is higher in weeks 9–12 of live use than in weeks 1–4.
- **Adoption** — a team of 10 users or fewer — the size the first release is proven at —
  has every invited user signed in and its first live inquiry logged within 3 days of
  signup, with no custom development.
- **Commercial** — 10 businesses on paid subscriptions within 6 months of general
  availability, with monthly churn at or below 3%.

### Structural Criteria (Verifiable Before Launch)

Binary properties — true or false on any build, with no adoption data required. Stated at
product level; the mechanism that delivers each is ARCHITECTURE.md's to choose, but the
property itself is not negotiable.

- **Every open opportunity has an owner, a stage, and a next action** — a deal missing any
  of them, or a next action without a due date, cannot be saved.
- **One record per inbound submission** — a retried or redelivered submission resolves to
  the one inquiry it represents: never a duplicate, never a lost original.
- **Nothing is silently discarded** — a submission that cannot be processed surfaces for a
  human with its original content intact, rather than being dropped to keep the queue clean.
- **Permissions hold outside the UI** — a role restriction denies a direct request for the
  record, not merely hides the control that would have made it.
- **Each business's data is isolated** — no request from one business returns another
  business's records.
- **Every stage change is attributable** — who moved an opportunity, and when, is recorded
  and readable on the record.
- **A moved promised date stays visible** — changing a job's promised date keeps the
  original date and records the change, who made it, and when.
- **Customer-facing output requires a human action** — no artifact reaches a customer
  without a person explicitly sending it.
- **A new client onboards without code** — pipelines, the flat catalog, contact value
  lists, and roles are sufficient to configure a Print & Signage business. A client slice (§4) adds to a
  working setup; it is never a prerequisite for going live.

### Post-Thin-Core Outcomes (Owned Roadmap Targets)

- **Faster response** — median time from inquiry received to first response drops below 1 hour for teams using Human-approved AI.
- **Follow-through** — at least 90% of flagged cold deals get a follow-up action logged within 3 days.
- **Quote velocity** — median time from inquiry to quote sent in weeks 9–12 after
  Margin-safe estimating goes live is half that of weeks 1–4.

Ownership and measurement for Post-Thin-Core outcomes are tracked in the PRD carry-forward table.

## 6. Anti-Patterns

- **Serving one customer in shared code** — a need one business has MUST be met through
  that business's tenant configuration first; if configuration cannot meet it and no other
  business would use it, it MUST be built as an isolated client slice switched on for that
  business only, never as a client branch in shared code and never as a fork.
  Shared code that bends to one customer stops serving the vertical.
- **Treating customer personal data as ordinary app data** — each business's data MUST be
  isolated from every other business's, and the product MUST meet the privacy law of each
  market before businesses in that market use it. Inquiries carry customers' contact
  details; a leak ends a shop's trust, and ours.
- **AI that acts without a person** — AI MUST NOT send anything to a customer, change a
  record, or produce a figure the business relies on, such as a quote price, until a person
  accepts it; flags are advisory. A shop answers for every quote it sends.
- **Forcing structure onto simple work** — capturing an inquiry and moving it toward
  revenue MUST work out of the box; customization is optional depth, never a prerequisite,
  and the product adapts to the team's existing process rather than imposing one. A rigid
  workflow sends lean teams back to sticky notes.
- **Hiding slippage** — a promised date moved after a job is booked MUST remain visible as
  a change, and on-time rates MUST be measured against the original date; otherwise
  on-time rates look healthy while deliveries slip.
- **Reminder noise** — warnings and notifications SHOULD reach only someone who can act on
  them and stop once the action is done; alerts staff learn to ignore are worse than none.
- **Features without a named user problem** — every capability MUST trace to a problem a
  §2 persona has; a feature that cannot name one goes on the Wish-list, not the roadmap.
- **Trading the core guarantee for polish** — every inquiry that reaches the business MUST
  become a record; reliable intake beats new surface area, because a missed inquiry is the
  failure this product exists to prevent.
- **Rebuilding an enterprise CRM** — every feature MUST be usable by a lean team out of the
  box; the moment setup needs a consultant or an admin certification, CuevikSync has become
  the heavy tool it replaces.

## 7. Roadmap

### Release sequence

Phase 1 is the thin-core release plus Next.

- **Thin-core** — every §3 feature tagged Thin-core or Thin-core (partial), as §4 commits.
  Gate to Next: the §5 thin-core outcomes hold for the Print & Signage validation partner.
- **Next** — Zero-leak inquiry capture (automatic email, phone, and text capture),
  Margin-safe estimating, Quote to order (versions and estimate-based pricing),
  Business-defined fields, and No-chase automation. Margin-safe estimating starts only
  once its §3A decision is made. Gate to Later: the Quote velocity outcome (§5) holds.
- **Later** — Human-approved AI (including AI-drafted quotes, once its §3A trigger is
  written), Deadline early warning, Communication center (the full timeline), Clash-free
  scheduling (once its §3A depth decision is made), and Pipeline forecast.

### Vertical

CuevikSync is built for one vertical: **Print & Signage** — print shops and
printing-related businesses whose work runs from an inbound inquiry to a tracked job. Its
roadmap adds capability for that vertical as needs arise (§4); it does not expand into
other verticals.

A business outside Print & Signage is served by a separate Cuevik product, never by
generalizing this one. Such a product may start from a copy of this codebase's
foundation — auth, tenancy, UI shell — and then owns its code outright.

> **Rule:** Print & Signage behaviour is the product and belongs in code. What one client
> does differently from another follows §6, Serving one customer in shared code.

### Markets

CuevikSync launches in the USA first. Later markets follow paying demand: a market opens
where paying businesses are ready, and only after the product meets that market's privacy
law (§6).

### Print & Signage

The first production deployment targets **Print & Signage** operations — businesses
providing digital printing, commercial offset printing, wide-format output, signage,
promotional products, and design services. This vertical is selected because it
concentrates every core platform challenge in one place: high inquiry volume across
multiple channels, complex per-job quoting, artwork and specification approvals, and
production scheduling — all managed today by phone, email, and spreadsheets.

Print & Signage businesses do not all work the same way: a commercial offset printer, a
wide-format signage shop, and a promotional-products reseller each run a different process.
Configurable pipelines, the flat catalog, contact value lists, and roles let each run its
own process on the same system today, with Business-defined fields to follow.

### Validation

The Print & Signage validation partner (PRD §10) exercises each release before the next
starts:

- **Thin-core** — web-form and logged inquiries (Zero-leak inquiry capture); quotes from a
  flat catalog and free-form lines (Quote to order); jobs from booking to delivery, with
  overdue and on-time (Order-to-delivery tracking, Production at a glance); repeat orders
  (One-step reorder).
- **Next** — pricing with substrate and finishing options (Margin-safe estimating); quote
  versions (Quote to order).

## Glossary

Canonical object names used across CuevikSync docs. Informal synonyms in parentheses are
readable but not canonical — prefer the canonical term in specs.

### Shared terms

- **Thin-core** — the first release; §4 lists what it commits. A §3 feature tagged
  _Thin-core_ ships in full; _Thin-core (partial)_ ships only the part §4 states.
- **Roadmap** — planned after thin-core, in the order §7 sets; not committed.
- **Wish-list** — not planned; an item moves to the roadmap only with a named §2 persona
  problem.
- **Tenant** — one business using a Cuevik product, with its data isolated from every
  other tenant's. In CuevikFlow a tenant is a Firm; in CuevikSync, a Business.
- **Client slice** — a page or module built for one tenant's need that configuration
  cannot meet, switched on for that tenant only (§6).
- **Original date** — the first due or promised date set on a piece of work; kept when the
  date moves, and used for on-time rates (§6, Hiding slippage).
- **Past-due** — work whose current due or promised date has passed and is not complete.
- **Flag** — an advisory signal from a rule or AI that needs no approval; anything else AI
  produces waits for a person to accept it.

### CuevikSync terms

- **Business** — the Print & Signage company using CuevikSync; a Tenant.
- **Roles** — Owner/Admin, Sales Manager, Sales Rep, Office Administrator, and Operations.
- **Inquiry** — an inbound request at intake, before qualification, that keeps its source
  (informal: "lead").
- **Queue** — the one shared list where every Inquiry lands for triage.
- **Opportunity** — a qualified Inquiry in a Pipeline, with a Stage, an owner, a Next
  action, and an expected value and close date (informal: "deal").
- **Pipeline** — an ordered set of Stages an Owner/Admin defines; a Business can run
  several.
- **Stage** — a step in a Pipeline; Won and Lost are the terminal Stages.
- **Next action** — the next step on an Opportunity, with a due date; every open
  Opportunity has one.
- **Quote** — a commercial offer to a customer, made of catalog and free-form line items,
  with a status from draft to sent to accepted or declined.
- **Job** — execution work, created from a won Opportunity or booked directly, with item
  lines, an order date, and a promised date on each line (informal: "order").
- **Direct booking** — a Job booked with no Inquiry or Opportunity, such as a walk-in, a
  phone order, or a Reorder (§3A).
- **Promised date** — the date a job item line is promised to the customer; its original
  is kept when it moves (PRD-052).
- **On-time** — a Job completed on or before its original promised date; for several item
  lines, the latest original date counts.
- **Person** — an individual contact record, and the relationship entity an inquiry,
  opportunity, or job attaches to. An Organization alongside it is optional.
- **Organization** — a company or institution record. Optional on any Person, and the
  entity a Person may hold a role and duties within (informal: "company", "account").
- **Contact** — the user-interface umbrella term for Persons and Organizations shown
  together. Never a synonym for Person alone in a data model or in code.
- **Customer** — a Person or Organization the Business sells to; a prose term, not a
  record type.
