import type { SortDirection, TableSort } from '../types/preferences'

export function encodeSorts(sorts: TableSort[]): string {
  return sorts.map((sort) => `${sort.column}:${sort.direction}`).join(',')
}

export function decodeSorts(
  param: string | null,
  allowedColumns: string[],
): TableSort[] {
  if (!param) {
    return []
  }

  const sorts: TableSort[] = []

  for (const segment of param.split(',')) {
    const trimmed = segment.trim()

    if (!trimmed.includes(':')) {
      continue
    }

    const [column, direction] = trimmed.split(':', 2)

    if (!allowedColumns.includes(column)) {
      continue
    }

    if (direction !== 'asc' && direction !== 'desc') {
      continue
    }

    sorts.push({ column, direction: direction as SortDirection })
  }

  return sorts
}

export function getNextSorts(currentSorts: TableSort[], column: string): TableSort[] {
  const index = currentSorts.findIndex((sort) => sort.column === column)

  if (index === -1) {
    return [...currentSorts, { column, direction: 'asc' }]
  }

  const current = currentSorts[index]

  if (current.direction === 'asc') {
    return currentSorts.map((sort, sortIndex) =>
      sortIndex === index ? { column, direction: 'desc' } : sort,
    )
  }

  return currentSorts.filter((_, sortIndex) => sortIndex !== index)
}

export function getColumnSort(sorts: TableSort[], column: string): TableSort | undefined {
  return sorts.find((sort) => sort.column === column)
}

export function getColumnSortPriority(sorts: TableSort[], column: string): number | null {
  const index = sorts.findIndex((sort) => sort.column === column)

  return index === -1 ? null : index + 1
}
