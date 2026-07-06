import { useTodos } from './features/todos/useTodos'
import { TodoForm } from './features/todos/TodoForm'
import { TodoList } from './features/todos/TodoList'
import './App.css'

function App() {
  const { todos, status, error, create, update } = useTodos()

  return (
    <main>
      <h1>Todos</h1>

      {error && <p role="alert">{error}</p>}

      <TodoForm onSubmit={create} />

      {status === 'loading' && <p>Loading todos…</p>}
      {(status === 'ready' || status === 'empty') && (
        <TodoList
          todos={todos}
          onToggle={(id, isCompleted) => update(id, { isCompleted })}
        />
      )}
    </main>
  )
}

export default App
