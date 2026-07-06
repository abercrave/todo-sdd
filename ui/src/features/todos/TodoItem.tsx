import { useState } from 'react'
import type { Todo } from 'shared'

export interface TodoItemProps {
  todo: Todo
  onToggle: (id: number, isCompleted: boolean) => Promise<void>
}

export function TodoItem({ todo, onToggle }: TodoItemProps) {
  const [error, setError] = useState<string | null>(null)

  const handleToggle = async () => {
    setError(null)
    try {
      await onToggle(todo.id, !todo.isCompleted)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update todo')
    }
  }

  return (
    <li>
      <label>
        <input
          type="checkbox"
          checked={todo.isCompleted}
          onChange={() => void handleToggle()}
        />
        <span>{todo.title}</span>
      </label>

      {todo.description && <p>{todo.description}</p>}
      {todo.dueAt && <p>Due {new Date(todo.dueAt).toLocaleDateString()}</p>}
      <p>{todo.isCompleted ? 'Done' : 'Not done'}</p>

      {error && <p role="alert">{error}</p>}
    </li>
  )
}
