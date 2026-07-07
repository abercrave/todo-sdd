# Implementation Plan: Completed Todo Grouping, Sorting & Overdue Highlighting

**Branch**: `002-todo-grouping-sorting` | **Date**: 2026-07-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-todo-grouping-sorting/spec.md`

## Summary

Split the todo list into an active section and a grayed-out "Completed"
section below it, add a sort control (Date Created / Date Last Updated /
Title) with an ascending/descending direction toggle for every field, and
highlight incomplete todos whose due date has passed. Grouping, sorting, and
overdue detection run entirely client-side against the existing `GET /todos`
payload — no changes to the `todos` table or its API are needed, since every
field involved (`isCompleted`, `dueAt`, `title`, `createdAt`, `updatedAt`)
already exists. The only backend addition is a new single-row `settings`
table (exposed via `GET/PUT /settings`) so the user's chosen sort field and
direction survive a page reload instead of resetting every visit. Per
direction for this feature, the existing form elements (`TodoForm`, the
complete-toggle checkbox, and the new sort control) are rebuilt on Radix UI
primitives (`@radix-ui/react-form`, `@radix-ui/react-select`,
`@radix-ui/react-checkbox`) for built-in accessibility and declarative
required-field validation, and the `ui/` codebase is reorganized from
feature-based folders into the kind-based structure (`components/`, `hooks/`,
`services/`, `utilities/`, `types/`) mandated by the constitution's Frontend
Architecture & Reusability principle (added in v1.2.0) while these files are
already being touched.

**Note**: An earlier iteration of this plan included a "Date Completed" sort
field backed by a new `completed_at` column. That field was removed from the
spec after review surfaced an unresolved ambiguity in how the active section
(which has no completion date) should behave when it was selected. This plan
reflects the trimmed spec — no `completed_at` column, no `todos` schema
change, and no `todos` API contract delta.

## Technical Context

**Language/Version**: TypeScript, strict mode (backend `^5.7`, frontend
`~6.0`)

**Primary Dependencies**: NestJS 11 (backend, unchanged), React 19 + Vite 8
(frontend), Prisma 7 as the ORM, Zod for shared validation schemas (all
existing) — adding `@radix-ui/react-form`, `@radix-ui/react-select`, and
`@radix-ui/react-checkbox` (frontend) as new, unstyled, accessible primitives
for the todo form, sort control, and completion checkbox

**Storage**: PostgreSQL via Prisma; the existing `todos` table is unchanged.
Adds one new single-row `settings` table (`sort_field`, `sort_direction`,
`updated_at`) for the persisted sort preference.

**Testing**: Jest + Supertest (backend, incl. integration tests against real
Postgres), Vitest + React Testing Library (frontend) — existing tooling,
extended with new specs for grouping/sorting/highlighting/persistence and
updated queries where Radix markup replaces native elements

**Target Platform**: Web — Node.js backend, browser frontend

**Project Type**: Web application (existing `api/` + `ui/` + `shared/`
workspace); `ui/src` is reorganized in this feature from
`features/todos/*` into kind-based folders

**Performance Goals**: API responses within 200ms p95 under single-user load;
frontend Largest Contentful Paint under 2.5s on a throttled connection;
grouping/sorting must not introduce visible re-render jank on toggle/sort
actions (constitution Performance Requirements)

**Constraints**: Grouping, sorting, and overdue detection are computed
client-side (no new query params on `GET /todos`, no changes to the `todos`
table) — consistent with the existing single-shared-list, no-pagination
scale; Radix primitives must not duplicate or bypass the shared Zod
validation rules (Zod remains the single source of truth per Code Quality);
sort field (`createdAt` | `updatedAt` | `title`) and direction (`asc` |
`desc`) are named union types, not inline string literals, per Code
Quality's constants/naming requirements; the `settings` table holds exactly
one shared row (no per-user scoping, no accounts) and `GET /settings` is
fetched in parallel with `GET /todos` on load, not sequentially, to avoid
delaying first paint

**Scale/Scope**: Same as the base app — one user, low hundreds of todo rows

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                              | Status                          | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Code Quality                        | ⚠ Action required, no violation | Radix primitives provide markup/ARIA only; `Form.Message` validity is driven by the existing shared `createTodoSchema`/`updateTodoSchema` via custom matchers, not a second validation system. Dead code from the `features/todos` → kind-based move (old files, stale imports) MUST be deleted, not left behind. Sort field/direction values MUST be a named `SortField`/`SortDirection` union type in `types/sort.ts`, not inline string literals repeated across components. |
| II. Testing Standards                  | ⚠ Action required, no violation | Existing Vitest specs query native `<input>`/`<select>` roles that change shape under Radix; Phase 1/2 must update those queries (still by accessible role/label, per Testing Standards' UX-alignment) rather than skip coverage. New Jest/Supertest integration tests cover `GET/PUT /settings` persisting and defaulting correctly on real Postgres.                                                                                                                          |
| III. User Experience Consistency       | ⚠ Action required, no violation | Radix's built-in keyboard/ARIA handling directly supports the "keyboard-accessible, correct semantic roles" requirement. Grouped sections keep one consistent interaction pattern for complete/edit/delete; loading/empty/error states are unchanged from the base app. A failed/slow `GET /settings` MUST fail open to the documented defaults (FR-019), not show an error state, so one more network call doesn't introduce a new failure mode the base app didn't have.      |
| IV. Performance Requirements           | ⚠ Action required, no violation | Sorting/grouping must be memoized (`useMemo`) so they don't re-run on unrelated re-renders. `GET /settings` MUST be fetched in parallel with `GET /todos`, not sequentially, so the added round trip doesn't push out Largest Contentful Paint.                                                                                                                                                                                                                                 |
| V. Frontend Architecture & Reusability | ⚠ Action required, no violation | Current `ui/src/features/todos/*` is feature-based, not kind-based, and `useTodos` issues `fetch` calls directly instead of going through a service layer — both are gaps against this principle (added v1.2.0). Phase 1 design closes both by introducing `services/todosApi.ts` and moving files into `components/`, `hooks/`, `utilities/`, `types/`.                                                                                                                        |

No principle is violated; all "action required" items are design decisions
carried into Phase 0/1 outputs below. Complexity Tracking is not needed for a
violation, but the new Radix dependencies are documented there for
transparency since they are a net-new addition to the stack described in
Additional Constraints.

**Security note**: The new `settings` table requires a Prisma schema
migration. Per `CLAUDE.md`'s enforced Security Gate, any Prisma
schema/migration change must be reviewed by the `security-review` subagent
before the implementation turn ends — this is hook-enforced, not optional,
and applies regardless of how small the change is. The `todos` table itself
is not modified by this feature, so no Security Gate trigger applies there.

**Post-Phase 1 re-check**: All five "action required" items are resolved by
the design artifacts below and are now ✅ Pass:

- *Code Quality*: `research.md` §1 confirms Radix `Form.Message` validators
  call the shared Zod schemas directly, with no parallel rule set; the
  Project Structure section below leaves no `features/todos` remnant.
- *Testing Standards*: `research.md` §2 documents querying Radix output by
  ARIA role/label (Radix's stated design goal) so existing coverage patterns
  carry over unchanged; `quickstart.md` names the updated test files,
  including `settings.e2e-spec.ts`.
- *User Experience Consistency*: `research.md` §9 defines the fail-open
  behavior for a failed/slow `GET /settings` call.
- *Performance Requirements*: `research.md` §4 fixes the memoization
  boundary; `research.md` §9 fixes the parallel-fetch requirement for
  `GET /settings`.
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
│   └── schema.prisma                  # add `settings` table only — `todos` model is unchanged
├── src/
│   └── settings/
│       ├── settings.controller.ts     # NEW — GET /settings, PUT /settings
│       ├── settings.service.ts        # NEW — reads/upserts the single settings row
│       ├── settings.module.ts         # NEW
│       └── settings.service.spec.ts   # NEW
└── test/
    └── settings.e2e-spec.ts           # NEW — persistence + default-fallback against real Postgres

ui/                                     # React + Vite frontend (reorganized)
├── src/
│   ├── components/
│   │   ├── TodosPage.tsx               # moved from features/todos/
│   │   ├── TodoForm.tsx                # moved + rebuilt on @radix-ui/react-form
│   │   ├── TodoItem.tsx                # moved + overdue/grayed-out styling
│   │   ├── TodoList.tsx                # moved + renders active/Completed sections
│   │   └── SortControl.tsx             # NEW — @radix-ui/react-select sort dropdown + direction toggle
│   ├── hooks/
│   │   ├── useTodos.ts                 # moved; delegates I/O to services/todosApi
│   │   └── useSortPreference.ts        # NEW — loads/saves sort field+direction via services/settingsApi
│   ├── services/
│   │   ├── todosApi.ts                 # NEW — centralizes all todo `fetch` calls (Constitution V)
│   │   └── settingsApi.ts              # NEW — getSettings/updateSettings `fetch` calls
│   ├── utilities/
│   │   ├── todoGrouping.ts             # NEW — splits active vs. completed
│   │   ├── todoSort.ts                 # NEW — sorts by created/updated/title, asc/desc
│   │   └── todoOverdue.ts              # NEW — isOverdue(todo, now)
│   ├── types/
│   │   └── sort.ts                     # NEW — SortField + SortDirection union types, default-direction map
│   ├── App.tsx                         # updated import path only
│   └── main.tsx                        # unchanged
└── src/**/*.test.tsx|ts                # colocated with their moved/new file, per existing convention

shared/                                 # existing package
└── src/
    └── settings.schema.ts              # NEW — sortFieldSchema, sortDirectionSchema, settingsSchema
```

**Structure Decision**: Keep the three existing workspace packages
(`api`, `ui`, `shared`); no new package or process is introduced. `todo.schema.ts`
is untouched — no fields are added to `Todo`. Within `ui/src`, replace the
single `features/todos/` folder with the kind-based layout (`components/`,
`hooks/`, `services/`, `utilities/`, `types/`) required by the constitution's
Frontend Architecture & Reusability principle — this repo has one feature,
so the kind-based split fully replaces the feature folder rather than living
alongside it.

## Complexity Tracking

> Documented for transparency (new dependencies), not because a violation
> requires justification.

| Addition                   | Why Needed                                                                                                                                                                         | Simpler Alternative Rejected Because                                                                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@radix-ui/react-form`     | Declarative required-field validation wired to accessible markup (`aria-invalid`, `aria-describedby` handled automatically) instead of hand-rolled attributes                      | Continuing hand-rolled `useState` + manual `aria-*` wiring was explicitly directed to be replaced for this feature and duplicates behavior Radix already provides correctly             |
| `@radix-ui/react-select`   | Accessible listbox/combobox behavior (keyboard nav, focus trap) for the new sort control, which a native `<select>` cannot fully match for custom styling while staying accessible | A native `<select>` was viable for FR-005/FR-006 alone, but the feature direction calls for updating form elements onto Radix consistently rather than mixing native and Radix controls |
| `@radix-ui/react-checkbox` | Consistent styling/behavior with the rest of the Radix-based form elements for the existing complete-toggle                                                                        | Leaving the native checkbox was viable functionally, but would leave one interactive control inconsistent with the rest of the form per the same directive                              |
