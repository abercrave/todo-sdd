import type { Todo, UpdateTodoInput } from 'shared'
import { TodoItem } from './TodoItem'
import { groupByCompletion } from '../utilities/todoGrouping'

export interface TodoListProps {
  /**
   * Todos in the order they should be displayed. Callers are expected to
   * apply any sort (see `utilities/todoSort`) before passing todos in here -
   * `groupByCompletion` only partitions by completion status and preserves
   * the relative order of the array it's given.
   */
  todos: Todo[]
  onToggle: (id: number, isCompleted: boolean) => Promise<void>
  onUpdate: (id: number, input: UpdateTodoInput) => Promise<void>
  onRemove: (id: number) => Promise<void>
}

export function TodoList({ todos, onToggle, onUpdate, onRemove }: TodoListProps) {
  if (todos.length === 0) {
    return <p className="empty-state">No todos yet. Add one above to get started.</p>
  }

  const { active, completed } = groupByCompletion(todos)

  return (
    <div className="todo-sections">
      <ul className="todo-list">
        {active.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))}
      </ul>

      {completed.length > 0 && (
        <section className="completed-section">
          <h2 className="completed-heading">Completed</h2>
          <ul className="todo-list">
            {completed.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onUpdate={onUpdate}
                onRemove={onRemove}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
