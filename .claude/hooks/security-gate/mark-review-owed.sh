#!/usr/bin/env bash
#
# PostToolUse(Edit|Write) — security-gate step 1 of 3.
#
# If the file just edited is security-sensitive, record that a security-review
# is owed by appending to a marker file. Runs for BOTH main-session and
# subagent edits (an implementation-subagent edit to the Prisma schema still
# owes a review). The security-review subagent itself has Edit/Write disallowed,
# so it can never trip this.
#
# Always exits 0: PostToolUse runs after the edit has already happened, so there
# is nothing to block here — we only record state. Fails open (a broken env
# leaves no marker) rather than wedging the session.
set -euo pipefail

payload=$(cat)

# Single python call → shell-quoted assignments (safe for paths with spaces).
eval "$(printf '%s' "$payload" | python3 -c '
import sys, json, shlex
d = json.load(sys.stdin)
print("file_path=" + shlex.quote(d.get("tool_input", {}).get("file_path", "")))
print("cwd=" + shlex.quote(d.get("cwd", ".")))
')"

[ -n "${file_path:-}" ] || exit 0

# Lexical, best-effort classification. Deliberately errs toward over-flagging;
# it cannot know semantics, so treat it as a floor, not a guarantee (see the
# security-gate README notes on coverage limits).
case "$file_path" in
  */prisma/schema.prisma|*/prisma/migrations/*)              reason="Prisma schema/migration" ;;
  */shared/src/*)                                            reason="shared Zod validation schema (trust boundary)" ;;
  *[Aa]uth*|*[Ll]ogin*|*[Jj]wt*|*[Tt]oken*|*[Pp]assword*|*[Ss]ession*|*[Cc]rypto*) reason="auth / credential code" ;;
  .env|*.env|*/.env|.env.*|*.env.*|*/.env.*|*[Ss]ecret*)     reason="secrets / env" ;;
  */package.json|*/pnpm-lock.yaml)                           reason="dependency manifest" ;;
  *) exit 0 ;;
esac

# Anchor to the project dir (matches how settings.json invokes this script), not
# the payload cwd, so mark-time and stop-time always agree on the marker path.
marker="${CLAUDE_PROJECT_DIR:-$cwd}/.claude/.security-review-owed"
mkdir -p "$(dirname "$marker")"
printf '%s\t%s\n' "$reason" "$file_path" >> "$marker"
exit 0
