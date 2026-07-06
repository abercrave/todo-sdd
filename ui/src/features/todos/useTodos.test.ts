import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useTodos } from './useTodos'

describe('useTodos', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('parses dueAt/createdAt/updatedAt from the API response into real Date objects', async () => {
    const apiTodo = {
      id: 1,
      title: 'Buy groceries',
      description: null,
      isCompleted: false,
      dueAt: '2026-07-10T00:00:00.000Z',
      createdAt: '2026-07-01T00:00:00.000Z',
      updatedAt: '2026-07-01T00:00:00.000Z',
    }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([apiTodo]),
      }),
    )

    const { result } = renderHook(() => useTodos())

    await waitFor(() => expect(result.current.status).toBe('ready'))

    expect(result.current.todos[0].dueAt).toBeInstanceOf(Date)
    expect(result.current.todos[0].createdAt).toBeInstanceOf(Date)
    expect(result.current.todos[0].updatedAt).toBeInstanceOf(Date)
  })

  it('shows a friendly message, not raw Zod issue JSON, when the API response fails validation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        // Missing every required field - todoListSchema.parse will throw a ZodError.
        json: () => Promise.resolve([{}]),
      }),
    )

    const { result } = renderHook(() => useTodos())

    await waitFor(() => expect(result.current.status).toBe('error'))

    expect(result.current.error).toBe('Received unexpected data from the server.')
    expect(result.current.error).not.toContain('{')
  })
})
