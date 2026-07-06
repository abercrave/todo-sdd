# API Contract: Todos

Base path: `/todos`. All request/response bodies are JSON and validated
against the shared Zod schemas in `shared/src/todo.schema.ts`, so the shapes
below are authoritative for both the NestJS controller and the React client.

## Todo representation (response shape)

```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "isCompleted": false,
  "dueAt": "2026-07-10T00:00:00.000Z",
  "createdAt": "2026-07-06T18:00:00.000Z",
  "updatedAt": "2026-07-06T18:00:00.000Z"
}
```

`description` and `dueAt` are `null` when not set.

## `POST /todos` — Create a todo (FR-001, FR-002; User Story 1)

**Request body** (`createTodoSchema`):

```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "dueAt": "2026-07-10"
}
```

- `title`: required, 1–255 chars.
- `description`: optional, 0–2000 chars.
- `dueAt`: optional ISO date/datetime string.

**Responses**:

- `201 Created` — returns the created Todo representation.
- `400 Bad Request` — validation failed (e.g., missing/blank title, description
  or title too long, invalid date). Body: `{ "message": string, "errors": [{ "path": string, "message": string }] }`.

## `GET /todos` — List all todos (FR-003, FR-010; User Story 2)

**Responses**:

- `200 OK` — returns an array of Todo representations, `[]` when none exist
  (the UI renders the empty state for `[]`, this is not an error).

## `PATCH /todos/:id` — Edit fields and/or toggle completion (FR-004, FR-005; User Stories 2 & 3)

**Request body** (`updateTodoSchema`, all fields optional but at least one
required):

```json
{
  "title": "Buy groceries and cook dinner",
  "description": null,
  "dueAt": null,
  "isCompleted": true
}
```

- Same field constraints as create; `title` if present MUST still satisfy the
  1–255, non-blank rule (FR-002 applies to edits too).
- `description`/`dueAt` may be explicitly set to `null` to clear them.

**Responses**:

- `200 OK` — returns the updated Todo representation.
- `400 Bad Request` — validation failed (same shape as create).
- `404 Not Found` — no todo exists with the given `id`.

## `DELETE /todos/:id` — Permanently delete a todo (FR-006; User Story 3)

**Responses**:

- `204 No Content` — todo deleted.
- `404 Not Found` — no todo exists with the given `id`.

## Error handling contract (FR-011)

Every endpoint returns a 4xx/5xx with a JSON error body (never a bare 200 for
a failed write) if the operation did not persist:

```json
{ "message": "Human-readable summary", "errors": [] }
```

`errors` is populated with per-field issues for `400` validation failures and
omitted/empty otherwise.
