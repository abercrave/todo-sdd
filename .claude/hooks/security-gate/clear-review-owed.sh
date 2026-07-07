#!/usr/bin/env bash
#
# SubagentStop — security-gate step 2 of 3.
#
# When the security-review subagent finishes, the review has been performed, so
# clear the "owed" marker. Any other subagent finishing is ignored. agent_type
# is present in the SubagentStop payload (verified empirically).
#
# Always exits 0.
set -euo pipefail

payload=$(cat)

eval "$(printf '%s' "$payload" | python3 -c '
import sys, json, shlex
d = json.load(sys.stdin)
print("agent_type=" + shlex.quote(d.get("agent_type", "")))
print("cwd=" + shlex.quote(d.get("cwd", ".")))
')"

if [ "${agent_type:-}" = "security-review" ]; then
  rm -f "${CLAUDE_PROJECT_DIR:-$cwd}/.claude/.security-review-owed"
fi
exit 0
