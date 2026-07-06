import { useTodos } from './features/todos/useTodos'
import { TodoForm } from './features/todos/TodoForm'
import { TodoList } from './features/todos/TodoList'
import './App.css'

function App() {
  const { todos, status, error, create } = useTodos()

  return (
    <main>
      <h1>Todos</h1>

      {error && <p role="alert">{error}</p>}

      <TodoForm onSubmit={create} />

      {status === 'loading' && <p>Loading todos…</p>}
      {status === 'empty' && <p>No todos yet.</p>}
      {(status === 'ready' || status === 'empty') && <TodoList todos={todos} />}
    </main>
  )
}

export default App
