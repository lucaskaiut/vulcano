import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { getColumnSort, getColumnSortPriority } from '../../lib/sortQuery'
import type { TableSort } from '../../types/preferences'

type SortableTableHeaderProps = {
  label: string
  column: string
  sorts: TableSort[]
  onSort: (column: string) => void
  sortable?: boolean
  className?: string
}

export function SortableTableHeader({
  label,
  column,
  sorts,
  onSort,
  sortable = true,
  className = '',
}: SortableTableHeaderProps) {
  if (!sortable) {
    return <th className={`px-3 py-2.5 font-medium md:px-4 md:py-3 ${className}`}>{label}</th>
  }

  const columnSort = getColumnSort(sorts, column)
  const priority = getColumnSortPriority(sorts, column)
  const isActive = columnSort !== undefined

  return (
    <th className={`px-3 py-2.5 font-medium md:px-4 md:py-3 ${className}`}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`inline-flex items-center gap-1.5 transition ${
          isActive ? 'text-primary' : 'text-foreground-muted hover:text-foreground'
        }`}
      >
        <span>{label}</span>
        {priority !== null && sorts.length > 1 && (
          <span className="text-[10px] font-semibold text-primary/70">{priority}</span>
        )}
        <SortIcon direction={columnSort?.direction} isActive={isActive} />
      </button>
    </th>
  )
}

function SortIcon({
  direction,
  isActive,
}: {
  direction?: 'asc' | 'desc'
  isActive: boolean
}) {
  if (!isActive || !direction) {
    return <ArrowUpDown className="size-3.5 opacity-40" aria-hidden />
  }

  if (direction === 'asc') {
    return <ArrowUp className="size-3.5" aria-hidden />
  }

  return <ArrowDown className="size-3.5" aria-hidden />
}
