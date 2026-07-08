import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SortControl } from './SortControl'

describe('SortControl', () => {
  it('exposes an accessible combobox named "Sort by"', () => {
    render(<SortControl value="createdAt" onValueChange={vi.fn()} />)

    expect(screen.getByRole('combobox', { name: /sort by/i })).toBeInTheDocument()
  })

  it('calls onValueChange with "createdAt" when "Date Created" is selected', async () => {
    const onValueChange = vi.fn()
    render(<SortControl value="updatedAt" onValueChange={onValueChange} />)

    fireEvent.click(screen.getByRole('combobox', { name: /sort by/i }))
    fireEvent.click(await screen.findByRole('option', { name: 'Date Created' }))

    expect(onValueChange).toHaveBeenCalledWith('createdAt')
  })

  it('calls onValueChange with "updatedAt" when "Date Last Updated" is selected', async () => {
    const onValueChange = vi.fn()
    render(<SortControl value="createdAt" onValueChange={onValueChange} />)

    fireEvent.click(screen.getByRole('combobox', { name: /sort by/i }))
    fireEvent.click(await screen.findByRole('option', { name: 'Date Last Updated' }))

    expect(onValueChange).toHaveBeenCalledWith('updatedAt')
  })
})
