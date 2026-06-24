import { useCallback, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getPerPagePreference, isAllowedPerPage } from '../lib/paginationPreferences'
import {
  ALLOWED_PER_PAGE,
  DEFAULT_PER_PAGE,
  type AllowedPerPage,
} from '../types/preferences'
import { useAuth } from '../contexts/AuthContext'

function parsePage(value: string | null): number {
  const page = Number.parseInt(value ?? '1', 10)

  if (Number.isNaN(page) || page < 1) {
    return 1
  }

  return page
}

function parsePerPage(value: string | null): AllowedPerPage | null {
  if (!value) {
    return null
  }

  const perPage = Number.parseInt(value, 10)

  if (!isAllowedPerPage(perPage)) {
    return null
  }

  return perPage
}

export function useTablePagination() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, mergePreferences } = useAuth()
  const hasSyncedUrl = useRef(false)

  const page = parsePage(searchParams.get('page'))
  const perPageFromUrl = parsePerPage(searchParams.get('per_page'))
  const savedPerPage = getPerPagePreference(user?.preferences)
  const perPage = perPageFromUrl ?? savedPerPage ?? DEFAULT_PER_PAGE

  useEffect(() => {
    if (hasSyncedUrl.current) {
      return
    }

    const hasPage = searchParams.has('page')
    const hasPerPage = searchParams.has('per_page')

    if (hasPage && hasPerPage) {
      hasSyncedUrl.current = true
      return
    }

    setSearchParams(
      (current) => {
        if (!hasPage) {
          current.set('page', '1')
        }

        if (!hasPerPage) {
          current.set('per_page', String(savedPerPage))
        }

        return current
      },
      { replace: true },
    )

    hasSyncedUrl.current = true
  }, [savedPerPage, searchParams, setSearchParams])

  const setPage = useCallback(
    (nextPage: number) => {
      const safePage = Math.max(1, nextPage)

      setSearchParams(
        (current) => {
          current.set('page', String(safePage))
          return current
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setPerPage = useCallback(
    (nextPerPage: AllowedPerPage) => {
      setSearchParams(
        (current) => {
          current.set('per_page', String(nextPerPage))
          current.set('page', '1')
          return current
        },
        { replace: true },
      )

      mergePreferences({
        pagination: {
          perPage: nextPerPage,
        },
      })
    },
    [mergePreferences, setSearchParams],
  )

  return {
    page,
    perPage,
    setPage,
    setPerPage,
    allowedPerPageOptions: ALLOWED_PER_PAGE,
  }
}
