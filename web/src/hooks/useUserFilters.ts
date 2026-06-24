import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getTableFiltersPreference, userDrawerFiltersToPreference } from '../lib/filterPreferences'
import {
  applyUserDrawerFiltersToSearchParams,
  clearUserDrawerFiltersFromSearchParams,
  countActiveUserDrawerFilters,
  EMPTY_USER_DRAWER_FILTERS,
  hasUserFilterParams,
  parseUserDrawerFilters,
  removeUserDrawerFilter,
  toUserListFilters,
  type UserDrawerFilters,
  type UserListFilters,
} from '../lib/userFilters'

type UseUserFiltersOptions = {
  tableKey?: string
}

export function useUserFilters({ tableKey = 'users' }: UseUserFiltersOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, mergePreferences } = useAuth()
  const hasSyncedFromPreferences = useRef(false)

  const drawerFilters = useMemo(
    () => parseUserDrawerFilters(searchParams),
    [searchParams],
  )

  const apiFilters = useMemo<UserListFilters>(() => toUserListFilters(drawerFilters), [drawerFilters])

  const activeFilterCount = useMemo(
    () => countActiveUserDrawerFilters(drawerFilters),
    [drawerFilters],
  )

  const persistFilters = useCallback(
    (filters: UserDrawerFilters) => {
      mergePreferences({
        tables: {
          [tableKey]: {
            filters: userDrawerFiltersToPreference(filters),
          },
        },
      })
    },
    [mergePreferences, tableKey],
  )

  useEffect(() => {
    if (hasSyncedFromPreferences.current || !user) {
      return
    }

    if (hasUserFilterParams(searchParams)) {
      hasSyncedFromPreferences.current = true
      return
    }

    const saved = getTableFiltersPreference(user.preferences, tableKey)

    if (saved) {
      setSearchParams((current) => applyUserDrawerFiltersToSearchParams(current, saved), {
        replace: true,
      })
    }

    hasSyncedFromPreferences.current = true
    // Sincroniza preferências salvas apenas na carga inicial da listagem.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- searchParams é lido só na primeira sincronização
  }, [user, tableKey, setSearchParams])

  const applyDrawerFilters = useCallback(
    (filters: UserDrawerFilters) => {
      setSearchParams((current) => applyUserDrawerFiltersToSearchParams(current, filters), {
        replace: true,
      })
      persistFilters(filters)
    },
    [setSearchParams, persistFilters],
  )

  const clearDrawerFilters = useCallback(() => {
    setSearchParams((current) => clearUserDrawerFiltersFromSearchParams(current), { replace: true })
    persistFilters(EMPTY_USER_DRAWER_FILTERS)
  }, [setSearchParams, persistFilters])

  const removeFilter = useCallback(
    (key: Parameters<typeof removeUserDrawerFilter>[1]) => {
      const nextFilters = removeUserDrawerFilter(drawerFilters, key)
      setSearchParams((current) => applyUserDrawerFiltersToSearchParams(current, nextFilters), {
        replace: true,
      })
      persistFilters(nextFilters)
    },
    [drawerFilters, setSearchParams, persistFilters],
  )

  return {
    drawerFilters,
    apiFilters,
    activeFilterCount,
    applyDrawerFilters,
    clearDrawerFilters,
    removeFilter,
  }
}
