import { useTodos } from './useTodos'
import { TodoForm } from './TodoForm'
import { TodoList } from './TodoList'

export function TodosPage() {
  const { todos, status, error, create, update, remove } = useTodos()

  return (
    <main className="todos-page">
      <h1>Todos</h1>

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      <TodoForm onSubmit={create} />

      {status === 'loading' && <p className="loading-state">Loading todos…</p>}
      {(status === 'ready' || status === 'empty') && (
        <TodoList
          todos={todos}
          onToggle={(id, isCompleted) => update(id, { isCompleted })}
          onUpdate={update}
          onRemove={remove}
        />
      )}
    </main>
  )
}
