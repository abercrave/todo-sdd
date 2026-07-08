import { useCallback, useEffect, useState } from 'react'
import type { CreateTodoInput, Todo, UpdateTodoInput } from 'shared'
import { createTodo, deleteTodo, listTodos, toErrorMessage, updateTodo } from '../services/todosApi'
import { TODOS_STATUS } from '../constants/todosStatus'
import type { TodosStatus } from '../types/todosStatus'

export interface UseTodosResult {
  todos: Todo[]
  status: TodosStatus
  error: string | null
  create: (input: CreateTodoInput) => Promise<void>
  update: (id: number, input: UpdateTodoInput) => Promise<void>
  remove: (id: number) => Promise<void>
}

function statusForTodos(todos: Todo[]): TodosStatus {
  return todos.length === 0 ? TODOS_STATUS.EMPTY : TODOS_STATUS.READY
}

export function useTodos(): UseTodosResult {
  const [todos, setTodos] = useState<Todo[]>([])
  const [status, setStatus] = useState<TodosStatus>(TODOS_STATUS.LOADING)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setStatus(TODOS_STATUS.LOADING)
    setError(null)
    try {
      const data = await listTodos()
      setTodos(data)
      setStatus(statusForTodos(data))
    } catch (err) {
      setStatus(TODOS_STATUS.ERROR)
      setError(toErrorMessage(err, 'Failed to load todos'))
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const create = useCallback(async (input: CreateTodoInput) => {
    try {
      const created = await createTodo(input)
      setTodos((current) => {
        const next = [...current, created]
        setStatus(statusForTodos(next))
        return next
      })
      setError(null)
    } catch (err) {
      // The list is left untouched on failure - nothing was added until the API confirmed success.
      setError(toErrorMessage(err, 'Failed to create todo'))
      throw err
    }
  }, [])

  const update = useCallback(async (id: number, input: UpdateTodoInput) => {
    try {
      const updated = await updateTodo(id, input)
      setTodos((current) => current.map((todo) => (todo.id === id ? updated : todo)))
      setError(null)
    } catch (err) {
      // The item is left untouched on failure - nothing changed until the API confirmed success.
      setError(toErrorMessage(err, 'Failed to update todo'))
      throw err
    }
  }, [])

  const remove = useCallback(async (id: number) => {
    try {
      await deleteTodo(id)
      setTodos((current) => {
        const next = current.filter((todo) => todo.id !== id)
        setStatus(statusForTodos(next))
        return next
      })
      setError(null)
    } catch (err) {
      // The item is left untouched on failure - nothing was removed until the API confirmed success.
      setError(toErrorMessage(err, 'Failed to delete todo'))
      throw err
    }
  }, [])

  return { todos, status, error, create, update, remove }
}
