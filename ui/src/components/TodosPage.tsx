import { useMemo } from 'react'
import { useTodos } from '../hooks/useTodos'
import { useSortPreference } from '../hooks/useSortPreference'
import { TodoForm } from './TodoForm'
import { TodoList } from './TodoList'
import { SortControl } from './SortControl'
import { sortTodos } from '../utilities/todoSort'
import { DEFAULT_DIRECTION, type SortDirection, type SortField } from '../types/sort'

export function TodosPage() {
  // Sibling hooks, each with their own effect: `useTodos` fetches GET /todos
  // and `useSortPreference` fetches GET /settings in parallel, not one
  // awaiting the other (research.md §9).
  const { todos, status, error, create, update, remove } = useTodos()
  const { sortField, sortDirection, setSort } = useSortPreference()

  // Selecting a new field applies that field's own default direction
  // (FR-016/FR-017) rather than carrying over whatever direction was active
  // for the previous field.
  function handleFieldChange(field: SortField) {
    setSort(field, DEFAULT_DIRECTION[field])
  }

  // Toggling direction alone must retain the currently selected field
  // (FR-016).
  function handleDirectionChange(direction: SortDirection) {
    setSort(sortField, direction)
  }

  // Memoized so a full re-sort isn't triggered by every unrelated re-render
  // of this component (research.md §4) - only recomputed when the todo list,
  // the chosen sort field, or the chosen direction actually changes.
  const sortedTodos = useMemo(
    () => sortTodos(todos, sortField, sortDirection),
    [todos, sortField, sortDirection],
  )

  return (
    <main className="todos-page">
      <h1>Todos</h1>

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      <TodoForm onSubmit={create} />

      {(status === 'ready' || status === 'empty') && (
        <SortControl
          value={sortField}
          onValueChange={handleFieldChange}
          direction={sortDirection}
          onDirectionChange={handleDirectionChange}
        />
      )}

      {status === 'loading' && <p className="loading-state">Loading todos…</p>}
      {(status === 'ready' || status === 'empty') && (
        <TodoList
          todos={sortedTodos}
          onToggle={(id, isCompleted) => update(id, { isCompleted })}
          onUpdate={update}
          onRemove={remove}
        />
      )}
    </main>
  )
}
