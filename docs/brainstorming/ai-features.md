# AI Features Strategy (Brainstorming Draft)

**Owner:** Viral Parikh
**Last updated:** 2026-07-12
**Status:** Draft

This is a brainstorming draft, not a committed roadmap or engineering spec — with one exception: items stamped "(Product decision, DATE)" or "Resolved" (see §8) are ratified and binding, even while the surrounding exploration stays draft. It maps where AI can be embedded across CuevikSync and the order in which to build it.

The intent is deliberate sequencing, not an exhaustive feature list:

- Capture high-leverage AI capabilities, not every possible feature
- Show where each one surfaces in the product
- Rank by business impact and data readiness so delivery is staged

Scoring criteria and rollout waves are defined in Sections 4 and 5.

---

## Contents

- [1) Product Positioning](#1-product-positioning)
- [2) Capability Inventory by Business Area](#2-capability-inventory-by-business-area)
- [3) AI Surface Map (Where AI Appears in Product)](#3-ai-surface-map-where-ai-appears-in-product)
- [4) Prioritization Framework](#4-prioritization-framework)
- [5) Recommended Rollout Waves](#5-recommended-rollout-waves)
- [6) Governance and Guardrails](#6-governance-and-guardrails)
- [7) Success Metrics](#7-success-metrics)
- [8) Product Decisions](#8-product-decisions)
- [9) Strategic Positioning Statement](#9-strategic-positioning-statement)

## 1) Product Positioning

AI is a shared platform capability, not a separate destination. Models, confidence handling, and policy live in an isolated AI layer (see system-modules.md); every high-value assist is surfaced inline in the module where the user already works — to reduce manual effort, improve decision quality, and accelerate cycle time.

Working principle:

- Every major screen should have at least one high-value AI assist.
- AI should support user decisions, not silently replace ownership.
- Predictions must include confidence and explainability where possible.
- AI operates only on in-scope data. No AI on financials, invoices, payments, or collections (out of product per PRODUCT.md §4). Vertical-specific AI (e.g. artwork defect detection) ships as print-template configuration, never platform code (PRODUCT.md §7).

## 2) Capability Inventory by Business Area

Terminology: this doc's "Lead" maps to the canonical objects in system-modules.md — an Inquiry at intake, an Opportunity once in the pipeline. "Conversion probability" (Lead Management) is the inquiry→qualified-opportunity prediction; "Opportunity win probability" (Sales Intelligence) is the distinct opportunity→closed-won prediction — two funnel stages, not the same score.

### Lead Management

- AI-generated lead summaries
- AI-based lead scoring
- Predict conversion probability
- Suggest best owner/assignee

### Intake and RFQ Processing

- RFQ / field extraction from unstructured inbound (emails, PDFs) — structures intent, quantity, deadline, service type

### Quoting and Pricing

- Quote drafting with recommended pricing and margins
- Suggest pricing
- Recommend target margin
- Detect missing quote line items

### Sales Intelligence

- Opportunity win probability prediction
- Cross-sell / upsell / smart product recommendations
- Reorder likelihood / dormant-customer flag (predicts repeat buyers overdue for their next order; feeds reorder acceleration in the Customer 360 profile — a one-click clone of the prior order into a new pipeline draft, i.e. a qualified opportunity, not a raw inquiry; system-modules.md)
- Cold-deal / stalled-deal flagging (Phase 1 slice — see §5)

### Communication Intelligence

- Automated follow-up email generation
- Meeting transcription and action-item extraction
- Conversation summarization

### Task and Workflow Automation

- Intelligent task creation
- Suggest next best action
- Intelligent workflow recommendations based on usage patterns

### Delivery and Operations

- Production delay prediction
- Project delay prediction

### Proofing and Prepress

- AI artwork defect detection (computer-vision check of uploaded artwork vs. order specs — dimensions, resolution, safe margins; advisory only, no auto-reject). Depends on the Documents & Customer Portal upload surface (Later, system-modules.md §9). The generic check is platform; print thresholds (bleed, Pantone, safe margins) are vertical-template config, not platform code (PRODUCT.md §7).

### Search, Analytics, and Leadership Insights

- Natural language CRM search (example: "Show overdue quotes over $10,000")
- Executive daily briefing with key metrics and priorities (depends on Dashboards & Operational Reporting, Must-have, plus accumulated transactional data; still not a Phase 1 quick win)
- AI-powered dashboard narratives explaining changes in sales, production, and revenue (depends on Dashboards & Operational Reporting, Must-have; the AI narrative layer itself is deferred — AI Copilot, Later)
- Revenue forecasting (base weighted forecast is a deterministic Dashboards rollup per system-modules.md — win-rate × expected value; AI adds an optional predictive adjustment only)

## 3) AI Surface Map (Where AI Appears in Product)

> This map is cross-phase — it shows where AI surfaces across the product over time,
> not all at launch. Phase 1 ships only the §5 Required Slice: the **Cold-deal flag**
> (Pipeline / Deal) and **Suggest next action** (Tasks). Every other surface below follows
> the Wave 1–3 sequencing in §5 — that section is the single source for what ships when.

### Lead

- Summarize inquiry
- Predict conversion
- Suggest owner

### Pipeline / Deal

- Cold-deal / stalled-deal flag
- Win probability

### Quote

- Suggest pricing
- Recommend margin
- Detect missing items

### Customer

- Reorder likelihood / dormant-customer flag
- Upsell opportunities

### Project

- Delay prediction

### Proof / Artwork

- Artwork defect check on upload

### Tasks

- Suggest next action
- Auto-create tasks from conversations/meetings

### Dashboard

- Daily executive summary
- Narrative explanation of metric movement

## 4) Prioritization Framework

Waves (§5) are hand-sequenced by data readiness and PRODUCT scope; for contested slots, this lightweight heuristic breaks ties — it is not the primary sequencer. Score Impact, Frequency, and Data Readiness 1–5 (5 = most favorable); score Implementation complexity 1–5 (5 = most complex — it is the divisor, so simpler use cases score higher):

- Business impact (revenue, margin, repeat business, cycle time)
- User frequency (daily/weekly usage)
- Data readiness (availability and quality)
- Implementation complexity (model + integration + UX)

Suggested scoring formula:

- Priority Score = (Impact × Frequency × Data Readiness) / Complexity

Explainability and trust is a gate, not a formula term: any use case driving a client-facing or financial-adjacent action must clear a minimum explainability bar and stay human-in-the-loop (§6) regardless of score. A high score never overrides the governance gate.

The Wave 1–3 staging in §5 is deliberately hand-sequenced by data readiness and PRODUCT scope, not by formula output. The formula is a tie-breaker for contested wave slots, not the primary sequencer — and a capability with a direct line to a committed PRODUCT.md §5 KPI outranks a marginally higher formula score (see §8, first-release set).

## 5) Recommended Rollout Waves

### Post-Thin-Core Candidate Slice (AI Sales Assist)

Per PRODUCT.md and PRD thin-core scoping, this is the minimal AI recommended for the next release after thin-core validation (this is narrower than all of Wave 1):

- Cold-deal flagging — on a hybrid path: a deterministic staleness rule at launch (a new tenant has no closed-deal history to train on), upgrading to a learned risk model as outcome data accumulates. Labeled honestly per maturity — Phase 1 surfaces it as "auto-flagged" (a staleness rule, not yet AI); "AI-flagged" is reserved for the learned model. The PRODUCT.md §5 metric reads "flagged cold deals" so it does not hang on the label (Product decision, 2026-07-12).
- Follow-up / next-action drafting.

AI-drafted quotes and missed-call recovery remain staged after this slice: missed-call recovery depends on a telephony connector (Later). AI-drafted quotes depend on RFQ / field extraction, which is demand-driven — not on the scheduled roadmap and built only if a concrete requirement arises (see §8). The Wave 1–3 lists below are the fuller AI roadmap — sequenced, but not all near-term releases.

### Wave 1 (Quick Wins, High Adoption)

- Lead summaries
- Follow-up / next-action drafting (Post-Thin-Core candidate slice — see above)
- Natural language search

### Wave 2 (Decision Support)

- Lead scoring and conversion prediction
- Quote pricing and margin recommendations
- Missing-item detection in quotes
- Owner / assignee suggestion
- Conversation summarization
- Intelligent task creation

### Wave 3 (Advanced Predictive & Analytics Layer)

- Reorder likelihood / dormant-customer flag (needs per-customer order-history volume)
- Opportunity win probability
- Production/project delay prediction
- Revenue forecasting (base is a deterministic Dashboards rollup, Must-have; AI = optional predictive adjustment only, Wave 3)
- Workflow recommendations from behavioral patterns
- Cross-sell / upsell recommendations
- Artwork defect detection (computer-vision preflight; depends on the Later portal upload surface — generic check platform, print thresholds vertical config)
- Executive daily briefing (relocated from Wave 1; depends on Dashboards, Must-have, plus accumulated data — still not a quick win)
- AI-powered dashboard narratives (depends on Dashboards, Must-have; AI narrative layer deferred to AI Copilot, Later)
- Meeting transcription & action-item extraction (depends on calendar / meeting integration, Later)

## 6) Governance and Guardrails

### Human-in-the-loop

- AI drafts, recommends, and flags. No client-facing action (email, quote, proof, message) is sent without explicit human review and approval — regardless of confidence. Full automation is limited to internal, non-client-facing steps (PRODUCT.md §6).

### Transparency

- Show confidence level and key drivers for predictions when feasible.

### Data and privacy

- Enforce role-based access and PII-safe prompt/context handling.

### Quality controls

- Track precision/recall where relevant.
- Add feedback controls: Accept, Edit, Reject for generated outputs.

## 7) Success Metrics

AI metrics ladder up to PRODUCT.md §5 outcomes — each AI metric must move one of the owned Post-Thin-Core targets:

- First-response time: median inquiry-to-first-response < 1 hour for teams using the AI assistant (PRODUCT.md §5). Driver: follow-up / next-action drafting, cold-deal flagging.
- Quote velocity: median inquiry-to-quote-sent reduced >= 50% vs the team's prior process (PRODUCT.md §5). Driver: planned service-catalog depth + estimation + quote workflow improvements (structured quoting replacing spreadsheets) — a non-AI lever. AI-drafted quotes (demand-driven, Post-Thin-Core) would add further gains but are not required to hit a 50% reduction.
- Cold-deal follow-through: >= 90% of flagged cold deals get a follow-up logged within 3 days (PRODUCT.md §5). Driver: cold-deal flagging.
- Capture reliability: AI extraction must not lower the >= 99% capture-within-2-min bar (PRODUCT.md §5) or add intake latency.
- Margin improvement on quoted deals (pricing / margin recommendations).
- Conversion and win-rate uplift (lead scoring, win-probability).
- Reduction in delivery and production delays (operational delay prediction).
- Adoption: feature usage, acceptance rate, override rate.
- Repeat-order rate uplift from dormant-customer flags — contingent on order-history volume (see §2).

## 8) Product Decisions

Resolved:

- AI Sales Assist slice approved for Post-Thin-Core prioritization (2): cold-deal flagging (rule-based staleness at launch — surfaced as "auto-flagged", not "AI-flagged" — upgrading to a learned model as data accumulates) and follow-up / next-action drafting (LLM). RFQ extraction and AI-drafted quotes are explicitly out of thin-core — demand-driven future enhancements, built only if a concrete requirement arises. (Resolved 2026-07-06; RFQ scope confirmed 2026-07-12; cold-deal labeling corrected 2026-07-12.)

Still open:

- What minimum confidence threshold is required before showing predictions?
- Which internal, non-client-facing actions may be fully automated? (Client-facing actions are recommendation/approval-only — locked by PRODUCT.md §6.)
- What feedback loop will retrain/improve model outputs over time?

## 9) Strategic Positioning Statement

CuevikSync should position AI as an embedded productivity and intelligence layer across CRM, quoting, delivery, and operations. The goal is measurable operational leverage, not AI for novelty.
