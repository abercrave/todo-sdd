#!/usr/bin/env bash
#
# PostToolUse(Bash) — security-gate step 1b (Bash-originated dependency changes).
#
# mark-review-owed.sh only sees Edit/Write payloads (tool_input.file_path), so
# it never fires for dependency changes made via `pnpm add`/`pnpm remove` —
# the primary way package.json/pnpm-lock.yaml get modified in this repo. This
# script reads tool_input.command instead and marks the same review-owed
# marker, so the Stop gate treats Bash-originated and Edit/Write-originated
# dependency changes identically.
#
# Always exits 0: PostToolUse runs after the command has already executed, so
# there is nothing to block here — we only record state. Fails open (a broken
# env leaves no marker) rather than wedging the session.
set -euo pipefail

payload=$(cat)

eval "$(printf '%s' "$payload" | python3 -c '
import sys, json, shlex
d = json.load(sys.stdin)
print("command=" + shlex.quote(d.get("tool_input", {}).get("command", "")))
print("cwd=" + shlex.quote(d.get("cwd", ".")))
')"

[ -n "${command:-}" ] || exit 0

case "$command" in
  *pnpm\ add\ *|*pnpm\ remove\ *|*pnpm\ rm\ *) reason="dependency manifest (pnpm add/remove via Bash)" ;;
  *) exit 0 ;;
esac

# Anchor to the project dir (matches how settings.json invokes this script), not
# the payload cwd, so mark-time and stop-time always agree on the marker path.
marker="${CLAUDE_PROJECT_DIR:-$cwd}/.claude/.security-review-owed"
mkdir -p "$(dirname "$marker")"
printf '%s\t%s\n' "$reason" "$command" >> "$marker"
exit 0
