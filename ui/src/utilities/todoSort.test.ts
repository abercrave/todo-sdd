import { describe, expect, it } from 'vitest'
import type { Todo } from 'shared'
import { sortTodos } from './todoSort'

function makeTodo(overrides: Partial<Todo> & { id: number }): Todo {
  return {
    title: `Todo ${overrides.id}`,
    description: null,
    isCompleted: false,
    dueAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  }
}

describe('sortTodos', () => {
  it('sorts by createdAt ascending', () => {
    const oldest = makeTodo({ id: 1, createdAt: new Date('2026-01-01T00:00:00.000Z') })
    const middle = makeTodo({ id: 2, createdAt: new Date('2026-02-01T00:00:00.000Z') })
    const newest = makeTodo({ id: 3, createdAt: new Date('2026-03-01T00:00:00.000Z') })

    const result = sortTodos([newest, oldest, middle], 'createdAt')

    expect(result.map((todo) => todo.id)).toEqual([1, 2, 3])
  })

  it('sorts by updatedAt ascending', () => {
    const oldest = makeTodo({
      id: 1,
      createdAt: new Date('2026-03-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })
    const middle = makeTodo({
      id: 2,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-02-01T00:00:00.000Z'),
    })
    const newest = makeTodo({
      id: 3,
      createdAt: new Date('2026-02-01T00:00:00.000Z'),
      updatedAt: new Date('2026-03-01T00:00:00.000Z'),
    })

    const result = sortTodos([newest, oldest, middle], 'updatedAt')

    expect(result.map((todo) => todo.id)).toEqual([1, 2, 3])
  })

  it('does not mutate the input array', () => {
    const first = makeTodo({ id: 1, createdAt: new Date('2026-02-01T00:00:00.000Z') })
    const second = makeTodo({ id: 2, createdAt: new Date('2026-01-01T00:00:00.000Z') })
    const input = [first, second]

    const result = sortTodos(input, 'createdAt')

    expect(input).toEqual([first, second])
    expect(result).not.toBe(input)
  })
})
