import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons'
import type { SortDirection } from '../types/sortDirection'

export const DIRECTION_ICON: Record<SortDirection, typeof ArrowUpIcon | typeof ArrowDownIcon> = {
  asc: ArrowUpIcon,
  desc: ArrowDownIcon,
}