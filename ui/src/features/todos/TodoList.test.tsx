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

describe('TodoList', () => {
  it('shows a distinct empty state when there are no todos', () => {
    render(<TodoList todos={[]} onToggle={vi.fn()} />)
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument()
  })

  it("displays each todo's title, description, due date, and completion status", () => {
    render(<TodoList todos={[baseTodo]} onToggle={vi.fn()} />)

    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    expect(screen.getByText('Milk, eggs')).toBeInTheDocument()
    expect(screen.getByText(/not done/i)).toBeInTheDocument()
  })

  it('toggles a todo to complete', async () => {
    const onToggle = vi.fn().mockResolvedValue(undefined)
    render(<TodoList todos={[baseTodo]} onToggle={onToggle} />)

    fireEvent.click(screen.getByRole('checkbox'))

    await waitFor(() => {
      expect(onToggle).toHaveBeenCalledWith(1, true)
    })
  })

  it('shows a clear error and leaves the status unchanged when the toggle fails', async () => {
    const onToggle = vi.fn().mockRejectedValue(new Error('Network error'))
    render(<TodoList todos={[baseTodo]} onToggle={onToggle} />)

    fireEvent.click(screen.getByRole('checkbox'))

    expect(await screen.findByRole('alert')).toHaveTextContent(/network error/i)
    expect(screen.getByText(/not done/i)).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })
})
