---
description: Run step 3's approved plan.md unattended in a cloud session — launches it from a local session, executes it inside the cloud one
allowed-tools: Bash, Read, Glob, Grep, Write, Edit, Agent, Skill, AskUserQuestion
argument-hint: "<issue#> | <folder>"
---

# Execute

The runner for step 3 of the three-step process ([docs/work/README.md](../../../docs/work/README.md)).
It is not a fourth step: it writes no artifact. It takes an approved `plan.md` and gets it
executed in a cloud session, so the build runs without you and stops where the plan hands
control back.

**One command, two modes.** Which one runs depends on where it runs:

```sh
echo "$CLAUDE_CODE_REMOTE"
```

`true` → **cloud mode**. Anything else → **local mode**. Never infer the mode any other way.

Arguments (required): `$ARGUMENTS` — an issue number (`41` or `041`) or a folder name
(`041-person-and-organization-records-PRD-008`). **Empty → stop and ask for one.** Unlike
`/work:3-plan`, this command does not pick a default: starting a cloud run is too consequential
to guess.

---

## Phase 0 — Resolve the folder (both modes)

1. A number → zero-pad it to three digits and match `docs/work/<NNN>-*/`. Exactly one match, or
   stop and list what matched.
2. Anything else → `docs/work/$ARGUMENTS/` must exist, or stop.
3. `plan.md` must exist in that folder, or stop and say to run `/work:3-plan`.
4. `plan.md` reads `**Status:** Approved`. `Draft` → stop, and say to approve it. Checked in
   both modes: a cloud session never builds from a plan the human has not approved.

Read `plan.md` in full. Nothing else from the folder — the plan is the only input, as in every
other step.

## Local mode — gate, then launch

Every gate is hard. Fail one → say which and stop. Launch nothing.

1. **The cloud will clone what you have.** `git fetch origin`, then: the current branch is
   `main`, `git rev-parse HEAD` equals `git rev-parse origin/main`, and
   `git status --porcelain -- <folder>` is empty. A cloud session clones the remote at your
   current branch, not your disk — an unpushed plan is a plan it never sees.
2. **No previous run.** The plan's `**Branch:**` must not exist on origin:
   `git ls-remote --heads origin <branch>` prints nothing. A branch there means a run already
   happened; stop and report it rather than start a second one on top.
3. **The card reads `Ready`.** Find it with
   `gh project item-list 17 --owner Cueserve --format json --limit 100 --jq '.items[] | select(.content.number==<n>) | "\(.id) \(.status)"'`.
   `Working` usually means a run is already live — ask before going on. Anything else other
   than `Ready` → stop and report it.

Then, in order:

1. **Set the card to `Working`** — the cloud session cannot (cloud mode, rule 4):

   ```sh
   gh project item-edit --id <item id> --project-id PVT_kwDOAWKwws4BgZo3 --field-id PVTSSF_lADOAWKwws4BgZo3zhay328 --single-select-option-id f75ad846
   ```

2. **Launch:**

   ```sh
   claude --cloud "/work:4-execute <folder>"
   ```

   The cloud environment comes from `remote.defaultEnvironmentId` in
   `.claude/settings.local.json`; there is no per-run flag for an Anthropic-hosted environment.
   Missing → stop and say to run `/remote-env` once in a standalone `claude` terminal.

3. **Report** the session URL the launch printed, and stop. Following the run is yours, at
   claude.ai/code or in the Claude app.

Both writes prompt. Let them — the launch prompt is the last human check before an unattended
run.

## Cloud mode — execute the plan

Execute `plan.md` under its own **Execution contract**. These rules override it where they
disagree, because nobody is watching this session:

1. **Never ask a question.** Anything that would need an answer is a contradiction: append it to
   `plan.md` §Deviations, open the PR as a **draft** titled with what blocked, and stop.
2. **Preflight is yours.** If the plan has a "Before task 1" section, run it. Any step fails →
   report and stop, before task 1, with no PR. Do not work around a missing prerequisite.
3. **Run the waves** as the plan lists them, dispatching each wave's tasks in parallel
   (`superpowers:dispatching-parallel-agents`), and honor every plan rule about tasks that must
   not run concurrently.
4. **Skip every `gh project` command.** The cloud GitHub proxy cannot reach Projects v2, so a
   card move here only fails. Local mode already set `Working`; the report tells the human to
   set `Reviewing`.
5. **Push the plan's branch before any stop** — a normal `git push -u origin <branch>`, never a
   force-push. Work left only on this VM is lost when the session expires.
6. **Stop at the first Delivery step that hands control to the human** — merging, applying a
   migration, anything the human does. No such step → open the code PR as the plan's Delivery
   describes.
7. **Regenerate the folder `README.md`** on the plan's branch, to the template in
   [docs/work/README.md](../../../docs/work/README.md): **Board** reads `Working`, and **Next**
   says exactly what the human does now. Commit and push it with the rest.

### Report

End with, and nothing after:

- every PR opened, by URL, and whether it is a draft
- the plan's branch and its head commit
- every §Deviations entry this run appended, or "none"
- what the human does next, including setting the card to `Reviewing` once a code PR is open
