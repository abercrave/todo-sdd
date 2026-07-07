#!/usr/bin/env bash
#
# Stop — security-gate step 3 of 3.
#
# When the main agent tries to finish its turn, block if a security-review is
# still owed (marker present). Exit 2 feeds the message on stderr back to the
# model and forces another turn, where it must run the security-review subagent.
#
# Loop termination: running security-review clears the marker (step 2), so the
# NEXT Stop finds no marker and exits 0. A cooperating agent therefore stops
# after exactly one forced continuation. This deliberately does NOT bail out on
# stop_hook_active — that flag would downgrade the gate to a one-shot nudge,
# which is the behavior we are explicitly replacing. Escape hatches if a review
# genuinely cannot clear it: interrupt (Esc), or delete
# .claude/.security-review-owed by hand.
#
# Fails open: any error other than the intended block exits non-zero (treated as
# a non-blocking hook error), so a broken environment never wedges the session.
set -euo pipefail

payload=$(cat)

eval "$(printf '%s' "$payload" | python3 -c '
import sys, json, shlex
d = json.load(sys.stdin)
print("cwd=" + shlex.quote(d.get("cwd", ".")))
')"

marker="${CLAUDE_PROJECT_DIR:-$cwd}/.claude/.security-review-owed"
[ -f "$marker" ] || exit 0

{
  echo "BLOCKED by security-gate: security-sensitive files were changed and the"
  echo "security-review subagent has not run since. Delegate to the security-review"
  echo "subagent to review the changes below, then finish. (Files pending review:)"
  sort -u "$marker" | sed 's/^/  - /'
} >&2
exit 2
