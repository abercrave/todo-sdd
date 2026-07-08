import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Todo } from 'shared'
import { TodosPage } from './TodosPage'
import { useTodos } from '../hooks/useTodos'

vi.mock('../hooks/useTodos')

function makeTodo(overrides: Partial<Todo> & { id: number; title: string }): Todo {
  return {
    description: null,
    isCompleted: false,
    dueAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  }
}

function mockTodos(todos: Todo[]) {
  vi.mocked(useTodos).mockReturnValue({
    todos,
    status: 'ready',
    error: null,
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  })
}

describe('TodosPage sorting', () => {
  it('defaults to Date Created, newest first', () => {
    mockTodos([
      makeTodo({ id: 1, title: 'Oldest', createdAt: new Date('2026-01-01T00:00:00.000Z') }),
      makeTodo({ id: 2, title: 'Newest', createdAt: new Date('2026-03-01T00:00:00.000Z') }),
    ])

    render(<TodosPage />)

    const titles = screen.getAllByText(/^(Oldest|Newest)$/).map((el) => el.textContent)
    expect(titles).toEqual(['Newest', 'Oldest'])
  })

  it('reorders when "Date Last Updated" is selected', async () => {
    mockTodos([
      makeTodo({
        id: 1,
        title: 'RecentlyCreated',
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
      makeTodo({
        id: 2,
        title: 'RecentlyUpdated',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-03-01T00:00:00.000Z'),
      }),
    ])

    render(<TodosPage />)

    fireEvent.click(screen.getByRole('combobox', { name: /sort by/i }))
    fireEvent.click(await screen.findByRole('option', { name: 'Date Last Updated' }))

    const titles = screen.getAllByText(/^(RecentlyCreated|RecentlyUpdated)$/).map((el) => el.textContent)
    expect(titles).toEqual(['RecentlyUpdated', 'RecentlyCreated'])
  })
})
