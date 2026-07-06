import { useState } from 'react'
import type { CreateTodoInput, Todo, UpdateTodoInput } from 'shared'
import { TodoForm } from './TodoForm'

export interface TodoItemProps {
  todo: Todo
  onToggle: (id: number, isCompleted: boolean) => Promise<void>
  onUpdate: (id: number, input: UpdateTodoInput) => Promise<void>
  onRemove: (id: number) => Promise<void>
}

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function TodoItem({ todo, onToggle, onUpdate, onRemove }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [toggleError, setToggleError] = useState<string | null>(null)
  const [removeError, setRemoveError] = useState<string | null>(null)

  const handleToggle = async () => {
    setToggleError(null)
    try {
      await onToggle(todo.id, !todo.isCompleted)
    } catch (err) {
      setToggleError(err instanceof Error ? err.message : 'Failed to update todo')
    }
  }

  const handleRemove = async () => {
    setRemoveError(null)
    try {
      await onRemove(todo.id)
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : 'Failed to delete todo')
    }
  }

  const handleEditSubmit = async (input: CreateTodoInput) => {
    await onUpdate(todo.id, input)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <li>
        <TodoForm
          submitLabel="Save changes"
          initialValues={{
            title: todo.title,
            description: todo.description ?? '',
            dueAt: todo.dueAt ? toDateInputValue(todo.dueAt) : '',
          }}
          onSubmit={handleEditSubmit}
        />
        <button type="button" onClick={() => setIsEditing(false)}>
          Cancel
        </button>
      </li>
    )
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

      <button type="button" onClick={() => setIsEditing(true)}>
        Edit
      </button>
      <button type="button" onClick={() => void handleRemove()}>
        Delete
      </button>

      {(toggleError ?? removeError) && <p role="alert">{toggleError ?? removeError}</p>}
    </li>
  )
}
