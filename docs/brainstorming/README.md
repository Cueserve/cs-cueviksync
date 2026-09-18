# Brainstorming

Pre-decision exploration. Nothing here is authoritative.

A file in this folder carries `**Status:** Draft` in its header and may contradict the
source-of-truth documents in `docs/` — that is what it is for. When a decision here is
ratified, it moves into the document that owns it (PRODUCT, PRD, ARCHITECTURE, TECH-STACK) as
a standalone documentation change, and the draft is either deleted or annotated to say where
the decision now lives.

**Do not cite a file in this folder as a reason to write code.**

This is not `docs/work/`. A folder there is a **committed** work item — it has a GitHub issue
number, an approved intent, and a route to merge. A file here is open exploration of a topic
with none of those. The boundary is the decision: while the question is still whether a thing
should exist, it belongs here; once it should, it moves to `/intent` and a work folder.

See [docs/PROJECT-STRUCTURE.md](../PROJECT-STRUCTURE.md) §5 for the full document-kind table —
which folder each kind of document lives in, and which kinds are transient.
