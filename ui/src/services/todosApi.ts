import { todoListSchema, todoSchema } from 'shared'
import type { CreateTodoInput, Todo, UpdateTodoInput } from 'shared'

const API_BASE = '/todos'

export function isZodError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { name?: unknown }).name === 'ZodError' &&
    Array.isArray((err as { issues?: unknown }).issues)
  )
}

export function toErrorMessage(err: unknown, fallback: string): string {
  if (isZodError(err)) {
    return 'Received unexpected data from the server.'
  }
  return err instanceof Error ? err.message : fallback
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string }
    return body.message ?? `Request failed with status ${response.status}`
  } catch {
    return `Request failed with status ${response.status}`
  }
}

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
