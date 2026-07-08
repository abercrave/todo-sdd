import type { Todo } from 'shared'

export function isOverdue(todo: Todo, now: Date): boolean {
  return !todo.isCompleted && todo.dueAt !== null && todo.dueAt.getTime() < now.getTime()
}
