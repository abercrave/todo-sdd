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

These rules are backstopped by a non-blocking `PreToolUse` hook in
`.claude/settings.json` (checked into the repo, so every teammate gets it
automatically). Whenever an `Edit` or `Write` runs, the hook injects a
reminder to route the change through the appropriate subagent above. It is a
nudge, not a hard gate — the edit still proceeds — so the rules above remain
the source of truth for which subagent handles which task category.

Delegate by task category:

- Architecture decisions and reviews: delegate to the `architecture-review`
  subagent (Opus).
- Implementation tasks (new features, refactors): delegate to the
  `implementation` subagent (Sonnet). This is the default for routine work.
- Simple edits, formatting, renaming: delegate to the `simple-edit` subagent
  (Haiku).
- Security-sensitive changes: after implementing, always delegate to the
  `security-review` subagent (Opus) before considering the change done -
  this is a mandatory follow-up step, not an optional review.

These rules are backstopped by a non-blocking `PreToolUse` hook in
`.claude/settings.json` (checked into the repo, so every teammate gets it
automatically). Whenever an `Edit` or `Write` runs, the hook injects a
reminder to route the change through the appropriate subagent above. It is a
nudge, not a hard gate — the edit still proceeds — so the rules above remain
the source of truth for which subagent handles which task category.
