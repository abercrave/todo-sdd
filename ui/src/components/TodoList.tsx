import { TodoItem } from './TodoItem'
import { groupByCompletion } from '../utilities'
import type { TodoListProps } from '../interfaces'

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
