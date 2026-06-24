import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { decodeSorts, encodeSorts, getNextSorts } from '../lib/sortQuery'
import { getTableSortsPreference } from '../lib/tablePreferences'
import type { TableSort } from '../types/preferences'
import { useAuth } from '../contexts/AuthContext'

type UseTableSortOptions = {
  tableKey: string
  sortableColumns: string[]
  defaultSorts?: TableSort[]
}

function applySortParams(params: URLSearchParams, sorts: TableSort[]): void {
  if (sorts.length === 0) {
    params.delete('sort')
    params.delete('direction')
    return
  }

  params.set('sort', encodeSorts(sorts))
  params.delete('direction')
}

export function useTableSort({
  tableKey,
  sortableColumns,
  defaultSorts = [{ column: 'name', direction: 'asc' }],
}: UseTableSortOptions) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, mergePreferences } = useAuth()
  const hasSyncedUrl = useRef(false)

  const defaultQuerySorts = useMemo(
    () => defaultSorts.filter((sort) => sortableColumns.includes(sort.column)),
    [defaultSorts, sortableColumns],
  )

  const sorts = useMemo((): TableSort[] => {
    return decodeSorts(searchParams.get('sort'), sortableColumns)
  }, [searchParams, sortableColumns])

  const querySorts = useMemo(
    () => (sorts.length > 0 ? sorts : defaultQuerySorts),
    [sorts, defaultQuerySorts],
  )

  useEffect(() => {
    if (hasSyncedUrl.current) {
      return
    }

    if (searchParams.get('sort')) {
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

    setSearchParams(
      (current) => {
        applySortParams(current, validSaved)
        return current
      },
      { replace: true },
    )

    hasSyncedUrl.current = true
  }, [user?.preferences, tableKey, searchParams, setSearchParams, sortableColumns])

  const toggleSort = useCallback(
    (column: string) => {
      if (!sortableColumns.includes(column)) {
        return
      }

      const currentSorts = decodeSorts(searchParams.get('sort'), sortableColumns)
      const nextSorts = getNextSorts(currentSorts, column)

      setSearchParams(
        (current) => {
          applySortParams(current, nextSorts)
          current.set('page', '1')
          return current
        },
        { replace: true },
      )

      mergePreferences({
        tables: {
          [tableKey]: {
            sorts: nextSorts,
          },
        },
      })
    },
    [searchParams, sortableColumns, setSearchParams, tableKey, mergePreferences],
  )

  return {
    sorts,
    querySorts,
    toggleSort,
  }
}
