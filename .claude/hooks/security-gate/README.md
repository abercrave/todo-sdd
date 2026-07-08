# security-gate

Deterministic enforcement of CLAUDE.md's rule that **security-sensitive changes
must be reviewed by the `security-review` subagent before a turn ends**. Unlike
the advisory `PreToolUse` reminder (which the model can proceed past), this gate
blocks turn completion, so it does not depend on the model's judgment or on
which teammate is driving. Checked into the repo, so everyone gets it.

## How it works — a hook chain (wired in `.claude/settings.json`)

1. **`mark-review-owed.sh`** — `PostToolUse(Edit|Write)`. If the edited path is
   security-sensitive, appends a line to `.claude/.security-review-owed` (the
   "marker"). Runs for main-session *and* subagent edits.
1b. **`mark-review-owed-bash.sh`** — `PostToolUse(Bash)`. Dependency changes in
   this repo are made via `pnpm add`/`pnpm remove` (a Bash command), not
   Edit/Write, so step 1 never sees them. This detector reads
   `tool_input.command` instead of `tool_input.file_path` and marks the same
   marker when the command matches `pnpm add`/`pnpm remove`/`pnpm rm`.
2. **`clear-review-owed.sh`** — `SubagentStop`. Deletes the marker when a
   subagent with `agent_type == "security-review"` finishes.
3. **`gate-stop.sh`** — `Stop`. If the marker exists, `exit 2` to block the turn
   from ending and tell the model to run the `security-review` subagent.

Loop termination: running `security-review` clears the marker, so the next Stop
passes. A cooperating agent stops after exactly one forced continuation.

The `security-review` subagent has `Edit`/`Write` disallowed, so it can never
trip its own gate.

## Sensitive paths (marked)

Prisma schema/migrations, `shared/src/**` (Zod validation — trust boundary),
auth/credential-ish names (`auth`, `login`, `jwt`, `token`, `password`,
`session`, `crypto`), `.env*` and `*secret*`, and dependency manifests
(`package.json`, `pnpm-lock.yaml`).

## Known limitations — this is a process gate, not a hard security boundary

These were surfaced by a security review of the gate itself; read them before
citing the gate as proof a change "must" have been reviewed:

- **Fails open.** Any error (no `python3`, malformed payload, missing dir) makes
  the Stop hook exit non-2, so the turn is allowed to end. This is deliberate —
  failing *closed* would wedge the session — but it means the gate provides no
  guarantee under a broken environment.
- **Lexical matching only.** Sensitivity is judged by path substrings, so it
  over-flags (`author.ts`) and, more importantly, misses security-relevant files
  whose names don't contain the keywords (`Dockerfile`, CI YAML, CORS/helmet
  config). Treat the matched set as a floor, not a complete list.
- **Clearing proves a review *ran*, not that it was thorough.** The marker is
  removed whenever a `security-review` subagent stops.
- **Escape hatches** if a review genuinely cannot clear the marker: interrupt
  (Esc), or `rm .claude/.security-review-owed` by hand.
- **The gate does not guard edits to itself.** Changes to these scripts or to
  `.claude/settings.json` are not in the sensitive set (adding them would mean
  every gate tweak requires a review). Review gate changes manually.
- **The Bash detector only covers `pnpm add`/`pnpm remove`.** Other
  Bash-originated sensitive-path changes — `prisma migrate dev` (Prisma
  schema/migrations), editing `.env` via shell redirection, `npm`/`yarn`
  instead of `pnpm` — still bypass both hooks entirely. Self-trigger
  `security-review` for those manually; don't assume silence means clean.

## Extending

Add path patterns to the `case` in `mark-review-owed.sh` (Edit/Write, matches
on `tool_input.file_path`) or `mark-review-owed-bash.sh` (Bash, matches on
`tool_input.command`) depending on which shape the triggering tool call has.
Re-run the mock-payload tests (pipe a JSON payload with `cwd` +
`tool_input.file_path` or `tool_input.command` into each script and assert on
the marker / exit code) before relying on changes.
