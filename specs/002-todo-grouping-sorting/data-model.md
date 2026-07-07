# Phase 1 Data Model: Completed Todo Grouping, Sorting & Overdue Highlighting

## Entity: Todo (unchanged)

This feature does not add or modify any field on the `todos` table — see
`specs/001-todo-app/data-model.md` for the base entity (`id`, `title`,
`description`, `isCompleted`, `dueAt`, `createdAt`, `updatedAt`). An earlier
iteration of this feature added a `completedAt` field to support a "Date
Completed" sort option; that option was removed from the spec (see spec.md's
amendment log), so no schema change to `todos` is needed.

### Derived view state (client-side only, not persisted)

These are computed from the `Todo[]` list on every render (memoized — see
`research.md` §4) and are not entity fields:

- **Section**: `active` when `isCompleted` is `false`, `completed` when
  `true` (FR-001).
- **Overdue**: `true` when `isCompleted` is `false` AND `dueAt` is not `null`
  AND `dueAt` is strictly before the current time (FR-008, FR-010;
  Assumptions).
- **Sort key**: one of `createdAt`, `updatedAt`, or `title`, selected by the
  user via the sort control (FR-005, FR-006, FR-012), applied identically to
  both the active and Completed sections.
- **Sort direction**: `asc` or `desc`, selected independently of the sort
  field but defaulting per-field (FR-014–FR-017); descending is always the
  reverse of ascending for the same field, including tie order
  (`research.md` §7).

## Entity: Settings (NEW)

A single-row table persisting the app-wide sort preference so it survives a
page reload (FR-018–FR-020; `research.md` §8).

| Field                            | Type      | Required | Notes |
| --------------------------------- | --------- | -------- | ----- |
| `id`                               | integer   | fixed    | Always `1`; enforced by upserting on this id, not by a DB constraint — there is exactly one row |
| `sortField` (`sort_field`)         | string    | yes, default `"createdAt"` | One of `createdAt`, `updatedAt`, `title` — validated by the shared `sortFieldSchema` enum |
| `sortDirection` (`sort_direction`) | string    | yes, default `"desc"`      | One of `asc`, `desc` — validated by the shared `sortDirectionSchema` enum |
| `updatedAt` (`updated_at`)         | timestamp | generated | Refreshed on every upsert |

### Validation rules

`sortField` and `sortDirection` are always written together (never
independently) via the shared `settingsSchema`, so the persisted pair can
never represent a field paired with a direction that wasn't its explicit
choice (FR-016, FR-020).

### State transitions

```text
[no row / defaults]  --(user changes sort field or direction)-->  [row with chosen field+direction]
[row with field A/direction X] --(user changes field or direction)--> [row upserted with new field/direction]
```

There is no delete; the row (once created) is only ever upserted with a new
`sortField`/`sortDirection` pair.

## Types: SortField & SortDirection (shared frontend/backend shapes)

- **SortField**: `'createdAt' | 'updatedAt' | 'title'` — the union of values
  the sort control can be set to; consumed by `utilities/todoSort.ts`,
  `components/SortControl.tsx`, and (as `sortFieldSchema`) the `Settings`
  entity above.
- **SortDirection**: `'asc' | 'desc'`; also validated as `sortDirectionSchema`
  for the `Settings` entity.
- **DEFAULT_DIRECTION**: a `Record<SortField, SortDirection>` constant — one
  default direction per field (`createdAt`/`updatedAt` → `desc`, `title` →
  `asc`, per `spec.md`'s Assumptions). Selecting a field applies its own
  default direction rather than carrying over the previous field's
  direction (FR-016).
