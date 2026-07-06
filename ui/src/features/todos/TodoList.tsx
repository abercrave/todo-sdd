import type { Todo, UpdateTodoInput } from 'shared'
import { TodoItem } from './TodoItem'

export interface TodoListProps {
  todos: Todo[]
  onToggle: (id: number, isCompleted: boolean) => Promise<void>
  onUpdate: (id: number, input: UpdateTodoInput) => Promise<void>
  onRemove: (id: number) => Promise<void>
}

export function TodoList({ todos, onToggle, onUpdate, onRemove }: TodoListProps) {
  if (todos.length === 0) {
    return <p className="empty-state">No todos yet. Add one above to get started.</p>
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      ))}
    </ul>
  )
}
