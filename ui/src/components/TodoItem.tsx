import { useState } from 'react'
import * as Checkbox from '@radix-ui/react-checkbox'
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
      <li className="todo-item todo-item-editing">
        <TodoForm
          submitLabel="Save changes"
          initialValues={{
            title: todo.title,
            description: todo.description ?? '',
            dueAt: todo.dueAt ? toDateInputValue(todo.dueAt) : '',
          }}
          onSubmit={handleEditSubmit}
        />
        <div className="todo-actions">
          <button type="button" className="button button-secondary" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </div>
      </li>
    )
  }

  return (
    <li className={todo.isCompleted ? 'todo-item todo-item-done' : 'todo-item'}>
      <label className="todo-checkbox">
        <Checkbox.Root
          className="todo-checkbox-control"
          checked={todo.isCompleted}
          onCheckedChange={() => void handleToggle()}
        >
          <Checkbox.Indicator className="todo-checkbox-indicator">✓</Checkbox.Indicator>
        </Checkbox.Root>
        <span className="todo-title">{todo.title}</span>
      </label>

      {todo.description && <p className="todo-description">{todo.description}</p>}
      {todo.dueAt && <p className="todo-due">Due {new Date(todo.dueAt).toLocaleDateString()}</p>}
      <p className="todo-status">{todo.isCompleted ? 'Done' : 'Not done'}</p>

      <div className="todo-actions">
        <button type="button" className="button button-secondary" onClick={() => setIsEditing(true)}>
          Edit
        </button>
        <button type="button" className="button button-danger" onClick={() => void handleRemove()}>
          Delete
        </button>
      </div>

      {(toggleError ?? removeError) && (
        <p className="alert" role="alert">
          {toggleError ?? removeError}
        </p>
      )}
    </li>
  )
}
