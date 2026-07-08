import { useCallback, useEffect, useState } from 'react'
import { getSettings, updateSettings } from '../services/settingsApi'
import { DEFAULT_DIRECTION, type SortDirection, type SortField } from '../types/sort'

// Default per FR-007/FR-019: Date Created, most recent first, applied
// whenever no preference has ever been saved or the saved preference can't
// be read.
const DEFAULT_FIELD: SortField = 'createdAt'

export interface UseSortPreferenceResult {
  sortField: SortField
  sortDirection: SortDirection
  setSort: (field: SortField, direction: SortDirection) => void
}

export function useSortPreference(): UseSortPreferenceResult {
  const [sortField, setSortField] = useState<SortField>(DEFAULT_FIELD)
  const [sortDirection, setSortDirection] = useState<SortDirection>(DEFAULT_DIRECTION[DEFAULT_FIELD])

  // Loads the saved preference in parallel with useTodos's own GET /todos
  // fetch (research.md §9) - this effect never awaits anything else, so it
  // races independently rather than serializing behind the todo list.
  useEffect(() => {
    let cancelled = false

    void getSettings()
      .then((settings) => {
        if (cancelled) {
          return
        }
        setSortField(settings.sortField)
        setSortDirection(settings.sortDirection)
      })
      .catch(() => {
        // Fail open (FR-019): a failed/slow fetch keeps the documented
        // per-field defaults already set in state - no error state, no
        // loading state that could block the todo list.
      })

    return () => {
      cancelled = true
    }
  }, [])

  const setSort = useCallback((field: SortField, direction: SortDirection) => {
    setSortField(field)
    setSortDirection(direction)

    // FR-020/FR-021: apply the change locally immediately regardless of
    // whether the save succeeds. A rejected save is not surfaced as an
    // error - it is silently retried the next time setSort is called.
    void updateSettings({ sortField: field, sortDirection: direction }).catch(() => {
      // Intentionally ignored - see FR-021.
    })
  }, [])

  return { sortField, sortDirection, setSort }
}
