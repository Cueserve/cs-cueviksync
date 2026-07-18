# Reconciliation: ARCHITECTURE.md — 2026-07-14

**Change summary:** Clarified in §1, §4, §5, and §7 that the caller's Supabase JWT is carried in an httpOnly cookie and forwarded server-side to Postgres for RLS. Credential-transport wording only — no posture change: §7's SameSite + anti-CSRF story and NFR-007 bcrypt are unaffected, and §4's Authentication (first-party IdP) framing is unchanged.
**Branch:** docs/update/architecture
**PR/MR:** <link once opened>

## Downstream checklist

- [ ] `AI-TOOL-GUIDE.md` — review-only: The cookie-transport detail adds no new AI-tool constraint beyond the existing rules (never use service-role on authenticated user paths; JWT drives RLS). Validate no update is needed when it is authored; if a session-handling usage rule is warranted, that belongs in TECH-STACK.md, not here. Currently `Planned`.
      Next action: confirm during Step-06 authoring; if it already exists, run `/proj-init-doc-update AI-TOOL-GUIDE.md`.

## Completed

- [x] `TECH-STACK.md` — required-update **done (2026-07-18)**: session mechanism now recorded — `@supabase/ssr` cookie-based handling (§4) and the `httpOnly`/`Secure`/`SameSite` cookie flags (§6). The §5 authorization-locus decision was also reconciled to RLS-primary, matching ARCHITECTURE §4; the former §5 reconciliation note was retired as no contradiction remains.
