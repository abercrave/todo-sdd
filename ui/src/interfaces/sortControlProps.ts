import type { SortDirection } from '../types/sortDirection'
import type { SortField } from '../types/sortField'

export interface SortControlProps {
  value: SortField
  onValueChange: (field: SortField) => void
  direction: SortDirection
  onDirectionChange: (direction: SortDirection) => void
}