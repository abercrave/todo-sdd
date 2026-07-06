# Phase 1 Data Model: Todo App

## Entity: Todo

Represents a single unit of work the user wants to track. Maps to the existing
`todos` table (see `api/prisma/schema.prisma`), consumed through Prisma.

| Field                          | Type                      | Required               | Notes                                                                 |
| ------------------------------ | ------------------------- | ---------------------- | --------------------------------------------------------------------- |
| `id`                           | integer, auto-increment   | generated              | Primary key                                                           |
| `title`                        | string, max 255 chars     | yes                    | FR-001, FR-002 — rejected if empty/whitespace-only                    |
| `description`                  | string, max 2000 chars    | no                     | FR-001 — optional free text                                           |
| `isCompleted` (`is_completed`) | boolean                   | yes (defaults `false`) | FR-004 — toggled by the user                                          |
| `dueAt` (`due_at`)             | timestamp, timezone-aware | no                     | FR-001 — optional calendar date; past dates are accepted (Edge Cases) |
| `createdAt` (`created_at`)     | timestamp                 | generated              | Set on creation                                                       |
| `updatedAt` (`updated_at`)     | timestamp                 | generated              | Refreshed on every update                                             |

No owner/user field exists — FR-008 establishes a single shared list, so a
`Todo` is not scoped to any account.

### Validation rules (enforced by the shared Zod schemas)

- `title`: required, trimmed, length 1–255. Rejecting an empty title after
  trimming satisfies FR-002 and the User Story 1 / User Story 3 acceptance
  scenarios for blank-title rejection.
- `description`: optional, length 0–2000 when present.
- `dueAt`: optional; when present, MUST be a valid date. No lower bound — a
  past date is valid input (Edge Cases: overdue todos are allowed, not
  rejected).
- `isCompleted`: boolean; defaults to `false` on creation and is only ever
  set explicitly through an update.

### State transitions

The only state machine on a `Todo` is completion status:

```text
[not done] --(mark complete)--> [done]
[done]     --(mark incomplete)--> [not done]
```

Both transitions are reversible and have no side effects beyond persisting
the new `isCompleted` value and refreshing `updatedAt` (FR-004, User Story 2
acceptance scenarios 2–3).

### Deletion

Deletion is a hard delete (Assumptions: no trash/undo) — the row is removed
from `todos` and the API returns success only once the row is confirmed gone
(FR-006, FR-011).

### Empty state

When the `todos` table has zero rows, `GET /todos` returns an empty array; the
UI is responsible for rendering the distinct empty state described in FR-010
rather than treating `[]` as an error.
