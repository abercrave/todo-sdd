import * as Select from '@radix-ui/react-select'
import type { SortField } from '../types/sort'

export interface SortControlProps {
  value: SortField
  onValueChange: (field: SortField) => void
}

interface SortOption {
  value: SortField
  label: string
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'updatedAt', label: 'Date Last Updated' },
]

export function SortControl({ value, onValueChange }: SortControlProps) {
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
    </div>
  )
}
