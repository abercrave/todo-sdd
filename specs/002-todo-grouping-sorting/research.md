# Phase 0 Research: Completed Todo Grouping, Sorting & Overdue Highlighting

No `[NEEDS CLARIFICATION]` markers remained in the Technical Context, so this
research resolves the concrete design/best-practice decisions needed before
Phase 1.

**Note**: An earlier iteration of this research included decisions for a
`completed_at` Prisma column and a `Date Completed` sort field. Both were
removed after the spec dropped that sort field (see spec.md's amendment log).
Section numbers below have been renumbered accordingly.

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

## 6. Adding "Title" as a sort field

**Decision**: `todoSort.ts` gains a `title` case using
`String.prototype.localeCompare` with `{ sensitivity: 'base' }` (case- and
accent-insensitive) as the comparator; `SortField` is `'createdAt' |
'updatedAt' | 'title'` in `types/sort.ts`, and `SortControl` offers all
three as options.

**Rationale**: FR-012/FR-013 require alphabetical, case-insensitive sorting.
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

## 7. Sort direction and the "descending mirrors ascending, including ties" requirement

**Decision**: `sortTodos(todos, field, direction)` always sorts ascending
first with a stable comparator, then, if `direction === 'desc'`, reverses the
resulting array in place — it does **not** negate the comparator. Each
`SortField` maps to its own default `SortDirection` via a
`DEFAULT_DIRECTION: Record<SortField, SortDirection>` constant in
`types/sort.ts`; selecting a new field looks up that field's default rather
than reusing whatever direction was active for the previous field (FR-016,
FR-017).

**Rationale**: FR-015 and the spec's tie edge case require descending to be
the *exact reverse* of ascending, including how tied items are ordered.
Negating a comparator (`-compare(a, b)`) keeps a stable sort's tie-order
identical in both directions (ties stay in original relative order either
way), which does not satisfy that requirement. Sorting ascending once and
reversing the array when needed both satisfies FR-015 exactly and avoids
writing two comparators per field.

**Alternatives considered**:

- *Negate the comparator for descending*: rejected — does not mirror tie
  order as FR-015 requires (see Rationale).
- *A separate descending comparator per field*: rejected — doubles the
  comparator surface for no behavioral difference from sort-then-reverse.
- *Remember a per-field last-used direction across field switches*:
  rejected per spec Assumptions — adds state and a "which direction was
  Title last on" question the spec explicitly avoids by defining one default
  per field.

## 8. Persisting the sort preference: a dedicated `settings` resource

**Decision**: Add a new Prisma model `settings` with a single, fixed-id row
(`id = 1`, enforced at the application layer via upsert-by-id rather than a
DB constraint), columns `sort_field` and `sort_direction` (plain strings,
validated by the shared `sortFieldSchema`/`sortDirectionSchema` Zod enums —
same "Zod is the single source of truth" pattern as `todos`), plus
`updated_at`. Expose it as `GET /settings` (returns the current row, or the
documented defaults if no row exists yet) and `PUT /settings` (upserts both
`sortField` and `sortDirection` together, never independently). Valid values
for `sort_field` are `createdAt`, `updatedAt`, and `title` — the same three
fields the UI's sort control offers, no more.

**Rationale**: FR-018–FR-020 require the *currently selected* sort field and
direction to survive a reload. A dedicated single-row resource is the
simplest shape that satisfies this: no per-user scoping is needed (the app
has one shared todo list and no accounts, per existing Assumptions), and a
full-replace `PUT` avoids the ambiguity of a partial update leaving field and
direction out of sync (FR-016 ties them together whenever the field changes).

**Alternatives considered**:

- *Generic key-value `settings(key, value)` table*: rejected as premature
  generalization (YAGNI) — there is exactly one setting today; a typed
  `sort_field`/`sort_direction` pair is simpler to validate and query than a
  serialized blob, and the constitution's Code Quality principle favors
  explicit, well-named fields over stringly-typed generic storage.
- *Store the preference in browser `localStorage` instead of the database*:
  rejected — the feature explicitly directs persistence "using a new
  settings table in the database," and `localStorage` would not satisfy
  that (it also wouldn't survive a different browser/device, which a shared
  single-list app arguably should support).
- *Fold the setting into the existing `todos` table or a per-todo field*:
  rejected — this is an app-wide preference unrelated to any individual
  todo; conflating the two would violate the single-responsibility guidance
  in Code Quality.
- *`PATCH /settings` with independently-optional fields*: rejected — FR-016
  requires field and direction to change together (new field ⇒ that field's
  default direction), so a partial-update endpoint would allow a caller to
  put them out of sync; a full-replace `PUT` makes that state unrepresentable.

## 9. Loading the settings preference without blocking or racing the todo list

**Decision**: `TodosPage` fetches `GET /todos` and `GET /settings` in
parallel (e.g., both kicked off in the same effect, not one awaiting the
other). While `GET /settings` is in flight or if it fails, the sort control
uses the documented per-field defaults (`DEFAULT_DIRECTION`, `createdAt` as
the default field) exactly as if no preference had ever been saved — there
is no dedicated loading or error state for settings. The same fail-open
principle applies to a failed *save*: a rejected `PUT /settings` still
applies the change to the current view and is retried implicitly on the
next change, with no error surfaced (FR-021).

**Rationale**: FR-019 already requires falling back to defaults when no
preference exists or it can't be read, so a failed/slow settings fetch is
handled by the same fallback path rather than a new error state — this keeps
User Experience Consistency intact (no new failure mode introduced) and
Performance Requirements intact (fetching in parallel means the extra
request cannot push out Largest Contentful Paint the way a sequential
`await getSettings()` before `await listTodos()` would).

**Alternatives considered**:

- *Block rendering the todo list until `GET /settings` resolves*: rejected —
  adds a second network round trip to the critical rendering path for a
  preference that has a well-defined default; directly works against the
  Performance Requirements principle.
- *Surface a distinct error state when `GET /settings` fails, or when a save
  fails*: rejected — over-specifies a failure the user can't act on;
  falling back to / staying on a reasonable value is strictly better UX than
  an error banner for a non-critical preference.
