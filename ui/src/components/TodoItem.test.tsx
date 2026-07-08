import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Todo } from 'shared'
import { TodoItem } from './TodoItem'

const baseTodo: Todo = {
  id: 1,
  title: 'Buy groceries',
  description: 'Milk',
  isCompleted: false,
  dueAt: null,
  createdAt: new Date('2026-07-01T00:00:00.000Z'),
  updatedAt: new Date('2026-07-01T00:00:00.000Z'),
}

describe('TodoItem', () => {
  it('toggles a todo\'s completion status', async () => {
    const onToggle = vi.fn().mockResolvedValue(undefined)
    render(<TodoItem todo={baseTodo} onToggle={onToggle} onUpdate={vi.fn()} onRemove={vi.fn()} />)

    fireEvent.click(screen.getByRole('checkbox'))

    await waitFor(() => {
      expect(onToggle).toHaveBeenCalledWith(1, true)
    })
  })

  it('edits a todo and exits edit mode on success', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined)
    render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onUpdate={onUpdate} onRemove={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Buy more groceries' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ title: 'Buy more groceries' }),
      )
    })
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument()
    })
  })

  it('shows a clear error when the edit fails, without losing the edit', async () => {
    const onUpdate = vi.fn().mockRejectedValue(new Error('Network error'))
    render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onUpdate={onUpdate} onRemove={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/network error/i)
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('deletes a todo', async () => {
    const onRemove = vi.fn().mockResolvedValue(undefined)
    render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onUpdate={vi.fn()} onRemove={onRemove} />)

    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    await waitFor(() => {
      expect(onRemove).toHaveBeenCalledWith(1)
    })
  })

  it('shows a clear error when delete fails, without removing the item', async () => {
    const onRemove = vi.fn().mockRejectedValue(new Error('Network error'))
    render(<TodoItem todo={baseTodo} onToggle={vi.fn()} onUpdate={vi.fn()} onRemove={onRemove} />)

    fireEvent.click(screen.getByRole('button', { name: /delete/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/network error/i)
    expect(screen.getByText('Buy groceries')).toBeInTheDocument()
  })
})
