import type { SortDirection } from '../types/sortDirection'
import type { SortField } from '../types/sortField'

/**
 * Each sort field has its own default direction (FR-016/FR-017): dates
 * default to newest-first (descending), and title defaults to A→Z
 * (ascending). Selecting a new field looks up its default here rather than
 * carrying over whatever direction was active for the previous field
 * (research.md §7).
 */
export const DEFAULT_DIRECTION: Record<SortField, SortDirection> = {
  createdAt: 'desc',
  updatedAt: 'desc',
  title: 'asc',
}
