import type { Todo } from 'shared'

export interface GroupedTodos {
  active: Todo[]
  completed: Todo[]
}

/**
 * Partitions todos into active (incomplete) and completed groups, preserving
 * the relative order of items within each group.
 */
export function groupByCompletion(todos: Todo[]): GroupedTodos {
  const active: Todo[] = []
  const completed: Todo[] = []

  for (const todo of todos) {
    if (todo.isCompleted) {
      completed.push(todo)
    } else {
      active.push(todo)
    }
  }

  return { active, completed }
}
