import { useCallback, useEffect, useState } from 'react'
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

const API_BASE = '/todos'

function statusForTodos(todos: Todo[]): TodosStatus {
  return todos.length === 0 ? 'empty' : 'ready'
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string }
    return body.message ?? `Request failed with status ${response.status}`
  } catch {
    return `Request failed with status ${response.status}`
  }
}

export function useTodos(): UseTodosResult {
  const [todos, setTodos] = useState<Todo[]>([])
  const [status, setStatus] = useState<TodosStatus>('loading')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const response = await fetch(API_BASE)
      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }
      const data = (await response.json()) as Todo[]
      setTodos(data)
      setStatus(statusForTodos(data))
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to load todos')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const create = useCallback(async (input: CreateTodoInput) => {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }
      const created = (await response.json()) as Todo
      setTodos((current) => {
        const next = [...current, created]
        setStatus(statusForTodos(next))
        return next
      })
      setError(null)
    } catch (err) {
      // The list is left untouched on failure - nothing was added until the API confirmed success.
      setError(err instanceof Error ? err.message : 'Failed to create todo')
      throw err
    }
  }, [])

  const update = useCallback(async (id: number, input: UpdateTodoInput) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }
      const updated = (await response.json()) as Todo
      setTodos((current) => current.map((todo) => (todo.id === id ? updated : todo)))
      setError(null)
    } catch (err) {
      // The item is left untouched on failure - nothing changed until the API confirmed success.
      setError(err instanceof Error ? err.message : 'Failed to update todo')
      throw err
    }
  }, [])

  const remove = useCallback(async (id: number) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }
      setTodos((current) => {
        const next = current.filter((todo) => todo.id !== id)
        setStatus(statusForTodos(next))
        return next
      })
      setError(null)
    } catch (err) {
      // The item is left untouched on failure - nothing was removed until the API confirmed success.
      setError(err instanceof Error ? err.message : 'Failed to delete todo')
      throw err
    }
  }, [])

  return { todos, status, error, create, update, remove }
}
