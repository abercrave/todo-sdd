import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SortControl } from './SortControl'

describe('SortControl', () => {
  it('exposes an accessible combobox named "Sort by"', () => {
    render(<SortControl value="createdAt" onValueChange={vi.fn()} direction="desc" onDirectionChange={vi.fn()} />)

    expect(screen.getByRole('combobox', { name: /sort by/i })).toBeInTheDocument()
  })

  it('calls onValueChange with "createdAt" when "Date Created" is selected', async () => {
    const onValueChange = vi.fn()
    render(
      <SortControl value="updatedAt" onValueChange={onValueChange} direction="desc" onDirectionChange={vi.fn()} />,
    )

    fireEvent.click(screen.getByRole('combobox', { name: /sort by/i }))
    fireEvent.click(await screen.findByRole('option', { name: 'Date Created' }))

    expect(onValueChange).toHaveBeenCalledWith('createdAt')
  })

  it('calls onValueChange with "updatedAt" when "Date Last Updated" is selected', async () => {
    const onValueChange = vi.fn()
    render(
      <SortControl value="createdAt" onValueChange={onValueChange} direction="desc" onDirectionChange={vi.fn()} />,
    )

    fireEvent.click(screen.getByRole('combobox', { name: /sort by/i }))
    fireEvent.click(await screen.findByRole('option', { name: 'Date Last Updated' }))

    expect(onValueChange).toHaveBeenCalledWith('updatedAt')
  })

  it('calls onValueChange with "title" when "Title" is selected', async () => {
    const onValueChange = vi.fn()
    render(
      <SortControl value="createdAt" onValueChange={onValueChange} direction="desc" onDirectionChange={vi.fn()} />,
    )

    fireEvent.click(screen.getByRole('combobox', { name: /sort by/i }))
    fireEvent.click(await screen.findByRole('option', { name: 'Title' }))

    expect(onValueChange).toHaveBeenCalledWith('title')
  })

  it('exposes a keyboard-accessible direction control with a discoverable name', () => {
    render(<SortControl value="createdAt" onValueChange={vi.fn()} direction="asc" onDirectionChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: /direction/i })).toBeInTheDocument()
  })

  it('calls onDirectionChange with "desc" when toggled from ascending', () => {
    const onDirectionChange = vi.fn()
    render(
      <SortControl value="title" onValueChange={vi.fn()} direction="asc" onDirectionChange={onDirectionChange} />,
    )

    fireEvent.click(screen.getByRole('button', { name: /direction/i }))

    expect(onDirectionChange).toHaveBeenCalledWith('desc')
  })

  it('calls onDirectionChange with "asc" when toggled from descending', () => {
    const onDirectionChange = vi.fn()
    render(
      <SortControl
        value="createdAt"
        onValueChange={vi.fn()}
        direction="desc"
        onDirectionChange={onDirectionChange}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /direction/i }))

    expect(onDirectionChange).toHaveBeenCalledWith('asc')
  })
})
