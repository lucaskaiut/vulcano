import { useCallback, useEffect, useRef } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { getPerPagePreference, isAllowedPerPage } from '../lib/paginationPreferences'
import {
  ALLOWED_PER_PAGE,
  DEFAULT_PER_PAGE,
  type AllowedPerPage,
} from '../types/preferences'
import { useAuth } from '../contexts/AuthContext'

function parsePage(value: string | undefined): number {
  const page = Number.parseInt(value ?? '1', 10)

  if (Number.isNaN(page) || page < 1) {
    return 1
  }

  return page
}

function parsePerPage(value: string | undefined): AllowedPerPage | null {
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
  const search = useSearch({ strict: false }) as Record<string, string | undefined>
  const navigate = useNavigate()
  const { user, mergePreferences } = useAuth()
  const hasSyncedUrl = useRef(false)

  const page = parsePage(search.page)
  const perPageFromUrl = parsePerPage(search.per_page)
  const savedPerPage = getPerPagePreference(user?.preferences)
  const perPage = perPageFromUrl ?? savedPerPage ?? DEFAULT_PER_PAGE

  useEffect(() => {
    if (hasSyncedUrl.current) {
      return
    }

    const hasPage = search.page !== undefined
    const hasPerPage = search.per_page !== undefined

    if (hasPage && hasPerPage) {
      hasSyncedUrl.current = true
      return
    }

    navigate({
      search: ((prev: Record<string, string | undefined>) => ({
        ...prev,
        ...(hasPage ? {} : { page: '1' }),
        ...(hasPerPage ? {} : { per_page: String(savedPerPage) }),
      })) as any,
      replace: true,
    })

    hasSyncedUrl.current = true
  }, [savedPerPage, search, navigate])

  const setPage = useCallback(
    (nextPage: number) => {
      const safePage = Math.max(1, nextPage)

      navigate({
        search: ((prev: Record<string, string | undefined>) => ({
          ...prev,
          page: String(safePage),
        })) as any,
        replace: true,
      })
    },
    [navigate],
  )

  const setPerPage = useCallback(
    (nextPerPage: AllowedPerPage) => {
      navigate({
        search: ((prev: Record<string, string | undefined>) => ({
          ...prev,
          per_page: String(nextPerPage),
          page: '1',
        })) as any,
        replace: true,
      })

      mergePreferences({
        pagination: {
          perPage: nextPerPage,
        },
      })
    },
    [mergePreferences, navigate],
  )

  return {
    page,
    perPage,
    setPage,
    setPerPage,
    allowedPerPageOptions: ALLOWED_PER_PAGE,
  }
}
