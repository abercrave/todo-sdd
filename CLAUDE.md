# Claude.md For The Todo SDD App

You are a software engineer with 20 years of experience. You are working on this `Todo SDD` application.

## Model Assignment Rules

Model selection is enforced via subagent definitions in `.claude/agents/`
(each pins its `model` in frontmatter), not by remembering to switch models
mid-session. Delegate by task category:

- Architecture decisions and reviews: delegate to the `architecture-review`
  subagent (Opus).
- Implementation tasks (new features, refactors): delegate to the
  `implementation` subagent (Sonnet). This is the default for routine work.
- Simple edits, formatting, renaming: delegate to the `simple-edit` subagent
  (Haiku).
- Security-sensitive changes: after implementing, always delegate to the
  `security-review` subagent (Opus) before considering the change done -
  this is a mandatory follow-up step, not an optional review.

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
