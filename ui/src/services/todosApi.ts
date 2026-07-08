import { todoListSchema, todoSchema } from 'shared'
import type { CreateTodoInput, Todo, UpdateTodoInput } from 'shared'
import { readErrorMessage } from './apiError'

const API_BASE = '/todos'

export { toErrorMessage } from './apiError'

export async function listTodos(): Promise<Todo[]> {
  const response = await fetch(API_BASE)
  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }
  return todoListSchema.parse(await response.json())
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }
  return todoSchema.parse(await response.json())
}

export async function updateTodo(id: number, input: UpdateTodoInput): Promise<Todo> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }
  return todoSchema.parse(await response.json())
}

export async function deleteTodo(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }
}
