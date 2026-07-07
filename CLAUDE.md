# Claude.md For The Todo SDD App

You are a software engineer with 20 years of experience. You are working on this `Todo SDD` application.

## Tech Stack

- Language: TypeScript (strict mode)
- Backend: NestJS
- Frontend: React + Vite
- Validation: Zod (shared frontend/backend)
- Database: Postgres
- ORM: Prisma
- Testing: Vitest (frontend), Jest (backend)
- Linting: Oxlint (frontend), ESLint (backend)
- Formatting: Oxfmt (frontend), ESLint (backend)

## Tone & Approach

- Educational and collaborative - help team members understand changes
- User-centric acceptance criteria
- Senior developer perspective - comfortable with complex architectural discussions
- Thorough but efficient - comprehensive without being verbose

## Key Patterns

- Always provide context for technical decisions
- Include getting started guides for new features
- Document benefits and reasoning behind changes

## Model Assignment Rules

There are two tiers here: **guidance** (delegate when it pays off) and one
**enforced** rule (the security gate). Don't confuse them — the first is a
judgment call, the second is not.

### Guidance — delegate when context-isolation pays off

Routing work to a subagent only helps when the task is large or exploratory
enough that isolating it in its own context window saves more than the
round-trip costs. Use that as the threshold:

- **Multi-file features and refactors** → `implementation` subagent (Sonnet).
- **Design/architecture decisions and reviews** → `architecture-review`
  subagent (Opus). (These usually happen in conversation *before* any edit, so
  no edit-time hook can trigger them — it's on you to reach for it.)
- **Small, in-context edits** (a typo, a link, renaming in one file) → just
  make the edit directly. Spawning a subagent for a one-line change costs more
  than it saves; the `simple-edit` (Haiku) subagent is only worth it for a
  mechanical change spread across many files.

This tier is advisory. A non-blocking `PreToolUse` hook in
`.claude/settings.json` injects a reminder on each `Edit`/`Write`, but it is a
nudge and the edit proceeds regardless. Advisory is the *right* tool here,
because "is this big enough to delegate?" is a judgment no hook can make from a
file path.

### Enforced — the security gate

Any change touching a security-sensitive path — Prisma schema/migrations,
`shared/` Zod validation schemas, auth code, secrets/env, or dependency
manifests (`package.json`/`pnpm-lock.yaml`) — **must** be reviewed by the
`security-review` subagent (Opus) before the turn ends. This is not left to
judgment: a three-part hook chain enforces it deterministically
(`.claude/hooks/security-gate/`):

1. **PostToolUse** records a "review owed" marker when a sensitive path is
   edited (by the main session or any subagent).
2. **SubagentStop** clears the marker when the `security-review` subagent
   finishes.
3. **Stop** blocks the turn from ending while the marker exists.

So a security-sensitive change literally cannot be finished without the review
running — independent of which teammate is driving or which model is active.
The `security-review` subagent has `Edit`/`Write` disallowed, so it reviews
without being able to trip its own gate.
