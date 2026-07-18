# GitHub Copilot instructions for CuevikSync

GitHub Copilot reads this file for repository-wide guidance regardless of Git host.

## Shared rules live in one place

All project rules — coding conventions, scope boundaries, banned patterns, testing,
escalation, agent behavior, off-limits files, and workflow — are defined in
[docs/AI-TOOL-GUIDE.md](../docs/AI-TOOL-GUIDE.md). Follow it. Do not duplicate those rules
here; if a rule changes, update `docs/AI-TOOL-GUIDE.md`, not this file.

## Copilot-specific config

- **Suggestion boundaries:** do not suggest code that reaches Postgres directly from the
  browser, bypasses Row-Level Security with a hand-written `tenant_id` filter, introduces an
  Object-Relational Mapper, uses the Pages Router, or hand-rolls input validation instead of
  Zod. These are banned patterns (AI-TOOL-GUIDE §4).
- **Stack fidelity:** complete code using only the approved stack in `docs/TECH-STACK.md`
  (Next.js 16 App Router, React 19, `@supabase/supabase-js`, Zod, Tailwind 4, shadcn/ui,
  Vitest, Playwright). Do not autocomplete imports for packages not listed there.
- **Secrets:** never generate or inline secret values; server-only secrets never carry the
  `NEXT_PUBLIC_` prefix (AI-TOOL-GUIDE §9).
