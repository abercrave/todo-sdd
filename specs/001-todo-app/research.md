# Phase 0 Research: Todo App

No `[NEEDS CLARIFICATION]` markers remained in the Technical Context, so this
research resolves the concrete design/best-practice decisions needed before
Phase 1, rather than open unknowns.

## 1. Sharing Zod schemas between NestJS and React

**Decision**: Create a new `shared/` package (plain TypeScript, no framework
dependency) exporting Zod schemas (`createTodoSchema`, `updateTodoSchema`) and
their inferred types. Wire `api`, `ui`, and `shared` together with a root-level
`pnpm-workspace.yaml`, and add `shared` as a workspace dependency of both
`api` and `ui`.

**Rationale**: The constitution requires validation logic to be "defined once
and shared" between frontend and backend. A workspace package is the standard
pattern for this in a pnpm monorepo and requires no build/publish step during
development (TypeScript project references or `exports` field resolve it
directly).

**Alternatives considered**:

- _Duplicate schemas in each package_: rejected — violates the Code Quality
  principle directly and is the exact drift risk the principle exists to
  prevent.
- _Publish `shared` to a private registry_: rejected as unnecessary
  overhead for a single-repo, single-developer project; a workspace
  dependency achieves the same sharing without publishing infrastructure.

## 2. Validating requests in NestJS with Zod

**Decision**: Use a small custom `ZodValidationPipe` (implementing NestJS's
`PipeTransform`) applied per-route, parsing the request body with the shared
schema and throwing a `BadRequestException` with the Zod issue list on
failure.

**Rationale**: NestJS's native validation story is built around
`class-validator`; introducing a lightweight custom pipe keeps Zod as the
single validation technology (per Code Quality: no duplicate validation
libraries) without pulling in `class-validator` as a second, unused dependency.

**Alternatives considered**:

- _`class-validator` + `class-transformer` DTOs_: rejected — would create a
  second validation system alongside Zod, exactly the duplication the
  constitution's Additional Constraints section warns against.
- _`nestjs-zod` third-party package_: viable, but a ~15-line custom pipe covers
  the full requirement here without adding a new dependency to track.

## 3. Data access pattern

**Decision**: A single injectable `PrismaService` (extends `PrismaClient`,
implements `OnModuleInit`/`OnModuleDestroy` for connect/disconnect) is
provided once and injected into `TodosService`. `TodosService` is the only
place that talks to Prisma; `TodosController` only handles HTTP concerns.

**Rationale**: Standard NestJS + Prisma integration pattern; keeps persistence
concerns isolated so integration tests can exercise `TodosService` against the
real database without HTTP overhead, and controller tests can mock the
service layer.

**Alternatives considered**:

- _Repository pattern on top of Prisma_: rejected as unnecessary indirection
  for a single-entity, single-user feature (YAGNI — Prisma's client already is
  the repository here).

## 4. Frontend data fetching and state

**Decision**: A single `useTodos` hook wrapping `fetch` calls to the API,
exposing `{ todos, status: 'loading' | 'error' | 'empty' | 'ready', error,
create, update, remove }`. No external state-management or data-fetching
library.

**Rationale**: One user, one list, no cross-page cache-sharing needs — a
library like React Query would add a dependency and abstraction with no
corresponding benefit at this scale. The explicit `status` states map directly
to the User Experience Consistency principle's requirement for explicit
loading/empty/error handling in every view.

**Alternatives considered**:

- _TanStack Query_: reconsider only if the app grows multiple independent
  views needing cache invalidation/sharing; out of scope for this feature.

## 5. Frontend test tooling

**Decision**: Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`,
and `jsdom` as dev dependencies to `ui/`, matching the constitution's mandated
Vitest testing standard (not yet present in the current scaffold).

**Rationale**: Constitution requires Vitest for frontend tests; the scaffold
currently has no test runner configured for `ui/`.

**Alternatives considered**: None — the testing tool is fixed by the
constitution's Additional Constraints section.

## 6. Prisma schema adjustments

**Decision**: Remove the `@@ignore` attribute currently present on the
`todos` model (it currently suppresses client generation for the model) and
add an index on `due_at` alongside the existing `is_completed` index.

**Rationale**: `@@ignore` must be removed for Prisma Client to generate usable
`todos` operations at all. The `due_at` index supports the UI's need to
surface/sort overdue and upcoming todos (Performance Requirements: indexed
queries for due-date lookups).

**Alternatives considered**: None — `@@ignore` removal is required for the
feature to function; the index is required by the constitution's explicit
mention of due-date filtering.

## 7. API surface shape

**Decision**: Four REST endpoints under `/todos`: `POST /todos` (create),
`GET /todos` (list all), `PATCH /todos/:id` (partial update — covers editing
fields and toggling completion), `DELETE /todos/:id` (delete). No separate
"complete" endpoint.

**Rationale**: A single `PATCH` for both field edits and completion toggling
avoids a redundant near-duplicate endpoint; both are "update this todo's
state" operations from the API's perspective.

**Alternatives considered**:

- _Dedicated `POST /todos/:id/complete` and `/incomplete` endpoints_: rejected
  as unnecessary surface area — `PATCH { isCompleted: true }` expresses the
  same intent through the general update path already required for editing.
