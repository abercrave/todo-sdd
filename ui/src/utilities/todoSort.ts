import type { Todo } from 'shared'
import type { SortDirection, SortField } from '../types/sort'

/**
 * Ascending comparator for a single sort field. Dates compare by epoch
 * millisecond; title compares case-insensitively via `localeCompare` with
 * `sensitivity: 'base'` rather than hand-rolled `toLowerCase()` comparison,
 * which mishandles locale-specific casing rules (FR-012, FR-013;
 * research.md §6).
 */
function compareAscending(a: Todo, b: Todo, field: SortField): number {
  if (field === 'title') {
    return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
  }
  return a[field].getTime() - b[field].getTime()
}

/**
 * Returns a new array of todos sorted by the given field and direction.
 * Does not mutate the input array. Always sorts ascending first with the
 * native, stable `Array.prototype.sort` (so todos with equal values for
 * `field` keep their relative order), then reverses the resulting array
 * when `direction === 'desc'`.
 *
 * Reversing the ascending result — rather than negating the comparator —
 * is required so that descending order is the *exact* reverse of ascending,
 * including tie order (FR-015; research.md §7). Negating a comparator keeps
 * a stable sort's tie order identical in both directions, which does not
 * satisfy that requirement.
 */
export function sortTodos(todos: Todo[], field: SortField, direction: SortDirection): Todo[] {
  const ascending = [...todos].sort((a, b) => compareAscending(a, b, field))
  return direction === 'desc' ? ascending.reverse() : ascending
}
