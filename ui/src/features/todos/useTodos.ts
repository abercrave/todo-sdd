import { useState } from 'react'
import type { CreateTodoInput, Todo, UpdateTodoInput } from 'shared'

export type TodosStatus = 'loading' | 'error' | 'empty' | 'ready'

export interface UseTodosResult {
  todos: Todo[]
  status: TodosStatus
  error: string | null
  create: (input: CreateTodoInput) => Promise<void>
  update: (id: number, input: UpdateTodoInput) => Promise<void>
  remove: (id: number) => Promise<void>
}

export function useTodos(): UseTodosResult {
  const [todos] = useState<Todo[]>([])
  const [status] = useState<TodosStatus>('empty')
  const [error] = useState<string | null>(null)

  const create = async (_input: CreateTodoInput) => {}
  const update = async (_id: number, _input: UpdateTodoInput) => {}
  const remove = async (_id: number) => {}

  return { todos, status, error, create, update, remove }
}
