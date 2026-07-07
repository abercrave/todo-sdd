# Quickstart: Completed Todo Grouping, Sorting & Overdue Highlighting

Validates this feature end-to-end against the acceptance scenarios in
`spec.md`. Assumes the base app's quickstart (`specs/001-todo-app/quickstart.md`)
prerequisites are already met (Postgres running, `api` and `ui` installed).

## Prerequisites

- `api/docker-compose.yml` Postgres container running (`pnpm --filter api db:start`)
- Prisma migration for the new `settings` table applied
  (`pnpm --filter api prisma migrate dev`) — the `todos` table is unchanged
  by this feature, so no migration is needed for it
- `api` running (`pnpm --filter api start:dev`)
- `ui` running (`pnpm --filter ui dev`)

## Automated checks

```bash
# Backend: unit + integration (real Postgres) tests for GET/PUT /settings
# persistence + default fallback
pnpm --filter api test
pnpm --filter api test:e2e

# Frontend: component/unit tests, including grouping/sorting/overdue and
# the Radix-based TodoForm/SortControl
pnpm --filter ui test

# Lint/format gates (Code Quality principle)
pnpm --filter api lint
pnpm --filter ui lint
```

## Manual validation scenarios

1. **Grouping (User Story 1)**
   - Create three todos. Mark one complete.
   - Expected: the completed todo moves into a grayed-out "Completed"
     section below the two active todos; the section is not shown at all
     before anything is completed (FR-001, FR-002, FR-004).
   - Mark it incomplete again: it returns to the active section and the
     Completed section disappears (FR-003).

2. **Sorting (User Story 2)**
   - Create todos a few seconds apart so `createdAt` differs; edit one so
     its `updatedAt` differs.
   - Switch the sort control between "Date Created" and "Date Last Updated."
   - Expected: both the active and Completed sections reorder according to
     the selected field each time (FR-005, FR-006); with no selection made,
     both sections default to newest-created-first (FR-007).

3. **Overdue highlighting (User Story 3)**
   - Create one todo with a due date yesterday, one due tomorrow, and one
     with no due date; leave all three incomplete.
   - Expected: only the overdue one shows the highlight (FR-008, FR-010).
   - Mark the overdue todo complete.
   - Expected: the highlight disappears immediately as it moves to the
     Completed section (FR-009, FR-011).

4. **Required-field validation (Radix form)**
   - Open the todo form and submit with an empty title.
   - Expected: an inline, accessible error is announced against the Title
     field (via `@radix-ui/react-form`'s `Form.Message`), sourced from the
     shared `createTodoSchema` message — the todo is not created.

5. **Alphabetical sort & direction (User Story 4)**
   - Create todos titled "Banana," "apple," and "Cherry."
   - Switch the sort control to "Title."
   - Expected: both sections order items case-insensitively A→Z ("apple,"
     "Banana," "Cherry") (FR-012, FR-013).
   - Toggle the direction control.
   - Expected: the order exactly reverses to Z→A (FR-014, FR-015).
   - Switch the sort field to "Date Created" without touching direction again.
   - Expected: "Date Created" applies its own default direction (newest
     first), not the descending/ascending choice left over from "Title"
     (FR-016, FR-017).

6. **Sort preference persists across reload (User Story 5)**
   - With todos already created, switch the sort control to "Title" and
     toggle direction to descending.
   - Reload the page.
   - Expected: the list is still sorted by "Title," descending — not reset
     to the default (FR-018).
   - Open the network tab (or equivalent) and confirm `GET /settings` and
     `GET /todos` are requested at the same time, not one after the other
     (`research.md` §9).
   - Stop the `api` server, reload the page again.
   - Expected: the list still renders (using `GET /todos`'s cached/failed
     state per the base app's error handling) and the sort control falls
     back to its default field/direction rather than showing a settings
     error (FR-019).

## Reference

- Todo response shape: [specs/001-todo-app/contracts/todos-api.md](../001-todo-app/contracts/todos-api.md) (unchanged by this feature)
- Settings persistence endpoints: [contracts/settings-api.md](./contracts/settings-api.md)
- Entity/state details: [data-model.md](./data-model.md)
- Design decisions and rationale: [research.md](./research.md)
