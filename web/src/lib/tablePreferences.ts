import type { TableSort, UserPreferences } from '../types/preferences'

export function getTableSortsPreference(
  preferences: UserPreferences | undefined,
  tableKey: string,
): TableSort[] | null {
  if (!preferences?.tables || typeof preferences.tables !== 'object') {
    return null
  }

  const tables = preferences.tables as Record<string, { sort?: TableSort; sorts?: TableSort[] }>
  const tablePreferences = tables[tableKey]

  if (!tablePreferences) {
    return null
  }

  if (Array.isArray(tablePreferences.sorts) && tablePreferences.sorts.length > 0) {
    return tablePreferences.sorts.filter(isValidSort)
  }

  if (isValidSort(tablePreferences.sort)) {
    return [tablePreferences.sort]
  }

  return null
}

function isValidSort(sort: TableSort | undefined): sort is TableSort {
  if (!sort?.column) {
    return false
  }

  return sort.direction === 'asc' || sort.direction === 'desc'
}
