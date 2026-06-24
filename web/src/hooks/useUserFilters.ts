import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useAuth } from '../contexts/AuthContext'
import { getTableFiltersPreference, userDrawerFiltersToPreference } from '../lib/filterPreferences'
import {
  countActiveUserDrawerFilters,
  EMPTY_USER_DRAWER_FILTERS,
  parseUserDrawerFilters,
  removeUserDrawerFilter,
  toUserListFilters,
  type UserDrawerFilters,
  type UserListFilters,
  USER_FILTER_KEYS,
} from '../lib/userFilters'

type UseUserFiltersOptions = {
  tableKey?: string
}

type SearchObject = Record<string, string | undefined>

export function useUserFilters({ tableKey = 'users' }: UseUserFiltersOptions = {}) {
  const search = useSearch({ strict: false }) as SearchObject
  const navigate = useNavigate()
  const { user, mergePreferences } = useAuth()
  const hasSyncedFromPreferences = useRef(false)

  const drawerFilters = useMemo(
    () => parseUserDrawerFilters(search),
    [search],
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

    const hasFilters = USER_FILTER_KEYS.some((key) => search[key])
    if (hasFilters) {
      hasSyncedFromPreferences.current = true
      return
    }

    const saved = getTableFiltersPreference(user.preferences, tableKey)

    if (saved) {
      navigate({
        search: ((prev: SearchObject) => {
          const next = { ...prev }
          for (const key of USER_FILTER_KEYS) {
            delete next[key]
          }
          for (const [k, v] of Object.entries(saved)) {
            if (v) next[k] = v
          }
          next.page = '1'
          return next
        }) as any,
        replace: true,
      })
    }

    hasSyncedFromPreferences.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tableKey, navigate])

  const applyDrawerFilters = useCallback(
    (filters: UserDrawerFilters) => {
      navigate({
        search: ((prev: SearchObject) => {
          const next = { ...prev }
          for (const key of USER_FILTER_KEYS) {
            delete next[key]
          }
          for (const key of USER_FILTER_KEYS) {
            const value = filters[key].trim()
            if (value) next[key] = value
          }
          next.page = '1'
          return next
        }) as any,
        replace: true,
      })
      persistFilters(filters)
    },
    [navigate, persistFilters],
  )

  const clearDrawerFilters = useCallback(() => {
    navigate({
      search: ((prev: SearchObject) => {
        const next = { ...prev }
        for (const key of USER_FILTER_KEYS) {
          delete next[key]
        }
        next.page = '1'
        return next
      }) as any,
      replace: true,
    })
    persistFilters(EMPTY_USER_DRAWER_FILTERS)
  }, [navigate, persistFilters])

  const removeFilter = useCallback(
    (key: Parameters<typeof removeUserDrawerFilter>[1]) => {
      const nextFilters = removeUserDrawerFilter(drawerFilters, key)
      navigate({
        search: ((prev: SearchObject) => {
          const next = { ...prev }
          for (const k of USER_FILTER_KEYS) {
            delete next[k]
          }
          for (const k of USER_FILTER_KEYS) {
            const value = nextFilters[k].trim()
            if (value) next[k] = value
          }
          next.page = '1'
          return next
        }) as any,
        replace: true,
      })
      persistFilters(nextFilters)
    },
    [drawerFilters, navigate, persistFilters],
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
