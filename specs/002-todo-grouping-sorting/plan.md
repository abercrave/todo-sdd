# Implementation Plan: Completed Todo Grouping, Sorting & Overdue Highlighting

**Branch**: `002-todo-grouping-sorting` | **Date**: 2026-07-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-todo-grouping-sorting/spec.md`

## Summary

Split the todo list into an active section and a grayed-out "Completed"
section below it, add a sort control (Date Created / Date Last Updated / Date
Completed / Title) with an ascending/descending direction toggle for every
field, and highlight incomplete todos whose due date has passed. All
grouping, sorting, and overdue detection run client-side against the existing
`GET /todos` payload; the only backend change is persisting a new
`completedAt` timestamp so completion order is knowable. Per direction for
this feature, the existing form elements (`TodoForm`, the complete-toggle
checkbox, and the new sort control) are rebuilt on Radix UI primitives
(`@radix-ui/react-form`, `@radix-ui/react-select`, `@radix-ui/react-checkbox`)
for built-in accessibility and declarative required-field validation, and the
`ui/` codebase is reorganized from feature-based folders into the
kind-based structure (`components/`, `hooks/`, `services/`, `utilities/`,
`types/`) mandated by the constitution's Frontend Architecture & Reusability
principle (added in v1.2.0) while these files are already being touched.

## Technical Context

**Language/Version**: TypeScript, strict mode (backend `^5.7`, frontend
`~6.0`)

**Primary Dependencies**: NestJS 11 (backend, unchanged), React 19 + Vite 8
(frontend), Prisma 7 as the ORM, Zod for shared validation schemas (all
existing) — adding `@radix-ui/react-form`, `@radix-ui/react-select`, and
`@radix-ui/react-checkbox` (frontend) as new, unstyled, accessible primitives
for the todo form, sort control, and completion checkbox

**Storage**: PostgreSQL via Prisma (existing `todos` table); adds a nullable
`completed_at` timestamp column + index

**Testing**: Jest + Supertest (backend, incl. integration tests against real
Postgres), Vitest + React Testing Library (frontend) — existing tooling,
extended with new specs for grouping/sorting/highlighting and updated
queries where Radix markup replaces native elements

**Target Platform**: Web — Node.js backend, browser frontend

**Project Type**: Web application (existing `api/` + `ui/` + `shared/`
workspace); `ui/src` is reorganized in this feature from
`features/todos/*` into kind-based folders

**Performance Goals**: API responses within 200ms p95 under single-user load;
frontend Largest Contentful Paint under 2.5s on a throttled connection;
grouping/sorting must not introduce visible re-render jank on toggle/sort
actions (constitution Performance Requirements)

**Constraints**: Grouping, sorting, and overdue detection are computed
client-side (no new query params on `GET /todos`) — consistent with the
existing single-shared-list, no-pagination scale; `completedAt` is
system-managed and not user-settable via the API; Radix primitives must not
duplicate or bypass the shared Zod validation rules (Zod remains the single
source of truth per Code Quality); sort field (`createdAt` | `updatedAt` |
`completedAt` | `title`) and direction (`asc` | `desc`) are named union types,
not inline string literals, per Code Quality's constants/naming requirements

**Scale/Scope**: Same as the base app — one user, low hundreds of todo rows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Code Quality | ⚠ Action required, no violation | Radix primitives provide markup/ARIA only; `Form.Message` validity is driven by the existing shared `createTodoSchema`/`updateTodoSchema` via custom matchers, not a second validation system. The new `completed_at` column ships with its migration in the same change. Dead code from the `features/todos` → kind-based move (old files, stale imports) MUST be deleted, not left behind. Sort field/direction values MUST be a named `SortField`/`SortDirection` union type in `types/sort.ts`, not inline string literals repeated across components. |
| II. Testing Standards | ⚠ Action required, no violation | Existing Vitest specs query native `<input>`/`<select>` roles that change shape under Radix; Phase 1/2 must update those queries (still by accessible role/label, per Testing Standards' UX-alignment) rather than skip coverage. New Jest/Supertest integration tests cover `completed_at` being set/cleared on real Postgres. |
| III. User Experience Consistency | ✅ Pass | Radix's built-in keyboard/ARIA handling directly supports the "keyboard-accessible, correct semantic roles" requirement. Grouped sections keep one consistent interaction pattern for complete/edit/delete; loading/empty/error states are unchanged from the base app. |
| IV. Performance Requirements | ⚠ Action required, no violation | Sorting/grouping must be memoized (`useMemo`) so they don't re-run on unrelated re-renders. A new index on `completed_at` supports the "Date Completed" sort without a full-table scan as data grows. |
| V. Frontend Architecture & Reusability | ⚠ Action required, no violation | Current `ui/src/features/todos/*` is feature-based, not kind-based, and `useTodos` issues `fetch` calls directly instead of going through a service layer — both are gaps against this principle (added v1.2.0). Phase 1 design closes both by introducing `services/todosApi.ts` and moving files into `components/`, `hooks/`, `utilities/`, `types/`. |

No principle is violated; all "action required" items are design decisions
carried into Phase 0/1 outputs below. Complexity Tracking is not needed for a
violation, but the new Radix dependencies are documented there for
transparency since they are a net-new addition to the stack described in
Additional Constraints.

**Security note**: The `completed_at` column requires a Prisma schema
migration. Per `CLAUDE.md`'s enforced Security Gate, any Prisma
schema/migration change must be reviewed by the `security-review` subagent
before the implementation turn ends — this is hook-enforced, not optional,
and applies regardless of how small the column addition is.

**Post-Phase 1 re-check**: All five "action required" items are resolved by
the design artifacts below and are now ✅ Pass:

- *Code Quality*: `research.md` §1 confirms Radix `Form.Message` validators
  call the shared Zod schemas directly, with no parallel rule set; the
  Project Structure section below leaves no `features/todos` remnant.
- *Testing Standards*: `research.md` §2 documents querying Radix output by
  ARIA role/label (Radix's stated design goal) so existing coverage patterns
  carry over unchanged; `quickstart.md` names the updated test files.
- *Performance Requirements*: `research.md` §4 fixes the memoization
  boundary and the `completed_at` index.
- *Frontend Architecture & Reusability*: `research.md` §5 and the Project
  Structure section define the kind-based layout and the new
  `services/todosApi.ts` module.

No new violations were introduced during Phase 1 design.

## Project Structure

### Documentation (this feature)

```text
specs/002-todo-grouping-sorting/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
api/                                   # NestJS backend (existing, extended)
├── prisma/
│   └── schema.prisma                  # add nullable `completed_at` + index
├── src/
│   └── todos/
│       ├── todos.controller.ts        # unchanged surface (still 4 routes)
│       ├── todos.service.ts           # sets/clears completed_at on isCompleted change
│       └── todos.service.spec.ts      # new cases for completed_at
└── test/
    └── todos.e2e-spec.ts              # new case: completing/uncompleting sets/clears completed_at

ui/                                     # React + Vite frontend (reorganized)
├── src/
│   ├── components/
│   │   ├── TodosPage.tsx               # moved from features/todos/
│   │   ├── TodoForm.tsx                # moved + rebuilt on @radix-ui/react-form
│   │   ├── TodoItem.tsx                # moved + overdue/grayed-out styling
│   │   ├── TodoList.tsx                # moved + renders active/Completed sections
│   │   └── SortControl.tsx             # NEW — @radix-ui/react-select sort dropdown
│   ├── hooks/
│   │   └── useTodos.ts                 # moved; delegates I/O to services/todosApi
│   ├── services/
│   │   └── todosApi.ts                 # NEW — centralizes all `fetch` calls (Constitution V)
│   ├── utilities/
│   │   ├── todoGrouping.ts             # NEW — splits active vs. completed
│   │   ├── todoSort.ts                 # NEW — sorts by created/updated/completed/title, asc/desc
│   │   └── todoOverdue.ts              # NEW — isOverdue(todo, now)
│   ├── types/
│   │   └── sort.ts                     # NEW — SortField + SortDirection union types, default-direction map
│   ├── App.tsx                         # updated import path only
│   └── main.tsx                        # unchanged
└── src/**/*.test.tsx|ts                # colocated with their moved/new file, per existing convention

shared/                                 # existing package
└── src/
    └── todo.schema.ts                  # add `completedAt` to `todoSchema` (response-only)
```

**Structure Decision**: Keep the three existing workspace packages
(`api`, `ui`, `shared`); no new package or process is introduced. Within
`ui/src`, replace the single `features/todos/` folder with the kind-based
layout (`components/`, `hooks/`, `services/`, `utilities/`, `types/`)
required by the constitution's Frontend Architecture & Reusability
principle — this repo has one feature, so the kind-based split fully
replaces the feature folder rather than living alongside it.

## Complexity Tracking

> Documented for transparency (new dependencies), not because a violation
> requires justification.

| Addition | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| `@radix-ui/react-form` | Declarative required-field validation wired to accessible markup (`aria-invalid`, `aria-describedby` handled automatically) instead of hand-rolled attributes | Continuing hand-rolled `useState` + manual `aria-*` wiring was explicitly directed to be replaced for this feature and duplicates behavior Radix already provides correctly |
| `@radix-ui/react-select` | Accessible listbox/combobox behavior (keyboard nav, focus trap) for the new sort control, which a native `<select>` cannot fully match for custom styling while staying accessible | A native `<select>` was viable for FR-005–007 alone, but the feature direction calls for updating form elements onto Radix consistently rather than mixing native and Radix controls |
| `@radix-ui/react-checkbox` | Consistent styling/behavior with the rest of the Radix-based form elements for the existing complete-toggle | Leaving the native checkbox was viable functionally, but would leave one interactive control inconsistent with the rest of the form per the same directive |
