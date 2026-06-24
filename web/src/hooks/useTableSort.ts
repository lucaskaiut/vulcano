import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { decodeSorts, encodeSorts, getNextSorts } from '../lib/sortQuery'
import { getTableSortsPreference } from '../lib/tablePreferences'
import type { TableSort } from '../types/preferences'
import { useAuth } from '../contexts/AuthContext'

type UseTableSortOptions = {
  tableKey: string
  sortableColumns: string[]
  defaultSorts?: TableSort[]
}

export function useTableSort({
  tableKey,
  sortableColumns,
  defaultSorts = [{ column: 'name', direction: 'asc' }],
}: UseTableSortOptions) {
  const search = useSearch({ strict: false }) as Record<string, string | undefined>
  const navigate = useNavigate()
  const { user, mergePreferences } = useAuth()
  const hasSyncedUrl = useRef(false)

  const defaultQuerySorts = useMemo(
    () => defaultSorts.filter((sort) => sortableColumns.includes(sort.column)),
    [defaultSorts, sortableColumns],
  )

  const sorts = useMemo((): TableSort[] => {
    return decodeSorts(search.sort ?? null, sortableColumns)
  }, [search.sort, sortableColumns])

  const querySorts = useMemo(
    () => (sorts.length > 0 ? sorts : defaultQuerySorts),
    [sorts, defaultQuerySorts],
  )

  useEffect(() => {
    if (hasSyncedUrl.current) {
      return
    }

    if (search.sort) {
      hasSyncedUrl.current = true
      return
    }

    const saved = getTableSortsPreference(user?.preferences, tableKey)

    if (!saved || saved.length === 0) {
      hasSyncedUrl.current = true
      return
    }

    const validSaved = saved.filter((sort) => sortableColumns.includes(sort.column))

    if (validSaved.length === 0) {
      hasSyncedUrl.current = true
      return
    }

    navigate({
      search: ((prev: Record<string, string | undefined>) => ({
        ...prev,
        sort: encodeSorts(validSaved),
      })) as any,
      replace: true,
    })

    hasSyncedUrl.current = true
  }, [user?.preferences, tableKey, search.sort, navigate, sortableColumns])

  const toggleSort = useCallback(
    (column: string) => {
      if (!sortableColumns.includes(column)) {
        return
      }

      const currentSorts = decodeSorts(search.sort ?? null, sortableColumns)
      const nextSorts = getNextSorts(currentSorts, column)

      navigate({
        search: ((prev: Record<string, string | undefined>) => ({
          ...prev,
          sort: nextSorts.length > 0 ? encodeSorts(nextSorts) : undefined,
          page: '1',
        })) as any,
        replace: true,
      })

      mergePreferences({
        tables: {
          [tableKey]: {
            sorts: nextSorts,
          },
        },
      })
    },
    [search.sort, sortableColumns, navigate, tableKey, mergePreferences],
  )

  return {
    sorts,
    querySorts,
    toggleSort,
  }
}
