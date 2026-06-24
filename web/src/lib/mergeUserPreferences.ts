import { deepMerge } from './deepMerge'
import type { PreferencesPayload, UserPreferences } from '../types/preferences'

export function mergeUserPreferences(
  current: UserPreferences | undefined,
  partial: PreferencesPayload,
): UserPreferences {
  const merged = deepMerge(
    (current ?? {}) as Record<string, unknown>,
    partial as Record<string, unknown>,
  )

  if (!partial.tables || typeof partial.tables !== 'object') {
    return merged as UserPreferences
  }

  const mergedTables = {
    ...((merged.tables as Record<string, unknown> | undefined) ?? {}),
  }

  for (const [tableKey, tablePartial] of Object.entries(partial.tables)) {
    if (!tablePartial || typeof tablePartial !== 'object') {
      continue
    }

    const existingTable = {
      ...((mergedTables[tableKey] as Record<string, unknown> | undefined) ?? {}),
      ...tablePartial,
    }

    if ('filters' in tablePartial) {
      const filters = tablePartial.filters

      existingTable.filters =
        filters && typeof filters === 'object' && !Array.isArray(filters) ? { ...filters } : {}
    }

    mergedTables[tableKey] = existingTable
  }

  merged.tables = mergedTables

  return merged as UserPreferences
}
