#!/usr/bin/env node
/**
 * PreToolUse guard: refuse Bash commands that write to `main`, rewrite already-pushed
 * history, or merge/close a Pull Request.
 *
 * Why this exists at all: `main` IS protected by an active repository ruleset
 * (`pull_request`, `non_fast_forward`, `deletion`, `required_linear_history`) — but its
 * sole bypass actor is the `OrgOwnerTeam` team with `bypass_mode: always`, and this
 * repo's only developer is an active maintainer of that team. Verified against the
 * GitHub API on 2026-09-18. The practical consequence: `gh pr merge` or
 * `git push origin main` run with this machine's credentials SUCCEEDS — GitHub does not
 * refuse it. Server-side protection is real for everyone except the one account an
 * agent actually runs as, so the guarantee has to be re-established locally, here.
 *
 * Scope: this constrains commands Claude Code runs through its Bash tool. It has no
 * effect on the user's own terminal, the VS Code git UI, or github.com. The break-glass
 * path stays fully open — it just moves out of the agent's hands.
 *
 * Fails CLOSED, unlike its sibling `block-applied-migration.mjs`. That guard exits 0 on
 * doubt because a broken guard must not make migration authoring impossible, and its
 * failure mode is a silently-skipped push. Here the failure mode is an unreviewed write
 * to the shared trunk, so an unparseable `git push` is denied rather than waved through.
 * One exception: unparseable stdin exits 0, because at that point the hook contract
 * itself is broken and denying every Bash command is worse than the risk it averts.
 *
 * Force pushes are denied on EVERY branch, not just `main` — including
 * `--force-with-lease`. The lease variant is safer only in that it refuses when the
 * remote moved since the last fetch, which protects a second developer's work; there is
 * no second developer here. It does nothing about the actual risk: an overnight run
 * rewriting its own branch orphans the review comments left on it that morning, and
 * `dismiss_stale_reviews` already means any push costs an approval. Squash-merge plus
 * `required_linear_history` means the agent gains nothing from rebasing anyway.
 *
 * NOT exact, and not trying to be. Segment splitting is a plain regex, so a literal like
 * `echo "git push origin main"` trips it (denies — the safe direction), and a
 * sufficiently indirect construction (`$VAR`, `eval`) slips past. This guards against an
 * agent's mistake at 3am, not against an adversary holding the same credentials.
 */
import { execFileSync } from "node:child_process";

const PROTECTED = new Set(["main", "refs/heads/main"]);

function read(stream) {
  return new Promise((resolve) => {
    let buf = "";
    stream.setEncoding("utf8");
    stream.on("data", (d) => (buf += d));
    stream.on("end", () => resolve(buf));
  });
}

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
}

/** Current branch, or null when git cannot answer (caller must fail closed). */
function currentBranch() {
  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

/** Destination ref of a refspec: `+feat/x:main` -> `main`, `:main` -> `main`, `main` -> `main`. */
function destOf(refspec) {
  const r = refspec.replace(/^\+/, "");
  const parts = r.split(":");
  return parts.length > 1 ? parts[parts.length - 1] : r;
}

function checkGhPr(seg) {
  const m = seg.match(/(^|\s)gh\s+pr\s+(merge|close)\b/);
  if (m) {
    deny(
      `\`gh pr ${m[2]}\` is blocked for the agent. Merging or closing a PR is the human ` +
        `review decision this whole workflow exists to preserve, and GitHub will NOT stop ` +
        `it — the account this runs as bypasses the branch ruleset via OrgOwnerTeam. ` +
        `Leave the PR open as a draft and report it; the user merges or closes it.`,
    );
  }
  if (/(^|\s)gh\s+api\b/.test(seg) && /pulls\/[^/\s]+\/merge/.test(seg)) {
    deny(
      `This merges a PR through \`gh api\`, blocked for the same reason as ` +
        `\`gh pr merge\`. The user merges.`,
    );
  }
}

function checkGitPush(seg) {
  const m = seg.match(
    /(^|\s)git\s+((?:-C\s+\S+\s+|--\S+\s+|-\S+\s+)*)push\b(.*)$/,
  );
  if (!m) return;

  const rest = (m[3] || "").trim();
  const args = rest.length ? rest.split(/\s+/) : [];
  const flags = args.filter((a) => a.startsWith("-"));
  const positional = args.filter((a) => !a.startsWith("-"));

  const isForce = flags.some(
    (f) =>
      f === "--force" ||
      f.startsWith("--force-with-lease") ||
      f === "--force-if-includes" ||
      /^-[a-zA-Z]*f[a-zA-Z]*$/.test(f),
  );
  if (isForce) {
    deny(
      `Force pushes are blocked on every branch, including \`--force-with-lease\`. ` +
        `Rewriting a pushed branch orphans any review comments already left on its PR, ` +
        `and \`dismiss_stale_reviews\` means the push costs an approval regardless. ` +
        `Add a new commit on top instead — squash-merge flattens it at merge time. ` +
        `If the branch is behind \`main\`, use \`git merge origin/main\`: a merge commit ` +
        `on a feature branch does not violate required_linear_history, because the PR ` +
        `squash-merges.`,
    );
  }

  if (flags.some((f) => f === "--all" || f === "--mirror")) {
    deny(
      `\`git push --all\` / \`--mirror\` pushes every ref, including \`main\`. Push one ` +
        `named feature branch instead: \`git push -u origin <branch>\`.`,
    );
  }

  const isDelete =
    flags.some((f) => f === "--delete") ||
    flags.some((f) => /^-[a-zA-Z]*d[a-zA-Z]*$/.test(f));

  const refspecs = positional.slice(1); // drop the remote

  if (refspecs.some((r) => r.startsWith("+"))) {
    deny(
      `A leading \`+\` on a refspec is a force push. See the force-push rule: add a ` +
        `commit instead of rewriting history.`,
    );
  }

  if (refspecs.length === 0) {
    const branch = currentBranch();
    if (branch === null) {
      deny(
        `\`git push\` with no refspec, and the current branch could not be determined, so ` +
          `the target is unknown. This guard fails closed. Push explicitly: ` +
          `\`git push -u origin <branch>\`.`,
      );
    }
    if (PROTECTED.has(branch)) {
      deny(
        `This pushes the current branch \`${branch}\` — the protected trunk. All changes ` +
          `land through a PR (CONTRIBUTING.md "Direct-push rule"). Create a feature branch ` +
          `and push that instead.`,
      );
    }
    return;
  }

  for (const r of refspecs) {
    let dest = destOf(r);
    if (dest === "HEAD") {
      const branch = currentBranch();
      if (branch === null) {
        deny(
          `Refspec \`${r}\` targets HEAD and the current branch could not be determined. ` +
            `This guard fails closed. Name the branch explicitly.`,
        );
      }
      dest = branch;
    }
    if (PROTECTED.has(dest)) {
      deny(
        isDelete
          ? `This deletes the remote \`main\`. Never.`
          : `This writes directly to \`main\` (refspec \`${r}\`). All changes land through ` +
              `a PR (CONTRIBUTING.md "Direct-push rule"), and GitHub will NOT refuse it — ` +
              `the account this runs as bypasses the branch ruleset via OrgOwnerTeam. ` +
              `Push a feature branch and open a draft PR instead.`,
      );
    }
  }
}

const raw = await read(process.stdin);

let input;
try {
  input = JSON.parse(raw);
} catch {
  process.exit(0); // hook contract broken — see header
}

const command = String(input?.tool_input?.command ?? "");
if (!command.trim()) process.exit(0);

// Crude on purpose (see header): over-splitting is harmless for detection.
for (const seg of command.split(/(?:&&|\|\||[;\n|])/)) {
  const s = seg.trim();
  if (!s) continue;
  checkGhPr(s);
  checkGitPush(s);
}

process.exit(0);
