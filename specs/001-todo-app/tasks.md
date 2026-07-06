---
description: "Task list for Todo App feature implementation"
---

# Tasks: Todo App

**Input**: Design documents from `/specs/001-todo-app/`

**Prerequisites**: plan.md, spec.md, data-model.md, contracts/todos-api.md, research.md, quickstart.md (all present)

**Tests**: Included — the project constitution (Testing Standards) mandates
Jest/Supertest coverage in `api` and Vitest/RTL coverage in `ui` for every
feature, and quickstart.md already commits to these suites.

**Organization**: Tasks are grouped by user story (from spec.md) to enable
independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in each description

## Path Conventions

This is an existing web application with three packages:

- **Backend**: `api/src/`, `api/test/`, `api/prisma/`
- **Frontend**: `ui/src/`
- **Shared**: `shared/src/` (new — Zod schemas used by both `api` and `ui`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Stand up the shared-schema workspace package and frontend test tooling

- [X] T001 Create the `shared/` package skeleton: `shared/package.json`, `shared/tsconfig.json`, and an empty `shared/src/` directory
- [X] T002 Create a root-level `pnpm-workspace.yaml` listing `api`, `ui`, and `shared`, carrying over the `allowBuilds` settings currently in `api/pnpm-workspace.yaml`, then delete `api/pnpm-workspace.yaml`
- [X] T003 [P] Add `zod` as a dependency in `shared/package.json`
- [X] T004 [P] Add `shared` as a workspace dependency in `api/package.json` and `ui/package.json`
- [X] T005 [P] Add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, and `jsdom` as dev dependencies in `ui/package.json`, add a `test` script, and create `ui/vitest.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Update `api/prisma/schema.prisma`: remove the `@@ignore` attribute from the `todos` model and add an index on `due_at`
- [X] T007 Run `pnpm exec prisma migrate dev` in `api/` to apply the schema change from T006
- [X] T008 [P] Create `shared/src/todo.schema.ts` with `createTodoSchema`, `updateTodoSchema`, and their inferred types, per the validation rules in `specs/001-todo-app/data-model.md`
- [X] T009 [P] Create `shared/src/index.ts` exporting everything from `todo.schema.ts`
- [X] T010 [P] Create `ZodValidationPipe` in `api/src/common/zod-validation.pipe.ts` (parses request bodies with a given Zod schema, throws `BadRequestException` with issue details on failure)
- [X] T011 [P] Create a global HTTP exception filter in `api/src/common/http-exception.filter.ts` that shapes every error response as `{ message, errors }` per `specs/001-todo-app/contracts/todos-api.md`, and register it in `api/src/main.ts`
- [X] T012 Create `PrismaService` in `api/src/prisma/prisma.service.ts` and `PrismaModule` in `api/src/prisma/prisma.module.ts`; register `PrismaModule` in `api/src/app.module.ts`
- [X] T013 [P] Scaffold `TodosModule`, an empty `TodosController`, and an empty `TodosService` in `api/src/todos/`; register `TodosModule` in `api/src/app.module.ts`
- [X] T014 [P] Create a `useTodos` hook skeleton in `ui/src/features/todos/useTodos.ts` exposing `{ todos, status, error, create, update, remove }` (status: `loading` | `error` | `empty` | `ready`)
- [X] T015 [P] Create the `ui/src/features/todos/` feature directory and mount a todos section/page in `ui/src/App.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Capture a Todo (Priority: P1) 🎯 MVP

**Goal**: Let the user record a new todo (title, description, due date) and see it persist

**Independent Test**: Create a todo through the UI, confirm it appears in the list, and confirm it is still present after reloading the page

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T016 [P] [US1] Jest unit tests for `TodosService.create` and `TodosService.findAll` in `api/src/todos/todos.service.spec.ts` (valid creation, blank-title rejection)
- [X] T017 [P] [US1] Supertest integration tests for `POST /todos` and `GET /todos` in `api/test/todos.e2e-spec.ts`, run against the real Postgres container
- [X] T018 [P] [US1] Vitest tests for `TodoForm` in `ui/src/features/todos/TodoForm.test.tsx` (successful submit, inline blank-title error, and a failed API create call showing a clear error message without adding the todo)

### Implementation for User Story 1

- [X] T019 [US1] Implement `TodosService.create` and `TodosService.findAll` in `api/src/todos/todos.service.ts` using `PrismaService` and `createTodoSchema` (depends on T008, T012, T013)
- [X] T020 [US1] Implement `POST /todos` and `GET /todos` handlers in `api/src/todos/todos.controller.ts` using `ZodValidationPipe` (depends on T010, T019)
- [X] T021 [US1] Implement `create` and the initial list fetch in `ui/src/features/todos/useTodos.ts` calling the API, catching failed requests by setting `status: 'error'` with a message and leaving the list unchanged until the API confirms success (depends on T014, T020)
- [X] T022 [US1] Implement `TodoForm` in `ui/src/features/todos/TodoForm.tsx` (title/description/dueDate fields, shared-schema validation, inline error display) (depends on T008)
- [X] T023 [US1] Implement a minimal `TodoList` (at least each todo's title) in `ui/src/features/todos/TodoList.tsx` (depends on T021)
- [X] T024 [US1] Wire `TodoForm` and `TodoList` into the page from T015 so creating a todo shows it in the list and it persists across a reload (depends on T021, T022, T023)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Review and Complete Todos (Priority: P2)

**Goal**: Let the user see all todos with their full details and mark them complete/incomplete

**Independent Test**: View the list of existing todos, mark one complete, confirm its status visibly changes and survives a reload

### Tests for User Story 2 ⚠️

- [X] T025 [P] [US2] Jest unit tests for `TodosService.update` (toggling `isCompleted`) in `api/src/todos/todos.service.spec.ts`
- [X] T026 [P] [US2] Supertest integration tests for `PATCH /todos/:id` (toggle) and the empty-array `GET /todos` case in `api/test/todos.e2e-spec.ts`
- [X] T027 [P] [US2] Vitest tests for `TodoList` in `ui/src/features/todos/TodoList.test.tsx` covering full field display, the complete/incomplete toggle (including a failed toggle showing a clear error without changing the item's status), and the empty state

### Implementation for User Story 2

- [X] T028 [US2] Implement `TodosService.update` (partial update including `isCompleted`, validated via `updateTodoSchema`) in `api/src/todos/todos.service.ts` (depends on T019)
- [X] T029 [US2] Implement `PATCH /todos/:id` handler (404 when the id doesn't exist) in `api/src/todos/todos.controller.ts` (depends on T010, T028)
- [X] T030 [US2] Implement `update`/toggle in `ui/src/features/todos/useTodos.ts`, surfacing a failed update/toggle as `status: 'error'` with a message without mutating the item's local state (depends on T021, T029)
- [X] T031 [US2] Expand the list into `ui/src/features/todos/TodoList.tsx` + new `ui/src/features/todos/TodoItem.tsx`, showing title, description, due date, and completion status, with a per-item toggle control (depends on T023, T030)
- [X] T032 [US2] Add the distinct empty-state view when there are zero todos (depends on T031)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Edit and Remove Todos (Priority: P3)

**Goal**: Let the user correct or remove a todo

**Independent Test**: Edit an existing todo's fields and confirm the changes persist; separately, delete a todo and confirm it no longer appears after reloading

### Tests for User Story 3 ⚠️

- [X] T033 [P] [US3] Jest unit tests for `TodosService.remove` (delete, 404 on missing id) and for blank-title rejection on edit, in `api/src/todos/todos.service.spec.ts`
- [X] T034 [P] [US3] Supertest integration tests for `DELETE /todos/:id` and for PATCH-based edit rejection of a blank title, in `api/test/todos.e2e-spec.ts`
- [X] T035 [P] [US3] Vitest tests for the edit and delete interactions in `ui/src/features/todos/TodoItem.test.tsx`, including a failed edit and a failed delete each showing a clear error message without changing or removing the item

### Implementation for User Story 3

- [X] T036 [US3] Implement `TodosService.remove` in `api/src/todos/todos.service.ts` (depends on T019)
- [X] T037 [US3] Implement `DELETE /todos/:id` handler (204/404) in `api/src/todos/todos.controller.ts` (depends on T010, T036)
- [X] T038 [US3] Add `remove` to `ui/src/features/todos/useTodos.ts`, surfacing a failed delete as `status: 'error'` with a message without removing the item locally until success (depends on T021, T037)
- [X] T039 [US3] Add an edit mode to `TodoForm` (pre-filled from an existing todo, reusing the create form) wired to `useTodos().update`, launched from `TodoItem`, in `ui/src/features/todos/TodoForm.tsx` and `TodoItem.tsx` (depends on T022, T030, T031)
- [X] T040 [US3] Add a delete action to `TodoItem` wired to `useTodos().remove`, in `ui/src/features/todos/TodoItem.tsx` (depends on T031, T038)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify the full feature against its automated and manual acceptance criteria

- [X] T041 [P] Run `pnpm --filter api test` and `pnpm --filter api test:e2e`; fix any failures
- [X] T042 [P] Run `pnpm --filter ui test`; fix any failures
- [X] T043 [P] Run `pnpm --filter api lint` and `pnpm --filter ui lint`; resolve any issues
- [X] T044 Execute the manual validation scenarios in `specs/001-todo-app/quickstart.md` end-to-end and fix any discrepancies found

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion - no dependencies on other stories
- **User Story 2 (Phase 4)**: Depends on Foundational completion; its `PATCH` implementation builds on `TodosService.create`/`findAll` from US1 (T019), so it is easiest to build after US1
- **User Story 3 (Phase 5)**: Depends on Foundational completion; its edit UI reuses `TodoForm`/`TodoItem` from US1/US2, so it is easiest to build after US2
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories — the true MVP slice
- **User Story 2 (P2)**: Independently testable on its own, but its implementation shares `TodosService`/`TodosController` files with US1 and its UI shares `useTodos`/`TodoList` — build after US1 to avoid file-conflict churn
- **User Story 3 (P3)**: Independently testable on its own, but its edit UI reuses the `TodoForm` and `TodoItem` built in US1/US2 — build last

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Shared schema / service methods before controller endpoints
- Backend endpoint before the frontend hook method that calls it
- Hook methods before the UI components that use them
- Story complete before moving to the next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel once T001/T002 exist
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- All test tasks marked [P] within a story phase can run in parallel with each other
- `shared/src/todo.schema.ts` (T008) work and NestJS scaffolding (T010-T013) can proceed in parallel — they touch different files

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Jest unit tests for TodosService.create/findAll in api/src/todos/todos.service.spec.ts"
Task: "Supertest integration tests for POST/GET /todos in api/test/todos.e2e-spec.ts"
Task: "Vitest test for TodoForm in ui/src/features/todos/TodoForm.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Run T016-T018 tests and the relevant quickstart.md scenarios (1, 2)
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Validate independently → Demo (MVP!)
3. Add User Story 2 → Validate independently → Demo
4. Add User Story 3 → Validate independently → Demo
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- `TodosService`/`TodosController` and `useTodos`/`TodoList` files are touched across all three stories by design (one entity, one API surface) — that's why those specific implementation tasks are NOT marked [P] even within a story
