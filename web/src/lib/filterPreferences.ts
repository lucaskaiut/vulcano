import {
  EMPTY_USER_DRAWER_FILTERS,
  USER_FILTER_KEYS,
  type UserDrawerFilters,
} from './userFilters'
import type { UserPreferences } from '../types/preferences'

export function getTableFiltersPreference(
  preferences: UserPreferences | undefined,
  tableKey: string,
): UserDrawerFilters | null {
  if (!preferences?.tables || typeof preferences.tables !== 'object') {
    return null
  }

  const tables = preferences.tables as Record<string, { filters?: Record<string, unknown> }>
  const saved = tables[tableKey]?.filters

  if (!saved || typeof saved !== 'object') {
    return null
  }

  const filters: UserDrawerFilters = { ...EMPTY_USER_DRAWER_FILTERS }
  let hasAny = false

  for (const key of USER_FILTER_KEYS) {
    const value = saved[key]

    if (typeof value === 'string' && value.trim() !== '') {
      filters[key] = value.trim()
      hasAny = true
    }
  }

  return hasAny ? filters : null
}

export function userDrawerFiltersToPreference(filters: UserDrawerFilters): Record<string, string> {
  const result: Record<string, string> = {}

  for (const key of USER_FILTER_KEYS) {
    const value = filters[key].trim()

    if (value !== '') {
      result[key] = value
    }
  }

  return result
}
