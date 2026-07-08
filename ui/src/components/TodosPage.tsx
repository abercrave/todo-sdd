import { useMemo, useState } from 'react'
import { useTodos } from '../hooks/useTodos'
import { TodoForm } from './TodoForm'
import { TodoList } from './TodoList'
import { SortControl } from './SortControl'
import { sortTodos } from '../utilities/todoSort'
import type { SortField } from '../types/sort'

export function TodosPage() {
  const { todos, status, error, create, update, remove } = useTodos()
  // Default per FR-007: Date Created, most recent first. `sortTodos` only
  // sorts ascending (direction toggling arrives in a later user story), so
  // the ascending result is reversed to get "most recent first".
  const [sortField, setSortField] = useState<SortField>('createdAt')

  // Memoized so a full re-sort isn't triggered by every unrelated re-render
  // of this component (research.md §4) - only recomputed when the todo list
  // or the chosen sort field actually changes.
  const sortedTodos = useMemo(() => [...sortTodos(todos, sortField)].reverse(), [todos, sortField])

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
        <SortControl value={sortField} onValueChange={setSortField} />
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
