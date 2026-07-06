import { useTodos } from './features/todos/useTodos'
import './App.css'

function App() {
  const { status } = useTodos()

  return (
    <main>
      <h1>Todos</h1>
      <p>Status: {status}</p>
    </main>
  )
}

export default App
