import { describe, expect, it } from 'vitest'
import type { Todo } from 'shared'
import { sortTodos } from './todoSort'
import { DEFAULT_DIRECTION } from '../constants/defaultSortDirection'

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

    const result = sortTodos([newest, oldest, middle], 'createdAt', 'asc')

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

    const result = sortTodos([newest, oldest, middle], 'updatedAt', 'asc')

    expect(result.map((todo) => todo.id)).toEqual([1, 2, 3])
  })

  it('does not mutate the input array', () => {
    const first = makeTodo({ id: 1, createdAt: new Date('2026-02-01T00:00:00.000Z') })
    const second = makeTodo({ id: 2, createdAt: new Date('2026-01-01T00:00:00.000Z') })
    const input = [first, second]

    const result = sortTodos(input, 'createdAt', 'asc')

    expect(input).toEqual([first, second])
    expect(result).not.toBe(input)
  })

  it('sorts by title case-insensitively, ascending', () => {
    const banana = makeTodo({ id: 1, title: 'Banana' })
    const apple = makeTodo({ id: 2, title: 'apple' })
    const cherry = makeTodo({ id: 3, title: 'cherry' })

    const result = sortTodos([banana, apple, cherry], 'title', 'asc')

    expect(result.map((todo) => todo.id)).toEqual([2, 1, 3])
  })

  it('sorts by title case-insensitively, descending', () => {
    const banana = makeTodo({ id: 1, title: 'Banana' })
    const apple = makeTodo({ id: 2, title: 'apple' })
    const cherry = makeTodo({ id: 3, title: 'cherry' })

    const result = sortTodos([banana, apple, cherry], 'title', 'desc')

    expect(result.map((todo) => todo.id)).toEqual([3, 1, 2])
  })

  it('makes descending the exact reverse of ascending, including tied values', () => {
    // Two todos share the exact same createdAt; a third differs. If
    // descending were computed by negating the comparator instead of
    // reversing the ascending result, a stable sort would leave the tied
    // pair in the same relative order in both directions. Reversing the
    // ascending array instead flips the tied pair's relative order too,
    // which is what FR-015 requires.
    const tiedFirst = makeTodo({ id: 1, createdAt: new Date('2026-01-01T00:00:00.000Z') })
    const tiedSecond = makeTodo({ id: 2, createdAt: new Date('2026-01-01T00:00:00.000Z') })
    const distinct = makeTodo({ id: 3, createdAt: new Date('2026-02-01T00:00:00.000Z') })

    const ascending = sortTodos([distinct, tiedFirst, tiedSecond], 'createdAt', 'asc')
    const descending = sortTodos([distinct, tiedFirst, tiedSecond], 'createdAt', 'desc')

    expect(ascending.map((todo) => todo.id)).toEqual([1, 2, 3])
    expect(descending.map((todo) => todo.id)).toEqual([3, 2, 1])
    expect(descending.map((todo) => todo.id)).toEqual(
      [...ascending.map((todo) => todo.id)].reverse(),
    )
  })
})

describe('DEFAULT_DIRECTION', () => {
  it('defaults createdAt to descending (most recent first)', () => {
    expect(DEFAULT_DIRECTION.createdAt).toBe('desc')
  })

  it('defaults updatedAt to descending (most recent first)', () => {
    expect(DEFAULT_DIRECTION.updatedAt).toBe('desc')
  })

  it('defaults title to ascending (A→Z)', () => {
    expect(DEFAULT_DIRECTION.title).toBe('asc')
  })
})
