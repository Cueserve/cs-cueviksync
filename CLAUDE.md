# CLAUDE.md — Claude Code adapter for CuevikSync

Claude Code reads this file automatically from the repo root.

## Shared rules live in one place

All project rules — coding conventions, scope boundaries, banned patterns, testing,
escalation, agent behavior, off-limits files, and workflow — are defined in
[docs/AI-TOOL-GUIDE.md](docs/AI-TOOL-GUIDE.md). **Read it first and follow it.** Do not
duplicate those rules here; if a rule changes, update `docs/AI-TOOL-GUIDE.md`, not this file.

## Claude Code-specific config

- **Context sources:** treat `docs/ARCHITECTURE.md`, `docs/TECH-STACK.md`, and
  `docs/AI-TOOL-GUIDE.md` as the source of truth. Read the relevant one before proposing a
  change; never derive architecture or stack decisions from memory.
- **Editing source-of-truth docs:** changes to anything in `docs/` or `CONTRIBUTING.md` go
  through `/proj-init-doc-update <document>`, not inline edits during feature work.
- **Commands:** run only the commands defined in `CONTRIBUTING.md` (Tooling layer). Do not
  invent scripts or introduce a tool not in `docs/TECH-STACK.md`.
- **Secrets:** never read, print, or write `.env*` or any file holding the Supabase
  service-role key or other credentials (see AI-TOOL-GUIDE §9).
