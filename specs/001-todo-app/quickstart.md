# Quickstart: Todo App

Validates the feature end-to-end once implemented. See [data-model.md](./data-model.md)
for field definitions and [contracts/todos-api.md](./contracts/todos-api.md)
for the exact request/response shapes.

## Prerequisites

- Node.js and pnpm installed
- Docker running (for the Postgres container)

## Setup

```bash
# from repo root
pnpm install

# build the shared Zod schemas (api and ui consume the compiled dist/ output)
pnpm --filter shared build

# start Postgres
cd api && pnpm db:start

# apply the Prisma schema
pnpm exec prisma migrate dev

# start the backend
pnpm start:dev

# in a second terminal: start the frontend
cd ../ui && pnpm dev
```

If you change anything in `shared/src/`, re-run `pnpm --filter shared build`
before restarting `api`/`ui` dev servers — they resolve `shared` via its
built `dist/` output, not the raw TypeScript source.

## Validation scenarios

Each scenario below maps to an acceptance scenario in [spec.md](./spec.md).

1. **Create a todo (User Story 1)**
   - Open the UI, submit a new todo with a title, description, and due date.
   - Expect: the todo appears in the list immediately with the entered data.
   - Reload the page. Expect: the todo is still present with the same data.

2. **Reject a blank title (User Story 1)**
   - Attempt to submit the new-todo form with an empty title.
   - Expect: the submission is rejected with a visible message explaining a
     title is required; no todo is added to the list.

3. **Review and complete a todo (User Story 2)**
   - With at least one todo present, confirm the list shows title,
     description, due date, and completion status for each.
   - Mark a todo complete. Expect: its status updates visibly and survives a
     page reload.
   - Mark it incomplete again. Expect: status reverts and survives reload.

4. **Empty state (User Story 2)**
   - Delete all todos (or start from a fresh database).
   - Expect: the list view shows a clear empty state, not a blank screen.

5. **Edit a todo (User Story 3)**
   - Edit an existing todo's title, description, and due date, then save.
   - Expect: updated values are shown and survive a page reload.

6. **Delete a todo (User Story 3)**
   - Delete an existing todo.
   - Expect: it disappears immediately and does not reappear after reload.

7. **API-level check (FR-009)**
   - Using `curl`/Postman, exercise `POST`, `GET`, `PATCH`, and `DELETE`
     `/todos` directly per [contracts/todos-api.md](./contracts/todos-api.md)
     and confirm the UI reflects changes made purely through the API (and
     vice versa), proving both interfaces operate on the same data.

8. **Persisted storage failure (Edge Case, FR-011)**
   - Stop the Postgres container while the app is running, then attempt to
     create/edit/complete/delete a todo.
   - Expect: a clear error is shown and no action is reported as successful.

## Automated test coverage (Testing Standards)

- `api`: Jest unit tests for `TodosService` (validation, CRUD logic) and a
  Supertest integration suite in `test/todos.e2e-spec.ts` hitting the real
  Postgres container for each endpoint in the contract.
- `ui`: Vitest + React Testing Library specs for `TodoForm` (validation
  errors), `TodoList` (loading/empty/error/populated states), and the
  complete/incomplete toggle interaction.
