import { useMemo, useState } from 'react'
import { useTodos } from '../hooks/useTodos'
import { TodoForm } from './TodoForm'
import { TodoList } from './TodoList'
import { SortControl } from './SortControl'
import { sortTodos } from '../utilities/todoSort'
import { DEFAULT_DIRECTION, type SortDirection, type SortField } from '../types/sort'

export function TodosPage() {
  const { todos, status, error, create, update, remove } = useTodos()
  // Default per FR-007: Date Created, most recent first.
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>(DEFAULT_DIRECTION.createdAt)

  // Selecting a new field applies that field's own default direction
  // (FR-016/FR-017) rather than carrying over whatever direction was active
  // for the previous field.
  function handleFieldChange(field: SortField) {
    setSortField(field)
    setSortDirection(DEFAULT_DIRECTION[field])
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
          onDirectionChange={setSortDirection}
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
