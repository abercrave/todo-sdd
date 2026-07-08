import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Todo } from 'shared'
import { TodoList } from './TodoList'

const baseTodo: Todo = {
  id: 1,
  title: 'Buy groceries',
  description: 'Milk, eggs',
  isCompleted: false,
  dueAt: new Date('2026-07-10T00:00:00.000Z'),
  createdAt: new Date('2026-07-01T00:00:00.000Z'),
  updatedAt: new Date('2026-07-01T00:00:00.000Z'),
}

const completedTodo: Todo = {
  id: 2,
  title: 'Walk the dog',
  description: null,
  isCompleted: true,
  dueAt: null,
  createdAt: new Date('2026-07-02T00:00:00.000Z'),
  updatedAt: new Date('2026-07-02T00:00:00.000Z'),
}

describe('TodoList', () => {
  it('shows a distinct empty state when there are no todos', () => {
    render(<TodoList todos={[]} onToggle={vi.fn()} onUpdate={vi.fn()} onRemove={vi.fn()} />)
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument()
  })

  it("displays each todo's title, description, due date, and completion status", () => {
    render(<TodoList todos={[baseTodo]} onToggle={vi.fn()} onUpdate={vi.fn()} onRemove={vi.fn()} />)

    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    expect(screen.getByText('Milk, eggs')).toBeInTheDocument()
    expect(screen.getByText(/not done/i)).toBeInTheDocument()
  })

  it('toggles a todo to complete', async () => {
    const onToggle = vi.fn().mockResolvedValue(undefined)
    render(
      <TodoList todos={[baseTodo]} onToggle={onToggle} onUpdate={vi.fn()} onRemove={vi.fn()} />,
    )

    fireEvent.click(screen.getByRole('checkbox'))

    await waitFor(() => {
      expect(onToggle).toHaveBeenCalledWith(1, true)
    })
  })

  it('shows a clear error and leaves the status unchanged when the toggle fails', async () => {
    const onToggle = vi.fn().mockRejectedValue(new Error('Network error'))
    render(
      <TodoList todos={[baseTodo]} onToggle={onToggle} onUpdate={vi.fn()} onRemove={vi.fn()} />,
    )

    fireEvent.click(screen.getByRole('checkbox'))

    expect(await screen.findByRole('alert')).toHaveTextContent(/network error/i)
    expect(screen.getByText(/not done/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('renders active todos and a Completed section with a heading below them for a mixed list', () => {
    render(
      <TodoList
        todos={[baseTodo, completedTodo]}
        onToggle={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />,
    )

    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    expect(screen.getByText('Walk the dog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /completed/i })).toBeInTheDocument()
  })

  it('renders no Completed section when there are zero completed todos', () => {
    render(<TodoList todos={[baseTodo]} onToggle={vi.fn()} onUpdate={vi.fn()} onRemove={vi.fn()} />)

    expect(screen.queryByRole('heading', { name: /completed/i })).not.toBeInTheDocument()
  })

  it('moves a todo into the Completed section immediately when its completion status changes, without a reload', () => {
    const { rerender } = render(
      <TodoList todos={[baseTodo]} onToggle={vi.fn()} onUpdate={vi.fn()} onRemove={vi.fn()} />,
    )

    expect(screen.queryByRole('heading', { name: /completed/i })).not.toBeInTheDocument()

    rerender(
      <TodoList
        todos={[{ ...baseTodo, isCompleted: true }]}
        onToggle={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: /completed/i })).toBeInTheDocument()
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
  })
})
