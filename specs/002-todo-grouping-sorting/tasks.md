---

description: "Task list for Completed Todo Grouping, Sorting & Overdue Highlighting"
---

# Tasks: Completed Todo Grouping, Sorting & Overdue Highlighting

**Input**: Design documents from `/specs/002-todo-grouping-sorting/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md (all present)

**Tests**: Included — the project constitution's Testing Standards principle mandates Jest/Vitest coverage and real-Postgres integration tests for every feature, so test tasks are not optional here.

**Organization**: Tasks are grouped by user story (US1–US5, matching spec.md's priorities P1–P5) to enable independent implementation and testing of each story.

**Note**: This supersedes an earlier task list that included a `completed_at` Prisma migration and "Date Completed" sort field. Both were removed from the spec (see spec.md's amendment log), so User Story 2 here is backend-free — it's a client-side-only sort over fields that already exist.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Include exact file paths in descriptions

## Path Conventions

Web app per plan.md: `api/src/`, `ui/src/`, `shared/src/` (existing `api`/`ui`/`shared` pnpm workspace packages).

---

## Phase 1: Setup

**Purpose**: Add the new frontend dependency and target directory structure before any file moves happen.

- [X] T001 Add `@radix-ui/react-form`, `@radix-ui/react-select`, `@radix-ui/react-checkbox` to `ui/package.json` dependencies and run `pnpm install`
- [X] T002 [P] Create empty `ui/src/components/`, `ui/src/hooks/`, `ui/src/services/`, `ui/src/utilities/`, `ui/src/types/` directories

**Checkpoint**: Dependencies installed, target directory structure exists.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Reorganize `ui/src` into the constitution's kind-based structure, extract the API service layer, and rebuild the *existing* form elements on Radix — all of it touched by every user story below, so it must land first.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Move `TodosPage.tsx`, `TodoForm.tsx`, `TodoItem.tsx`, `TodoList.tsx` from `ui/src/features/todos/` to `ui/src/components/`, updating each file's relative imports
- [X] T004 Move `useTodos.ts` from `ui/src/features/todos/` to `ui/src/hooks/useTodos.ts`, updating its imports
- [X] T005 Create `ui/src/services/todosApi.ts` exporting `listTodos`, `createTodo`, `updateTodo`, `deleteTodo` (the four `fetch` calls moved out of `useTodos.ts`); update `ui/src/hooks/useTodos.ts` to call these instead of using `fetch` directly (research.md §5)
- [X] T006 Delete the now-empty `ui/src/features/` directory; update `ui/src/App.tsx`'s import to `./components/TodosPage`
- [X] T007 Rebuild `ui/src/components/TodoForm.tsx` on `@radix-ui/react-form` (`Form.Root`/`Form.Field`/`Form.Label`/`Form.Control`/`Form.Message`), with `Form.Message` `match` validators calling `createTodoSchema`/`updateTodoSchema` directly — not Radix's native HTML constraint attributes (research.md §1)
- [X] T008 [P] Rebuild the complete-toggle checkbox in `ui/src/components/TodoItem.tsx` on `@radix-ui/react-checkbox`
- [X] T009 [P] Update `ui/src/components/TodoForm.test.tsx` and `ui/src/components/TodoItem.test.tsx` to query the Radix output by accessible role/label (e.g., `getByRole('textbox', { name: 'Title' })`) instead of tag/CSS-class queries, confirming pre-existing create/edit/toggle behavior still passes (research.md §2)

**Checkpoint**: `ui/src` is reorganized, the service layer exists, and existing form elements run on Radix — user story implementation can now begin.

---

## Phase 3: User Story 1 - Separate completed items into their own section (Priority: P1) 🎯 MVP

**Goal**: Group completed todos into a distinct, grayed-out "Completed" section below the active list (FR-001–FR-004).

**Independent Test**: Create several todos, mark some complete, and confirm completed todos appear in a distinct, grayed-out section below the active items, moving between sections immediately as completion is toggled, with the section hidden entirely when empty.

### Tests for User Story 1

- [X] T010 [P] [US1] Vitest test in `ui/src/utilities/todoGrouping.test.ts` for `groupByCompletion`: splits active/completed correctly; empty completed input yields an empty completed group

### Implementation for User Story 1

- [X] T011 [P] [US1] Create `ui/src/utilities/todoGrouping.ts` exporting `groupByCompletion(todos): { active: Todo[]; completed: Todo[] }`
- [X] T012 [US1] Update `ui/src/components/TodoList.tsx` to render the active section and a conditionally-rendered "Completed" section using `groupByCompletion` (FR-001), hiding the Completed section entirely when it has zero items (FR-004)
- [X] T013 [US1] Add grayed-out styling for completed-section items in `ui/src/App.css`, visually distinct from active items (FR-002)
- [X] T014 [US1] Update `ui/src/components/TodoList.test.tsx` to verify: a mixed list renders active items above and grayed-out completed items in a separate section below (FR-001, FR-002); toggling a todo's completion moves it between sections without a page reload (FR-003); a list with zero completed todos shows no Completed section (FR-004)

**Checkpoint**: User Story 1 is fully functional and testable independently — this is the MVP.

---

## Phase 4: User Story 2 - Sort todos by created or updated date (Priority: P2)

**Goal**: Let users sort both sections by Date Created or Date Last Updated, with a sensible default (FR-005–FR-007). This story is entirely client-side — no backend or schema changes are needed, since `createdAt`/`updatedAt` already exist on every todo.

**Independent Test**: Create todos at different times and edit some; select each sort option and confirm the resulting order matches the expected date field in both sections; with no selection, confirm the documented default order.

### Tests for User Story 2

- [X] T015 [P] [US2] Vitest test in `ui/src/utilities/todoSort.test.ts` covering ordering by `createdAt` and `updatedAt`

### Implementation for User Story 2

- [X] T016 [US2] Create `ui/src/types/sort.ts` exporting `SortField = 'createdAt' | 'updatedAt'`
- [X] T017 [US2] Create `ui/src/utilities/todoSort.ts` exporting `sortTodos(todos, field): Todo[]` (ascending stable comparator per field; direction is added in User Story 4)
- [X] T018 [US2] Create `ui/src/components/SortControl.tsx` using `@radix-ui/react-select`, listing "Date Created" and "Date Last Updated"
- [X] T019 [US2] Wire `SortControl` into `ui/src/components/TodosPage.tsx` with sort-field state; apply `todoSort` + `todoGrouping` together via `useMemo` keyed on `[todos, sortField]` (research.md §4) so both sections reorder identically on selection (FR-005, FR-006), defaulting to Date Created, newest-first, when nothing is selected (FR-007)
- [X] T020 [P] [US2] Vitest test in `ui/src/components/SortControl.test.tsx` covering the combobox role and each option
- [X] T021 [US2] Update `ui/src/components/TodoList.test.tsx` (or `TodosPage.test.tsx`) to cover the default sort order and reordering when a sort option is selected

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Highlight overdue incomplete todos (Priority: P3)

**Goal**: Visually highlight incomplete todos whose due date has passed (FR-008–FR-011).

**Independent Test**: Create todos with due dates in the past, present, and future, and confirm only incomplete ones with a past due date receive the overdue highlight; confirm it disappears immediately on completion.

### Tests for User Story 3

- [X] T022 [P] [US3] Vitest test in `ui/src/utilities/todoOverdue.test.ts` covering: past due + incomplete → overdue; future due date → not overdue; no due date → not overdue; past due + completed → not overdue

### Implementation for User Story 3

- [X] T023 [P] [US3] Create `ui/src/utilities/todoOverdue.ts` exporting `isOverdue(todo, now: Date): boolean` — `true` only when incomplete, has a due date, and that due date is strictly before `now` (FR-008, FR-010)
- [X] T024 [US3] Update `ui/src/components/TodoItem.tsx` to apply an overdue-highlight class using `isOverdue`, visually distinct from both normal active items and grayed-out completed items (FR-008, FR-009), re-evaluated whenever completion status or due date changes (FR-011)
- [X] T025 [US3] Add overdue-highlight styling in `ui/src/App.css`, distinct from both the default and grayed-out treatments
- [X] T026 [US3] Update `ui/src/components/TodoItem.test.tsx` to verify the overdue highlight appears only for incomplete todos with a past due date and disappears immediately when the todo is marked complete

**Checkpoint**: User Stories 1–3 all work independently.

---

## Phase 6: User Story 4 - Sort alphabetically and choose direction (Priority: P4)

**Goal**: Add "Title" as a sort field and let users reverse direction (ascending/descending) for any of the three sort fields (FR-012–FR-017).

**Independent Test**: Create todos with distinct titles, sort by "Title" and confirm case-insensitive A→Z order; toggle direction on each of the three fields and confirm the order exactly reverses each time, including tie order; confirm switching fields applies that field's own default direction.

### Tests for User Story 4

- [X] T027 [P] [US4] Extend `ui/src/utilities/todoSort.test.ts` with cases for: case-insensitive title comparison; descending exactly mirroring ascending including tied titles; each field's default direction from `DEFAULT_DIRECTION`

### Implementation for User Story 4

- [X] T028 [US4] Extend `ui/src/types/sort.ts`: add `'title'` to `SortField`; add `SortDirection = 'asc' | 'desc'`; add a `DEFAULT_DIRECTION: Record<SortField, SortDirection>` constant (`createdAt`/`updatedAt` → `'desc'`, `title` → `'asc'`)
- [X] T029 [US4] Extend `ui/src/utilities/todoSort.ts`: add a `title` case comparing via `localeCompare(..., undefined, { sensitivity: 'base' })` (FR-012, FR-013); change `sortTodos` to accept a `direction` parameter, always sorting ascending first and then reversing the resulting array when `direction === 'desc'` — not negating the comparator (FR-014, FR-015; research.md §7)
- [X] T030 [US4] Add a "Title" option and a direction toggle control to `ui/src/components/SortControl.tsx`
- [X] T031 [US4] Update `ui/src/components/TodosPage.tsx`'s sort state to hold `{ field, direction }`; selecting a new field looks up `DEFAULT_DIRECTION[field]` rather than reusing the previous field's direction (FR-016, FR-017); update the `useMemo` dependency array to `[todos, sortField, sortDirection]` (research.md §4)
- [X] T032 [P] [US4] Vitest test in `ui/src/components/SortControl.test.tsx` covering: selecting "Title" sorts alphabetically; toggling direction reverses order; switching fields resets to that field's default direction

**Checkpoint**: User Stories 1–4 all work independently.

---

## Phase 7: User Story 5 - Sort preference survives a page reload (Priority: P5)

**Goal**: Persist the selected sort field and direction in a new `settings` table so they survive a page reload (FR-018–FR-021).

**Independent Test**: Select a non-default sort field and direction, reload the page, and confirm the same field and direction are restored without any user action; confirm a missing/unreadable saved preference falls back to the documented defaults; confirm a failed save doesn't surface an error.

### Tests for User Story 5

- [ ] T033 [P] [US5] Jest unit tests in `api/src/settings/settings.service.spec.ts` covering: `getSettings()` returns documented defaults when no row exists; `updateSettings()` upserts the single row
- [ ] T034 [P] [US5] Supertest integration test in `api/test/settings.e2e-spec.ts` verifying `GET`/`PUT /settings` persist and read back correctly against real Postgres (FR-018–FR-020), plus a case asserting `PUT /settings` with an invalid `sortField`/`sortDirection` returns `400` with the standard error shape (contracts/settings-api.md)
- [ ] T035 [P] [US5] Vitest test in `ui/src/hooks/useSortPreference.test.ts` covering: loads a saved preference on mount; falls back to defaults when the fetch fails or no preference exists; persists a new preference when the field or direction changes; when `updateSettings` rejects, the field/direction change still applies locally and no error is surfaced (FR-021)

### Implementation for User Story 5

- [ ] T036 [US5] Add a `settings` model to `api/prisma/schema.prisma`: `id Int @id` (fixed at `1`), `sort_field String @default("createdAt")`, `sort_direction String @default("desc")`, `updated_at DateTime @default(now()) @db.Timestamptz(6)` (data-model.md; this is a security-sensitive schema change — the `security-review` subagent must review it before the turn ends, per the CLAUDE.md enforced Security Gate — note the `todos` table itself is untouched by this feature)
- [ ] T037 [US5] Generate and apply the Prisma migration for the `settings` table (`pnpm --filter api prisma migrate dev`)
- [ ] T038 [P] [US5] Create `shared/src/settings.schema.ts` exporting `sortFieldSchema` (`'createdAt' | 'updatedAt' | 'title'`), `sortDirectionSchema`, and `settingsSchema` (both fields required together, never partial)
- [ ] T039 [US5] Create `api/src/settings/settings.service.ts` exporting `getSettings()` (reads the `id = 1` row, returning `{ sortField: 'createdAt', sortDirection: 'desc' }` if it doesn't exist yet) and `updateSettings(input)` (upserts the `id = 1` row)
- [ ] T040 [US5] Create `api/src/settings/settings.controller.ts` with `GET /settings` and `PUT /settings` (validated via the existing `ZodValidationPipe` and `settingsSchema`)
- [ ] T041 [US5] Create `api/src/settings/settings.module.ts` and register it in `api/src/app.module.ts`
- [ ] T042 [P] [US5] Create `ui/src/services/settingsApi.ts` exporting `getSettings()` and `updateSettings(input)` `fetch` wrappers
- [ ] T043 [US5] Create `ui/src/hooks/useSortPreference.ts`: loads settings on mount (fetched in parallel with `GET /todos`, not sequentially — research.md §9), exposes `{ sortField, sortDirection, setSort }`, falls back to `DEFAULT_DIRECTION`-based defaults on a failed/missing fetch (FR-019), and calls `updateSettings` whenever `setSort` is used (FR-020). `setSort` applies the new field/direction to local state immediately regardless of whether the `updateSettings` call succeeds, and does not surface a rejected save as an error — it is simply retried on the next `setSort` call (FR-021)
- [ ] T044 [US5] Update `ui/src/components/TodosPage.tsx` to fetch todos and settings in parallel and use `useSortPreference` instead of the local `{ field, direction }` state introduced in T031

**Checkpoint**: All five user stories are independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Repo-wide cleanup and final validation across all user stories.

- [ ] T045 [P] Run `pnpm --filter api lint` and `pnpm --filter ui lint`, fixing any ESLint/Oxlint violations introduced across this feature
- [ ] T046 [P] Sweep `ui/src/` for dead code and stale imports left over from the `features/todos` → kind-based move (Constitution Code Quality)
- [ ] T047 Run all automated checks: `pnpm --filter api test`, `pnpm --filter api test:e2e`, `pnpm --filter ui test`
- [ ] T048 Execute all six manual validation scenarios in `quickstart.md` end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3–7)**: All depend on Foundational; see story-specific dependencies below
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundational only — fully independent
- **User Story 2 (P2)**: Foundational only — fully independent of US1 (touches `TodoList.tsx`/`TodosPage.tsx` alongside US1 but adds distinct, separable behavior); entirely client-side, no backend work
- **User Story 3 (P3)**: Foundational only — fully independent of US1/US2
- **User Story 4 (P4)**: Extends User Story 2's sort infrastructure (`types/sort.ts`, `utilities/todoSort.ts`, `SortControl.tsx`) — must follow US2
- **User Story 5 (P5)**: Persists the field+direction pair introduced by User Story 4 — must follow US4

So the sort-related stories (US2 → US4 → US5) are sequential by nature of what they build, while US1 and US3 can be done in any order relative to that chain or each other.

### Within Each User Story

- Tests before implementation for that story
- Utilities/entities before components that consume them
- Components before wiring into `TodosPage.tsx`
- Story complete and checkpointed before moving to the next priority

### Parallel Opportunities

- T001 and T002 (Setup) can run in parallel
- T008 and T009 (Foundational) can run in parallel with each other once T003–T007 land
- Within US1: T010 and T011 in parallel
- Within US2: T015 (test) can run alongside early T016/T017 authoring; T020 in parallel with T019
- Within US3: T022 and T023 in parallel
- Within US5: T033, T034, T035 (tests) in parallel; T038 and T042 in parallel with backend implementation tasks
- US1 and US3 can be staffed in parallel by different developers once Foundational is complete; the US2→US4→US5 chain must stay sequential

---

## Parallel Example: User Story 1

```bash
# Launch both User Story 1 tasks together (different files, no shared dependency):
Task: "Vitest test for groupByCompletion in ui/src/utilities/todoGrouping.test.ts"
Task: "Create groupByCompletion in ui/src/utilities/todoGrouping.ts"
```

## Parallel Example: User Story 5 (tests)

```bash
Task: "Jest unit tests for settings defaults/upsert in api/src/settings/settings.service.spec.ts"
Task: "Supertest integration test for GET/PUT /settings in api/test/settings.e2e-spec.ts"
Task: "Vitest test for useSortPreference in ui/src/hooks/useSortPreference.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: run quickstart.md scenario 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add User Story 1 → validate → deploy/demo (MVP!)
3. Add User Story 2 → validate → deploy/demo
4. Add User Story 3 → validate → deploy/demo
5. Add User Story 4 (extends US2) → validate → deploy/demo
6. Add User Story 5 (extends US4) → validate → deploy/demo
7. Polish

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 3
   - Developer C: User Story 2, then User Story 4, then User Story 5 (sequential chain)
3. US1 and US3 integrate independently once complete; the sort chain lands as one continuous thread

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Verify tests fail before implementing the corresponding utility/component
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently
- T036 (the `settings` table Prisma schema change) triggers the CLAUDE.md-enforced Security Gate — the `security-review` subagent must run before that implementation turn ends. The `todos` table is not modified by this feature, so no schema-change gate applies there.
