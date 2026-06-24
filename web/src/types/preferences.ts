export type SortDirection = 'asc' | 'desc'

export type TableSort = {
  column: string
  direction: SortDirection
}

export type UserPreferences = Record<string, unknown>

export type TablePreferences = {
  sort?: TableSort
  sorts?: TableSort[]
  filters?: Record<string, string>
}

export type TablesPreferences = Record<string, TablePreferences>

export type PaginationPreferences = {
  perPage?: number
}

export type PreferencesPayload = {
  tables?: TablesPreferences
  pagination?: PaginationPreferences
  [key: string]: unknown
}

export const ALLOWED_PER_PAGE = [10, 15, 25, 50] as const

export type AllowedPerPage = (typeof ALLOWED_PER_PAGE)[number]

export const DEFAULT_PER_PAGE: AllowedPerPage = 15
