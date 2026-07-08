import type { Todo, UpdateTodoInput } from "shared";

export interface TodoListProps {
  /**
   * Todos in the order they should be displayed. Callers are expected to
   * apply any sort (see `utilities/todoSort`) before passing todos in here -
   * `groupByCompletion` only partitions by completion status and preserves
   * the relative order of the array it's given.
   */
  todos: Todo[];
  onToggle: (id: number, isCompleted: boolean) => Promise<void>;
  onUpdate: (id: number, input: UpdateTodoInput) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
}
