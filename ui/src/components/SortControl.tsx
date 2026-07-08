import * as Select from '@radix-ui/react-select'
import type { SortDirection, SortField } from '../types/sort'

export interface SortControlProps {
  value: SortField
  onValueChange: (field: SortField) => void
  direction: SortDirection
  onDirectionChange: (direction: SortDirection) => void
}

interface SortOption {
  value: SortField
  label: string
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'updatedAt', label: 'Date Last Updated' },
  { value: 'title', label: 'Title' },
]

const DIRECTION_LABEL: Record<SortDirection, string> = {
  asc: 'Ascending',
  desc: 'Descending',
}

export function SortControl({ value, onValueChange, direction, onDirectionChange }: SortControlProps) {
  return (
    <div className="sort-control">
      <label className="sort-control-label" id="sort-control-label">
        Sort by
      </label>
      <Select.Root value={value} onValueChange={(next) => onValueChange(next as SortField)}>
        <Select.Trigger className="sort-control-trigger" aria-labelledby="sort-control-label">
          <Select.Value />
          <Select.Icon className="sort-control-icon" aria-hidden="true">
            ▾
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="sort-control-content" position="popper" sideOffset={4}>
            <Select.Viewport className="sort-control-viewport">
              {SORT_OPTIONS.map((option) => (
                <Select.Item key={option.value} value={option.value} className="sort-control-item">
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <button
        type="button"
        className="sort-control-direction"
        aria-label="Sort direction"
        aria-pressed={direction === 'desc'}
        onClick={() => onDirectionChange(direction === 'asc' ? 'desc' : 'asc')}
      >
        {DIRECTION_LABEL[direction]}
      </button>
    </div>
  )
}
