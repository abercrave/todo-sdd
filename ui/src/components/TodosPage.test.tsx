import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Todo } from 'shared'
import { TodosPage } from './TodosPage'
import { useTodos } from '../hooks/useTodos'
import { useSortPreference } from '../hooks/useSortPreference'
import { DEFAULT_DIRECTION } from '../constants/defaultSortDirection'
import type { SortDirection } from '../types/sortDirection'
import type { SortField } from '../types/sortField'

vi.mock('../hooks/useTodos')
vi.mock('../hooks/useSortPreference')

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

// Mirrors the real useSortPreference's stateful behavior (field/direction
// change together via setSort) using React's own useState, since TodosPage
// relies on state actually updating and re-rendering when the user
// interacts with SortControl.
function mockSortPreference(
  initialField: SortField = 'createdAt',
  initialDirection: SortDirection = DEFAULT_DIRECTION.createdAt,
) {
  vi.mocked(useSortPreference).mockImplementation(() => {
    const [sortField, setSortField] = useState(initialField)
    const [sortDirection, setSortDirection] = useState(initialDirection)

    return {
      sortField,
      sortDirection,
      setSort: (field: SortField, direction: SortDirection) => {
        setSortField(field)
        setSortDirection(direction)
      },
    }
  })
}

describe('TodosPage sorting', () => {
  it('defaults to Date Created, newest first', () => {
    mockTodos([
      makeTodo({ id: 1, title: 'Oldest', createdAt: new Date('2026-01-01T00:00:00.000Z') }),
      makeTodo({ id: 2, title: 'Newest', createdAt: new Date('2026-03-01T00:00:00.000Z') }),
    ])
    mockSortPreference()

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
    mockSortPreference()

    render(<TodosPage />)

    fireEvent.click(screen.getByRole('combobox', { name: /sort by/i }))
    fireEvent.click(await screen.findByRole('option', { name: 'Date Last Updated' }))

    const titles = screen
      .getAllByText(/^(RecentlyCreated|RecentlyUpdated)$/)
      .map((el) => el.textContent)
    expect(titles).toEqual(['RecentlyUpdated', 'RecentlyCreated'])
  })

  it('sorts alphabetically, case-insensitively, when "Title" is selected', async () => {
    mockTodos([
      makeTodo({ id: 1, title: 'banana' }),
      makeTodo({ id: 2, title: 'Apple' }),
      makeTodo({ id: 3, title: 'cherry' }),
    ])
    mockSortPreference()

    render(<TodosPage />)

    fireEvent.click(screen.getByRole('combobox', { name: /sort by/i }))
    fireEvent.click(await screen.findByRole('option', { name: 'Title' }))

    const titles = screen.getAllByText(/^(banana|Apple|cherry)$/).map((el) => el.textContent)
    expect(titles).toEqual(['Apple', 'banana', 'cherry'])
  })

  it("resets direction to the newly selected field's own default, not the previous field's direction", async () => {
    mockTodos([
      makeTodo({ id: 1, title: 'Oldest', createdAt: new Date('2026-01-01T00:00:00.000Z') }),
      makeTodo({ id: 2, title: 'Newest', createdAt: new Date('2026-03-01T00:00:00.000Z') }),
    ])
    mockSortPreference()

    render(<TodosPage />)

    // Default field is createdAt with its default direction (descending).
    const directionButton = screen.getByRole('button', { name: /direction/i })
    expect(directionButton).toHaveAttribute(
      'aria-pressed',
      String(DEFAULT_DIRECTION.createdAt === 'desc'),
    )

    // Toggle direction away from createdAt's default (desc -> asc).
    fireEvent.click(directionButton)
    expect(directionButton).toHaveAttribute('aria-pressed', 'false')

    // Switching to "Date Last Updated" must apply *that* field's own
    // default direction (desc) rather than carrying over the previously
    // toggled "asc" from createdAt (FR-016/FR-017).
    fireEvent.click(screen.getByRole('combobox', { name: /sort by/i }))
    fireEvent.click(await screen.findByRole('option', { name: 'Date Last Updated' }))

    expect(directionButton).toHaveAttribute(
      'aria-pressed',
      String(DEFAULT_DIRECTION.updatedAt === 'desc'),
    )
  })

  it('leaves the sort field unchanged when only the direction is toggled', () => {
    mockTodos([
      makeTodo({ id: 1, title: 'Oldest', createdAt: new Date('2026-01-01T00:00:00.000Z') }),
      makeTodo({ id: 2, title: 'Newest', createdAt: new Date('2026-03-01T00:00:00.000Z') }),
    ])
    mockSortPreference()

    render(<TodosPage />)

    fireEvent.click(screen.getByRole('button', { name: /direction/i }))

    expect(screen.getByRole('combobox', { name: /sort by/i })).toHaveTextContent('Date Created')

    const titles = screen.getAllByText(/^(Oldest|Newest)$/).map((el) => el.textContent)
    expect(titles).toEqual(['Oldest', 'Newest'])
  })
})
