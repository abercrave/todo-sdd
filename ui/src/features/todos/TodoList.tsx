import type { Todo } from 'shared'
import { TodoItem } from './TodoItem'

export interface TodoListProps {
  todos: Todo[]
  onToggle: (id: number, isCompleted: boolean) => Promise<void>
}

export function TodoList({ todos, onToggle }: TodoListProps) {
  if (todos.length === 0) {
    return <p>No todos yet. Add one above to get started.</p>
  }

  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} />
      ))}
    </ul>
  )
}
