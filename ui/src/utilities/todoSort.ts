import type { Todo } from 'shared'
import type { SortField } from '../types/sort'

/**
 * Returns a new array of todos sorted ascending by the given date field.
 * Does not mutate the input array. Relies on the native, stable
 * `Array.prototype.sort` so todos with equal values for `field` keep their
 * relative order (research.md §4/§7).
 */
export function sortTodos(todos: Todo[], field: SortField): Todo[] {
  return [...todos].sort((a, b) => a[field].getTime() - b[field].getTime())
}
