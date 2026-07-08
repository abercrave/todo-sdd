import { describe, expect, it } from 'vitest'
import type { Todo } from 'shared'
import { isOverdue } from './todoOverdue'

const baseTodo: Todo = {
  id: 1,
  title: 'Buy groceries',
  description: 'Milk',
  isCompleted: false,
  dueAt: null,
  createdAt: new Date('2026-07-01T00:00:00.000Z'),
  updatedAt: new Date('2026-07-01T00:00:00.000Z'),
}

describe('isOverdue', () => {
  it('returns true for an incomplete todo with a past due date', () => {
    const todo: Todo = { ...baseTodo, dueAt: new Date('2020-01-01T00:00:00.000Z') }

    expect(isOverdue(todo, new Date('2026-07-07T00:00:00.000Z'))).toBe(true)
  })

  it('returns false for an incomplete todo with a future due date', () => {
    const todo: Todo = { ...baseTodo, dueAt: new Date('2099-01-01T00:00:00.000Z') }

    expect(isOverdue(todo, new Date('2026-07-07T00:00:00.000Z'))).toBe(false)
  })

  it('returns false for an incomplete todo with no due date', () => {
    const todo: Todo = { ...baseTodo, dueAt: null }

    expect(isOverdue(todo, new Date('2026-07-07T00:00:00.000Z'))).toBe(false)
  })

  it('returns false for a completed todo even with a past due date', () => {
    const todo: Todo = {
      ...baseTodo,
      isCompleted: true,
      dueAt: new Date('2020-01-01T00:00:00.000Z'),
    }

    expect(isOverdue(todo, new Date('2026-07-07T00:00:00.000Z'))).toBe(false)
  })

  it('returns false when the due date is exactly now', () => {
    const now = new Date('2026-07-07T12:00:00.000Z')
    const todo: Todo = { ...baseTodo, dueAt: new Date(now.getTime()) }

    expect(isOverdue(todo, now)).toBe(false)
  })
})
