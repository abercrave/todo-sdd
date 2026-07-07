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

## Entity: Settings (NEW)

A single-row table persisting the app-wide sort preference so it survives a
page reload (FR-020–FR-022; `research.md` §10).

| Field                            | Type      | Required | Notes |
| --------------------------------- | --------- | -------- | ----- |
| `id`                               | integer   | fixed    | Always `1`; enforced by upserting on this id, not by a DB constraint — there is exactly one row |
| `sortField` (`sort_field`)         | string    | yes, default `"createdAt"` | One of `createdAt`, `updatedAt`, `completedAt`, `title` — validated by the shared `sortFieldSchema` enum |
| `sortDirection` (`sort_direction`) | string    | yes, default `"desc"`      | One of `asc`, `desc` — validated by the shared `sortDirectionSchema` enum |
| `updatedAt` (`updated_at`)         | timestamp | generated | Refreshed on every upsert |

### Validation rules

`sortField` and `sortDirection` are always written together (never
independently) via the shared `settingsSchema`, so the persisted pair can
never represent a field paired with a direction that wasn't its explicit
choice (FR-018, FR-022).

### State transitions

```text
[no row / defaults]  --(user changes sort field or direction)-->  [row with chosen field+direction]
[row with field A/direction X] --(user changes field or direction)--> [row upserted with new field/direction]
```

There is no delete; the row (once created) is only ever upserted with a new
`sortField`/`sortDirection` pair.

## Types: SortField & SortDirection (shared frontend/backend shapes)

- **SortField**: `'createdAt' | 'updatedAt' | 'completedAt' | 'title'` — the
  union of values the sort control can be set to; consumed by
  `utilities/todoSort.ts`, `components/SortControl.tsx`, and (as
  `sortFieldSchema`) the `Settings` entity above.
- **SortDirection**: `'asc' | 'desc'`; also validated as `sortDirectionSchema`
  for the `Settings` entity.
- **DEFAULT_DIRECTION**: a `Record<SortField, SortDirection>` constant — one
  default direction per field (`createdAt`/`updatedAt`/`completedAt` → `desc`,
  `title` → `asc`, per `spec.md`'s Assumptions). Selecting a field applies
  its own default direction rather than carrying over the previous field's
  direction (FR-018).
