import type { Todo, UpdateTodoInput } from "shared";

export interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number, isCompleted: boolean) => Promise<void>;
  onUpdate: (id: number, input: UpdateTodoInput) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
}
