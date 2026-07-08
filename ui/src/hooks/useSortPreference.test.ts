import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Settings } from 'shared'
import { useSortPreference } from './useSortPreference'
import { getSettings, updateSettings } from '../services/settingsApi'
import { DEFAULT_DIRECTION } from '../constants/defaultSortDirection'

vi.mock('../services/settingsApi')

const mockGetSettings = vi.mocked(getSettings)
const mockUpdateSettings = vi.mocked(updateSettings)

function makeSettings(overrides: Partial<Settings> = {}): Settings {
  return {
    sortField: 'createdAt',
    sortDirection: 'desc',
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  }
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('useSortPreference', () => {
  it('loads a saved preference on mount and exposes it', async () => {
    mockGetSettings.mockResolvedValue(makeSettings({ sortField: 'title', sortDirection: 'asc' }))

    const { result } = renderHook(() => useSortPreference())

    await waitFor(() => {
      expect(result.current.sortField).toBe('title')
    })
    expect(result.current.sortDirection).toBe('asc')
  })

  it('falls back to the documented defaults when getSettings() rejects', async () => {
    mockGetSettings.mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useSortPreference())

    await waitFor(() => {
      expect(mockGetSettings).toHaveBeenCalled()
    })

    // No loading/error state is exposed - the hook simply keeps the
    // documented per-field defaults (FR-019).
    expect(result.current.sortField).toBe('createdAt')
    expect(result.current.sortDirection).toBe(DEFAULT_DIRECTION.createdAt)
  })

  it('persists a sort change via updateSettings() with the right payload', async () => {
    mockGetSettings.mockResolvedValue(makeSettings())
    mockUpdateSettings.mockResolvedValue(makeSettings({ sortField: 'title', sortDirection: 'asc' }))

    const { result } = renderHook(() => useSortPreference())

    await waitFor(() => {
      expect(result.current.sortField).toBe('createdAt')
    })

    act(() => {
      result.current.setSort('title', 'asc')
    })

    expect(result.current.sortField).toBe('title')
    expect(result.current.sortDirection).toBe('asc')
    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith({ sortField: 'title', sortDirection: 'asc' })
    })
  })

  it('keeps the new local value and does not throw when updateSettings() rejects', async () => {
    mockGetSettings.mockResolvedValue(makeSettings())
    mockUpdateSettings.mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useSortPreference())

    await waitFor(() => {
      expect(result.current.sortField).toBe('createdAt')
    })

    act(() => {
      result.current.setSort('updatedAt', 'asc')
    })

    expect(result.current.sortField).toBe('updatedAt')
    expect(result.current.sortDirection).toBe('asc')

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalled()
    })

    // Give the rejected promise's .catch() a turn to run - if the rejection
    // were unhandled, vitest would report it and this test would fail.
    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.sortField).toBe('updatedAt')
    expect(result.current.sortDirection).toBe('asc')
  })
})
