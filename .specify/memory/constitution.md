<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- Modified principles:
  - I. Code Quality — added explicit linting/formatting tooling requirement
    (ESLint on backend; Oxlint + Oxfmt on frontend)
- Added sections: none (existing sections expanded, not added)
- Removed sections: none
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md — Constitution Check gate reads principles
    dynamically; no hardcoded tooling names to update
  - ✅ .specify/templates/spec-template.md — generic, no principle-specific references
  - ✅ .specify/templates/tasks-template.md — generic task "Configure linting and
    formatting tools" already tool-agnostic; no change needed
  - ✅ .specify/templates/checklist-template.md — generic, no principle-specific references
  - ⚠ No .specify/templates/commands/*.md directory present — nothing to update
- Follow-up TODOs: none
-->

# Todo SDD Constitution

## Core Principles

### I. Code Quality

TypeScript strict mode is non-negotiable across frontend and backend; `any` and
implicit-any are forbidden except at explicitly justified, commented boundaries.
Validation logic (Zod schemas) MUST be defined once and shared between the NestJS
backend and the React frontend — no duplicated or divergent validation rules.
Backend code MUST pass ESLint with zero errors, and frontend code MUST pass
Oxlint with zero errors and be formatted with Oxfmt. All code MUST pass
linting, formatting checks, and type-checking before merge; these are
automated gates, not reviewer judgment calls. Every Prisma schema change MUST ship with a
corresponding migration committed alongside the code that depends on it.
Functions and modules MUST have a single clear responsibility; prefer composing
small, well-named units over large multi-purpose ones.

**Rationale**: A single-developer, single-user application still accrues
maintenance cost from type drift and duplicated validation. Enforcing these
mechanically (compiler, linter, shared schema) prevents defects before review
rather than relying on manual vigilance.

### II. Testing Standards

Every backend feature (NestJS services, controllers, resolvers) MUST have Jest
unit tests, and every API endpoint MUST have at least one integration test that
exercises the real Postgres schema (via a test database or equivalent), not a
mocked persistence layer. Every frontend feature MUST have Vitest tests covering
its primary user interactions and edge/error states. Tests MUST be written
before or alongside implementation for new features (red-green-refactor is
encouraged, not optional busywork). A pull request that adds behavior without a
corresponding test is incomplete, not merely "light on coverage." Bug fixes
MUST include a regression test that fails before the fix and passes after.

**Rationale**: Mocking the database hides real schema and query-behavior
regressions; integration tests against real Postgres catch what unit tests
cannot. Requiring regression tests for bug fixes prevents the same class of bug
from reappearing silently.

### III. User Experience Consistency

The UI MUST follow one consistent interaction pattern for equivalent actions
(creating, editing, completing, and deleting a todo behave the same way
everywhere they appear). Loading, empty, and error states MUST be handled
explicitly for every view — no view may silently show nothing or a raw error.
Form validation errors MUST surface inline, next to the field they concern,
using the same Zod schema that the backend enforces, so client and server never
disagree about what is valid. All interactive elements MUST be keyboard-
accessible and carry correct semantic HTML/ARIA roles.

**Rationale**: A todo app is judged primarily on how it feels to use daily;
inconsistent interactions or silent failure states erode trust in the tool
faster than missing features do.

### IV. Performance Requirements

API endpoints MUST respond within 200ms at p95 under expected single-user load;
any endpoint exceeding this MUST be profiled and either optimized or have the
deviation explicitly justified in the PR description. Database access MUST use
indexed queries for any lookup on due date, status, or title filtering —
full-table scans on the todos table are not acceptable as the data set grows.
The frontend MUST achieve a Largest Contentful Paint under 2.5s on a throttled
connection profile and MUST avoid unnecessary re-renders on every keystroke in
list views. Prisma queries MUST select only the fields a view actually needs
rather than defaulting to full-record fetches.

**Rationale**: Performance budgets set now stay cheap to meet; retrofitting
them after the schema and UI patterns solidify is far more expensive than
enforcing them from the first feature onward.

## Additional Constraints

Technology stack is fixed for this project and MUST NOT be substituted without
a constitution amendment: TypeScript (strict mode) for all application code;
NestJS for the backend; React + Vite for the frontend; Zod for shared
frontend/backend validation; PostgreSQL as the database; Prisma as the ORM;
Vitest for frontend tests and Jest for backend tests; ESLint for backend
linting; Oxlint for frontend linting and Oxfmt for frontend formatting. Any
new dependency that duplicates the responsibility of an existing stack choice
(e.g., a second validation library, a second ORM, a second linter) requires
explicit justification in the plan's Complexity Tracking section.

## Development Workflow & Quality Gates

Every plan produced by `/speckit-plan` MUST pass the Constitution Check gate
against the four principles above before Phase 0 research begins, and MUST be
re-checked after Phase 1 design. Model assignment for review depth follows
CLAUDE.md: architecture decisions and security-sensitive changes always receive
escalated review. A feature is not "done" until linting, type-checking, and the
full Vitest/Jest suites pass, and until the User Experience Consistency and
Performance Requirements principles have been explicitly checked against the
delivered UI/API, not merely assumed from the plan.

## Governance

This constitution supersedes all other project practices and templates when
they conflict. Amendments require: (1) a documented rationale for the change,
(2) an update to this file following the Sync Impact Report format at the top
of this document, and (3) propagation of any consequential changes to
`.specify/templates/*.md` in the same change set. Versioning follows semantic
versioning: MAJOR for backward-incompatible principle removals or redefinitions,
MINOR for new principles or materially expanded guidance, PATCH for wording
and clarification fixes. All plans and PRs MUST verify compliance with this
constitution; complexity that violates a principle MUST be justified in the
plan's Complexity Tracking section or rejected. `CLAUDE.md` remains the
authoritative source for day-to-day runtime development guidance (tone,
model-assignment rules, tech stack detail) and MUST stay consistent with this
constitution.

**Version**: 1.1.0 | **Ratified**: 2026-07-06 | **Last Amended**: 2026-07-07
