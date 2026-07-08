import { describe, expect, it } from 'vitest'
import type { Todo } from 'shared'
import { groupByCompletion } from './todoGrouping'

function makeTodo(overrides: Partial<Todo> & { id: number }): Todo {
  return {
    title: `Todo ${overrides.id}`,
    description: null,
    isCompleted: false,
    dueAt: null,
    createdAt: new Date('2026-07-01T00:00:00.000Z'),
    updatedAt: new Date('2026-07-01T00:00:00.000Z'),
    ...overrides,
  }
}

describe('groupByCompletion', () => {
  it('splits a mixed array into active and completed groups, preserving relative order', () => {
    const todos = [
      makeTodo({ id: 1, isCompleted: false }),
      makeTodo({ id: 2, isCompleted: true }),
      makeTodo({ id: 3, isCompleted: false }),
      makeTodo({ id: 4, isCompleted: true }),
    ]

    const result = groupByCompletion(todos)

    expect(result.active.map((todo) => todo.id)).toEqual([1, 3])
    expect(result.completed.map((todo) => todo.id)).toEqual([2, 4])
  })

  it('produces an empty completed group when all todos are incomplete', () => {
    const todos = [makeTodo({ id: 1, isCompleted: false }), makeTodo({ id: 2, isCompleted: false })]

    const result = groupByCompletion(todos)

    expect(result.active).toHaveLength(2)
    expect(result.completed).toEqual([])
  })

  it('produces an empty active group when all todos are complete', () => {
    const todos = [makeTodo({ id: 1, isCompleted: true }), makeTodo({ id: 2, isCompleted: true })]

    const result = groupByCompletion(todos)

    expect(result.active).toEqual([])
    expect(result.completed).toHaveLength(2)
  })

  it('returns empty arrays for both groups when given an empty list', () => {
    const result = groupByCompletion([])

    expect(result.active).toEqual([])
    expect(result.completed).toEqual([])
  })
})
