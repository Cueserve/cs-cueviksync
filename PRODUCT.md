# PRODUCT.md — Product Concept

**Owner:** Product Owner
**Last updated:** 2026-07-01
**Source of truth for:** what CuevikSync is and why it exists — an AI-powered CRM that turns inquiries into revenue for lean businesses.

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

AI-powered CRM platform to accelerate inquiry-to-revenue workflows for modern businesses.

### Objective

CuevikSync is a Customer Relationship Management (CRM) platform that helps businesses
turn inquiries into prospects, manage contacts and companies, and send quotations — all
in one place. It also includes AI-powered workflows that automate follow-ups, suggest
next actions, and keep the sales process moving smoothly.

### Description

CuevikSync is an AI-powered CRM built for small and mid-sized businesses (SMBs) like
professional practices, field-service teams, and order-fulfillment operations. It
captures every client inquiry — calls, email, web forms, or walk-ins — into one
dashboard, so no lead leaks and no revenue slips away. It adapts to how a business
already runs instead of forcing it into a rigid tool. Built-in AI handles follow-ups,
recommends the next move, and flags deals going cold, cutting admin time and freeing the
team to close more business.

## 2. Target Users

- **Business owner / founder** — wears the sales hat but has no single view of the
  pipeline, so inquiries slip through and revenue is left on the table.
- **Sales manager** — lacks visibility into which deals are progressing or stalling, so
  cannot coach the team or forecast reliably.
- **Office administrator** — the person who captures inbound inquiries; needs every lead
  logged at intake so nothing is lost.

## 3. Purpose

Small and mid-sized businesses do not lose revenue from a lack of demand. They lose it
because incoming customer inquiries slip through the cracks. Requests scatter across
phone calls, emails, web forms, and walk-ins, with no single system to catch and track
them. While large customer relationship tools exist, they are built for massive corporate
sales teams. They are too heavy, too rigid, and too expensive for a lean team to actually
use.

CuevikSync changes this by giving businesses one simple place to capture every single
inquiry and turn it into revenue. Instead of forcing you to change how you work, the
platform adapts to your existing process. It seamlessly handles professional client
cases, mobile field services, and high-volume order fulfillment. Best of all, CuevikSync
uses built-in AI to handle the manual follow-up work that a busy, lean team simply does
not have the time to do. It ensures no lead is ever forgotten.

## 4. Features

- **Omnichannel inquiry capture & triage** — a shared queue that pulls every lead (phone,
  email, text, web forms, walk-ins) into one place and auto-prioritizes urgent or
  high-intent messages, so nothing is lost and hot leads surface first.
- **Unified relationship management** — connected contact and company records that map
  people across the multiple organizations they belong to, with automatic duplicate
  detection that keeps data clean and reveals cross-sell connections.
- **Adaptive pipelines** — configurable pipelines that let one lean team run different
  processes side by side (case files, field estimates, batch orders) without custom code.
- **Quotation & order generation** — create, send, and track quotes and orders, including
  AI that drafts them from unstructured client messages and prior purchase history.
- **Unified communication timeline** — one chronological feed per contact combining
  calls, emails, texts, and status updates, so staff have full context before they reply.
- **AI sales assistant** — automated follow-ups, missed-call recovery, suggested next
  actions, and cold-deal flagging, so a busy team's follow-through runs itself.
- **Visibility & reporting** — pipeline and performance insight so managers can forecast
  and coach.
- **Configurability & permissions** — industry-specific custom fields plus role-based
  access that keeps interfaces simple and sensitive data hidden.

## 5. Scope (In / Out)

### In scope

- Omnichannel inquiry capture and triage into a single shared queue
- Unified contact and company relationship management with duplicate detection
- Adaptive, configurable pipelines (no custom code)
- Quotation and order generation, including AI-drafted quotes
- Unified per-contact communication timeline
- AI sales assistant: follow-ups, missed-call recovery, next-action suggestions, and
  cold-deal flagging
- Pipeline and performance reporting
- Configurable custom fields and role-based access

### Out of scope

Deferred to upcoming releases:

- AI scheduling / appointment booking
- Mobile field-capture app (voice dictation) — no native mobile surface in this release
- Recurring account & contract management (post-sale account management, outside the
  inquiry-to-revenue funnel)
- White-label branding / client portals
- Marketing campaign / email-blast automation

Not part of the product:

- Accounting / invoicing / payment processing — CuevikSync tracks quotes and orders, not
  financials or collections

## 6. Success Criteria

- **No dropped inquiries** — at least 99% of inbound inquiries across all channels are
  captured as a record within 2 minutes of arrival.
- **Faster response** — median time from inquiry received to first response drops below 1
  hour for teams using the AI assistant.
- **Pipeline visibility** — 100% of active deals show a current stage and a next action;
  zero deals with no owner or next step.
- **Follow-through** — at least 90% of AI-flagged cold deals get a follow-up action logged
  within 3 days.
- **Adoption** — a lean team (10 users or fewer) is fully onboarded and running its live
  pipeline within 3 days of signup, with no custom development.
- **Quote velocity** — median time from inquiry to quote sent reduced by 50% versus the
  team's prior process.

## 7. Anti-Patterns

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
