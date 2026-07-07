# Phase 1 Data Model: Completed Todo Grouping, Sorting & Overdue Highlighting

## Entity: Todo (extended)

Same `todos` table as the base app (`specs/001-todo-app/data-model.md`), with
one addition.

| Field                           | Type                      | Required               | Notes                                                                                     |
| -------------------------------- | ------------------------- | ----------------------- | ------------------------------------------------------------------------------------------- |
| `completedAt` (`completed_at`)   | timestamp, timezone-aware | no                      | NEW — set to the current server time when `isCompleted` transitions to `true`; cleared to `null` when it transitions back to `false` (FR-007, FR-008) |

All other fields (`id`, `title`, `description`, `isCompleted`, `dueAt`,
`createdAt`, `updatedAt`) are unchanged from the base app.

### Validation rules

`completedAt` is **not** part of `createTodoSchema` or `updateTodoSchema` —
it is system-managed, like `createdAt`/`updatedAt`, and only ever appears in
the response shape (`todoSchema`). Clients cannot set it directly.

### State transitions (extended)

```text
[not done] --(mark complete)--> [done]         completedAt := now()
[done]     --(mark incomplete)--> [not done]   completedAt := null
```

This refines the base app's completion state machine: both transitions now
also write/clear `completedAt` alongside `isCompleted`, in the same update.

### Derived view state (client-side only, not persisted)

These are computed from the `Todo[]` list on every render (memoized — see
`research.md` §4) and are not new entity fields:

- **Section**: `active` when `isCompleted` is `false`, `completed` when
  `true` (FR-001).
- **Overdue**: `true` when `isCompleted` is `false` AND `dueAt` is not `null`
  AND `dueAt` is strictly before the current time (FR-010, FR-012;
  Assumptions).
- **Sort key**: one of `createdAt`, `updatedAt`, `completedAt`, or `title`,
  selected by the user via the sort control (FR-005–FR-007, FR-014).
  `completedAt` is only a meaningful sort key within the `completed` section,
  since `active` todos never have a value for it.
- **Sort direction**: `asc` or `desc`, selected independently of the sort
  field but defaulting per-field (FR-016–FR-019); descending is always the
  reverse of ascending for the same field, including tie order
  (`research.md` §9).

## New types: SortField & SortDirection (frontend-only)

- **SortField**: `'createdAt' | 'updatedAt' | 'completedAt' | 'title'` — the
  union of values the sort control can be set to; consumed by
  `utilities/todoSort.ts` and `components/SortControl.tsx`. Not persisted.
- **SortDirection**: `'asc' | 'desc'`. Not persisted.
- **DEFAULT_DIRECTION**: a `Record<SortField, SortDirection>` constant — one
  default direction per field (`createdAt`/`updatedAt`/`completedAt` → `desc`,
  `title` → `asc`, per `spec.md`'s Assumptions). Selecting a field applies
  its own default direction rather than carrying over the previous field's
  direction (FR-018).
