import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TodoForm } from './TodoForm'

describe('TodoForm', () => {
  it('submits the entered fields and resets the form', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<TodoForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Buy groceries' } })
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Milk' } })
    fireEvent.click(screen.getByRole('button', { name: /add todo/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Buy groceries', description: 'Milk' }),
      )
    })
    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toHaveValue('')
    })
  })

  it('shows an inline error and does not submit when the title is blank', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<TodoForm onSubmit={onSubmit} />)

    fireEvent.click(screen.getByRole('button', { name: /add todo/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/title is required/i)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows a clear error when the API call fails, without losing the entry', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'))
    render(<TodoForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Buy groceries' } })
    fireEvent.click(screen.getByRole('button', { name: /add todo/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/network error/i)
    expect(screen.getByLabelText(/title/i)).toHaveValue('Buy groceries')
  })
})
