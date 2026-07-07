# API Contract Delta: Todos (Completed Grouping, Sorting & Overdue Highlighting)

This feature makes one additive, backward-compatible change to the base
contract in `specs/001-todo-app/contracts/todos-api.md`: a new `completedAt`
field on the Todo response shape. No endpoints, request shapes, or query
parameters change — grouping, sorting, and overdue detection are computed
client-side (see `research.md` §3).

## Todo representation (response shape, updated)

```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "isCompleted": true,
  "dueAt": "2026-07-10T00:00:00.000Z",
  "completedAt": "2026-07-08T09:15:00.000Z",
  "createdAt": "2026-07-06T18:00:00.000Z",
  "updatedAt": "2026-07-08T09:15:00.000Z"
}
```

- `completedAt`: `null` when `isCompleted` is `false`. Set to the current
  server time the moment `isCompleted` becomes `true`; cleared to `null` the
  moment it becomes `false` again. Never accepted as client input.

## `PATCH /todos/:id` — behavior addition (FR-007, FR-008; User Story 2)

No change to the request schema (`updateTodoSchema` still does not include
`completedAt`). Behavior addition only:

- When the request sets `isCompleted: true` and the todo was previously
  incomplete, the server sets `completedAt` to the current time in the same
  update.
- When the request sets `isCompleted: false` and the todo was previously
  complete, the server clears `completedAt` to `null` in the same update.
- Editing other fields on an already-completed todo (e.g., its title) does
  **not** change `completedAt`.

All other endpoints (`POST /todos`, `GET /todos`, `DELETE /todos/:id`) and
their existing response/error shapes are unchanged from the base contract.
