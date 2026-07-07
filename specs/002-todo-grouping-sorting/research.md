# Phase 0 Research: Completed Todo Grouping, Sorting & Overdue Highlighting

No `[NEEDS CLARIFICATION]` markers remained in the Technical Context, so this
research resolves the concrete design/best-practice decisions needed before
Phase 1.

## 1. Wiring Radix's `Form` primitive to the existing shared Zod schemas

**Decision**: Use `@radix-ui/react-form`'s `Form.Field` / `Form.Message`
`match` prop with a custom validator function that calls
`createTodoSchema`/`updateTodoSchema` (via `safeParse` on the single field's
slice) rather than Radix's built-in HTML constraint matchers (`valueMissing`,
`typeMismatch`, etc.). The message shown is the corresponding Zod issue
message, so there is exactly one place (`shared/src/todo.schema.ts`) that
defines what "required"/"too long"/"invalid date" means.

**Rationale**: The constitution's Code Quality principle requires validation
logic to be "defined once and shared" — if Radix's native HTML validation
attributes (`required`, `maxLength`) were used as the actual gate, validation
rules would exist in two places (JSX attributes and the Zod schema) and could
drift. Using Radix only for the accessible plumbing (labeling, error
association, focus management) and Zod for the actual pass/fail decision
keeps a single source of truth.

**Alternatives considered**:

- *Native HTML `required`/`pattern` attributes as the validation source*:
  rejected — duplicates the Zod rules and can't express the multi-field
  refinements already in `updateTodoSchema`.
- *`@radix-ui/react-form` uninstalled, keep hand-rolled `useState` + manual
  `aria-invalid`*: rejected per this feature's explicit direction to update
  the existing form elements onto Radix.

## 2. Testing Radix-based form and select components

**Decision**: Continue testing with React Testing Library, querying by
accessible role and label text (`getByRole('textbox', { name: 'Title' })`,
`getByRole('combobox', { name: 'Sort by' })`) rather than by tag name or
CSS class.

**Rationale**: Radix primitives render full ARIA semantics by design, so
role/label queries continue to work exactly as they did against native
elements — this is the intended migration path and requires no change to the
Testing Standards principle's expectations, only to the literal queries in
the existing `TodoForm.test.tsx`/`TodoItem.test.tsx` specs (native `<select>`
queries become combobox-role queries for the new `SortControl`).

**Alternatives considered**:

- *`data-testid` attributes*: rejected — accessible-role queries already
  work and better protect against regressions in the actual accessibility
  contract the constitution requires.

## 3. Client-side vs. server-side grouping/sorting/overdue detection

**Decision**: Fetch the full todo list as today (`GET /todos`, no new query
parameters) and perform grouping (active vs. completed), sorting, and
overdue detection entirely client-side in pure functions
(`utilities/todoGrouping.ts`, `utilities/todoSort.ts`, `utilities/todoOverdue.ts`).

**Rationale**: The existing scale/scope (one user, low hundreds of rows, no
pagination) is unchanged by this feature. Adding server-side sort/filter
query params would grow the API contract and duplicate logic across two
layers for no benefit at this scale — the same reasoning the base app's
`research.md` used to reject a client-side data-fetching library.

**Alternatives considered**:

- *`GET /todos?sort=&group=` query params computed in `TodosService`*:
  rejected as premature — revisit only if the list grows large enough that
  client-side sorting becomes a measurable performance problem (Performance
  Requirements would then justify server-side pagination/sorting together).

## 4. Avoiding unnecessary re-renders during sorting/grouping

**Decision**: Compute the grouped-and-sorted view with `useMemo`, keyed on
`[todos, sortField, sortDirection]`, in the hook or a thin selector used by
`TodosPage`, so sorting/grouping only re-runs when the todo list, the
selected sort field, or the selected direction actually changes.

**Rationale**: Directly implements the constitution's Performance
Requirements principle ("avoid unnecessary re-renders on every keystroke in
list views") and Frontend Architecture principle's memoization guidance —
without this, every keystroke in the form (which shares top-level state)
could otherwise trigger a full re-sort of the list.

**Alternatives considered**:

- *Sort/group inline in the render body of `TodoList`*: rejected — the
  Performance Requirements principle explicitly requires moving such
  computation out of the render path.

## 5. Centralizing API calls in a service layer

**Decision**: Extract the four `fetch` calls currently inside `useTodos.ts`
into a new `services/todosApi.ts` module (`listTodos`, `createTodo`,
`updateTodo`, `deleteTodo`), each returning parsed, schema-validated data.
`useTodos.ts` becomes a thin state-orchestration hook that calls these
functions and manages `status`/`error`/`todos` state.

**Rationale**: Directly required by the constitution's Frontend Architecture
& Reusability principle ("All API calls MUST be centralized in a service
layer rather than issued directly from components"), added in v1.2.0 after
the base app was built with `fetch` inline in the hook.

**Alternatives considered**:

- *Leave `fetch` calls in `useTodos.ts`*: rejected — this is the exact gap
  the new constitution principle calls out; this feature already touches
  every file involved, making now the lowest-cost time to fix it.

## 6. Prisma schema addition for `completed_at`

**Decision**: Add a nullable `completed_at DateTime? @db.Timestamptz(6)`
column to the `todos` model, with an index (`idx_todos_completed_at`).
`TodosService.update` sets it to the current time when `isCompleted`
transitions to `true`, and clears it to `null` when it transitions to
`false`.

**Rationale**: FR-007/FR-008 require sorting the Completed section by
completion time and require the system to record that time — it does not
exist on the current schema. The index supports that sort without a
full-table scan as the constitution's Performance Requirements principle
requires for date-based lookups.

**Alternatives considered**:

- *Derive "completed date" from `updated_at`*: rejected — `updated_at`
  changes on *any* field edit, not just completion, so it would silently
  give the wrong sort order the moment a completed todo's title is edited
  after completion.

## 7. API contract changes

**Decision**: Add `completedAt` (nullable, same shape as `dueAt`/`createdAt`)
to the `Todo` response shape only — it is system-managed like `createdAt`/
`updatedAt` and is never accepted in `createTodoSchema` or
`updateTodoSchema` request bodies. No new endpoints or query parameters.

**Rationale**: Keeps the write contract unchanged (still `PATCH { isCompleted
}` to trigger completion, per the base app's existing pattern) while
exposing the one new read field the UI needs for sorting/grouping.

**Alternatives considered**:

- *Accept a client-supplied `completedAt` on `PATCH`*: rejected — completion
  time must be authoritative server time, not client-supplied, to keep sort
  order trustworthy.

## 8. Adding "Title" as a sort field

**Decision**: `todoSort.ts` gains a `title` case using
`String.prototype.localeCompare` with `{ sensitivity: 'base' }` (case- and
accent-insensitive) as the comparator; `SortField` becomes `'createdAt' |
'updatedAt' | 'completedAt' | 'title'` in `types/sort.ts`, and `SortControl`
adds a fourth option.

**Rationale**: FR-014/FR-015 require alphabetical, case-insensitive sorting.
`localeCompare` with `sensitivity: 'base'` gives correct case-insensitive
ordering without hand-rolling `toLowerCase()` comparisons, which mishandle
locale-specific casing rules.

**Alternatives considered**:

- *`a.title.toLowerCase() < b.title.toLowerCase()`*: rejected — works for
  simple ASCII titles but is a well-known source of subtly wrong ordering
  for non-ASCII text; `localeCompare` is the standard-library answer to the
  same problem.
- *Natural/numeric-aware sort ("Item 2" before "Item 10")*: rejected per
  spec Assumptions — out of scope for this iteration.

## 9. Sort direction and the "descending mirrors ascending, including ties" requirement

**Decision**: `sortTodos(todos, field, direction)` always sorts ascending
first with a stable comparator, then, if `direction === 'desc'`, reverses the
resulting array in place — it does **not** negate the comparator. Each
`SortField` maps to its own default `SortDirection` via a
`DEFAULT_DIRECTION: Record<SortField, SortDirection>` constant in
`types/sort.ts`; selecting a new field looks up that field's default rather
than reusing whatever direction was active for the previous field (FR-018,
FR-019).

**Rationale**: FR-017 and the spec's tie edge case require descending to be
the *exact reverse* of ascending, including how tied items are ordered.
Negating a comparator (`-compare(a, b)`) keeps a stable sort's tie-order
identical in both directions (ties stay in original relative order either
way), which does not satisfy that requirement. Sorting ascending once and
reversing the array when needed both satisfies FR-017 exactly and avoids
writing two comparators per field.

**Alternatives considered**:

- *Negate the comparator for descending*: rejected — does not mirror tie
  order as FR-017 requires (see Rationale).
- *A separate descending comparator per field*: rejected — doubles the
  comparator surface for no behavioral difference from sort-then-reverse.
- *Remember a per-field last-used direction across field switches*:
  rejected per spec Assumptions — adds state and a "which direction was
  Title last on" question the spec explicitly avoids by defining one default
  per field.
