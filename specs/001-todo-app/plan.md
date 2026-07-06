# Implementation Plan: Todo App

**Branch**: `001-todo-app` | **Date**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-todo-app/spec.md`

## Summary

Deliver a single-user todo application (no authentication) with a NestJS API
and a React UI backed by a shared `todos` table in Postgres. Users can create,
list, edit, complete/incomplete, and delete todos (title required, description
and due date optional), with all data persisting across sessions. The backend
and frontend share one set of Zod validation schemas so client and server never
disagree about what a valid todo looks like, per the project constitution.

## Technical Context

**Language/Version**: TypeScript, strict mode (backend `^5.7`, frontend
`~6.0`)

**Primary Dependencies**: NestJS 11 (backend), React 19 + Vite 8 (frontend),
Prisma 7 (`@prisma/client` + `@prisma/adapter-pg`) as the ORM, Zod for shared
validation schemas

**Storage**: PostgreSQL 17, run locally via the existing `api/docker-compose.yml`
(`postgres-db` service), accessed through Prisma

**Testing**: Jest 30 + Supertest (backend unit + integration tests against a
real Postgres instance), Vitest + React Testing Library (frontend — to be
added; not yet present in `ui/package.json`)

**Target Platform**: Web — Node.js backend (containerizable), browser frontend

**Project Type**: Web application (existing `api/` backend + `ui/` frontend
directories)

**Performance Goals**: API responses within 200ms p95 under single-user load;
frontend Largest Contentful Paint under 2.5s on a throttled connection
(constitution Performance Requirements)

**Constraints**: Single shared todo list, no auth/sessions/accounts; one
canonical set of Zod schemas consumed by both `api` and `ui` — no duplicated
validation rules

**Scale/Scope**: One user, a personal-scale todo list (expected low hundreds
of rows, not a high-volume system)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                        | Status                          | Notes                                                                                                                                                                                                                                                                                           |
| -------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Code Quality                  | ⚠ Action required, no violation | `api` and `ui` are currently independent npm packages with no shared code path. To satisfy "Zod schemas MUST be shared, not duplicated," Phase 1 introduces a `shared/` workspace package as the single source of validation truth. TypeScript strict mode is already enabled in both packages. |
| II. Testing Standards            | ⚠ Action required, no violation | Jest + Supertest already configured in `api`. Vitest is not yet in `ui/package.json` and must be added. Integration tests will run against the real Postgres container already defined in `api/docker-compose.yml`, not a mock.                                                                 |
| III. User Experience Consistency | ✅ Pass                         | Planned single `TodoForm` / `TodoList` component set enforces one interaction pattern for create/edit/complete/delete, with explicit loading/empty/error states defined in Phase 1 (data-model.md, quickstart.md).                                                                              |
| IV. Performance Requirements     | ⚠ Action required, no violation | Existing Prisma schema indexes `is_completed` but not `due_at`, which the UI needs for sorting/overdue display. Phase 1 data model adds that index. Prisma queries will select only fields the todo list/detail views use.                                                                      |

No principle is violated; the "action required" items are design decisions
carried into Phase 0/1 outputs below, not deviations needing justification.
Complexity Tracking is therefore not needed.

**Post-Phase 1 re-check**: All four "action required" items were resolved by
the design artifacts and are now ✅ Pass:

- _Code Quality_: `research.md` §1 fixes the shared-Zod-package structure;
  `contracts/todos-api.md` and `data-model.md` are both defined in terms of
  that one shared schema.
- _Testing Standards_: `research.md` §5 adds Vitest to `ui`; `quickstart.md`
  names the Jest/Supertest (real Postgres) and Vitest/RTL suites required.
- _Performance Requirements_: `research.md` §6 adds the `due_at` index and
  removes `@@ignore`; `contracts/todos-api.md` keeps payloads field-scoped
  rather than over-fetching.

No new violations were introduced during Phase 1 design.

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-app/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
api/                          # NestJS backend (existing)
├── src/
│   ├── todos/
│   │   ├── todos.controller.ts
│   │   ├── todos.service.ts
│   │   ├── todos.module.ts
│   │   └── todos.controller.spec.ts / todos.service.spec.ts
│   ├── prisma/
│   │   └── prisma.service.ts   # Injectable PrismaClient wrapper
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   └── schema.prisma            # `todos` model (update: drop @@ignore, add due_at index)
└── test/
    └── todos.e2e-spec.ts        # Integration tests against real Postgres

ui/                            # React + Vite frontend (existing)
├── src/
│   ├── features/
│   │   └── todos/
│   │       ├── TodoList.tsx
│   │       ├── TodoForm.tsx
│   │       ├── TodoItem.tsx
│   │       └── useTodos.ts       # data-fetching hook (loading/error/empty states)
│   ├── App.tsx
│   └── main.tsx
└── src/**/*.test.tsx             # Vitest + React Testing Library specs

shared/                        # NEW: Zod schemas shared by api and ui
├── src/
│   └── todo.schema.ts           # createTodoSchema, updateTodoSchema, Todo type
├── package.json
└── tsconfig.json

pnpm-workspace.yaml            # NEW at repo root: links api, ui, shared
```

**Structure Decision**: Keep the existing `api/` (NestJS) and `ui/`
(React + Vite) packages, and add one new `shared/` package holding the Zod
schemas that define what a valid todo is. A root-level `pnpm-workspace.yaml`
wires all three packages together so `api` and `ui` both depend on `shared`
instead of duplicating validation logic — this is the direct implementation of
the constitution's Code Quality principle for this feature. No new services,
processes, or projects beyond these three are introduced.

## Complexity Tracking

_No entries — the Constitution Check identified action items, not violations
requiring justification._
