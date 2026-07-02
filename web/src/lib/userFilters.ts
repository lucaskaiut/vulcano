export type UserListFilters = {
  search?: string
  email?: string
  hired_from?: string
  hired_to?: string
  created_from?: string
  created_to?: string
  salary_min?: string
  salary_max?: string
  sector_id?: string
  exclude_id?: number
}

export const USER_FILTER_KEYS = [
  'email',
  'hired_from',
  'hired_to',
  'created_from',
  'created_to',
  'salary_min',
  'salary_max',
  'sector_id',
] as const

export type UserDrawerFilters = {
  email: string
  hired_from: string
  hired_to: string
  created_from: string
  created_to: string
  salary_min: string
  salary_max: string
  sector_id: string
}

export const EMPTY_USER_DRAWER_FILTERS: UserDrawerFilters = {
  email: '',
  hired_from: '',
  hired_to: '',
  created_from: '',
  created_to: '',
  salary_min: '',
  salary_max: '',
  sector_id: '',
}

export function parseUserDrawerFilters(searchParams: URLSearchParams): UserDrawerFilters
export function parseUserDrawerFilters(search: Record<string, string | undefined>): UserDrawerFilters
export function parseUserDrawerFilters(source: URLSearchParams | Record<string, string | undefined>): UserDrawerFilters {
  const get = (key: string) => {
    if (source instanceof URLSearchParams) {
      return source.get(key) ?? ''
    }
    return (source as Record<string, string | undefined>)[key] ?? ''
  }

  return {
    email: get('email'),
    hired_from: get('hired_from'),
    hired_to: get('hired_to'),
    created_from: get('created_from'),
    created_to: get('created_to'),
    salary_min: get('salary_min'),
    salary_max: get('salary_max'),
    sector_id: get('sector_id'),
  }
}

export function countActiveUserDrawerFilters(filters: UserDrawerFilters): number {
  return USER_FILTER_KEYS.filter((key) => filters[key].trim() !== '').length
}

export function toUserListFilters(filters: UserDrawerFilters): UserListFilters {
  const result: UserListFilters = {}

  for (const key of USER_FILTER_KEYS) {
    const value = filters[key].trim()
    if (value !== '') {
      result[key] = value
    }
  }

  return result
}

export function applyUserDrawerFiltersToSearchParams(
  current: URLSearchParams,
  filters: UserDrawerFilters,
): URLSearchParams {
  const next = new URLSearchParams(current)

  for (const key of USER_FILTER_KEYS) {
    next.delete(key)
  }

  for (const key of USER_FILTER_KEYS) {
    const value = filters[key].trim()
    if (value !== '') {
      next.set(key, value)
    }
  }

  next.set('page', '1')

  return next
}

export function clearUserDrawerFiltersFromSearchParams(current: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(current)

  for (const key of USER_FILTER_KEYS) {
    next.delete(key)
  }

  next.set('page', '1')

  return next
}

export const USER_FILTER_LABELS: Record<(typeof USER_FILTER_KEYS)[number], string> = {
  email: 'E-mail',
  hired_from: 'Contratação (de)',
  hired_to: 'Contratação (até)',
  created_from: 'Criação (de)',
  created_to: 'Criação (até)',
  salary_min: 'Remuneração (mín.)',
  salary_max: 'Remuneração (máx.)',
  sector_id: 'Setor',
}

export type UserFilterBadge = {
  key: (typeof USER_FILTER_KEYS)[number]
  label: string
  value: string
}

export function hasUserFilterParams(searchParams: URLSearchParams): boolean {
  return USER_FILTER_KEYS.some((key) => searchParams.get(key))
}

export function getActiveUserFilterBadges(filters: UserDrawerFilters): UserFilterBadge[] {
  return USER_FILTER_KEYS.filter((key) => filters[key].trim() !== '').map((key) => ({
    key,
    label: USER_FILTER_LABELS[key],
    value: filters[key].trim(),
  }))
}

export function removeUserDrawerFilter(
  filters: UserDrawerFilters,
  key: (typeof USER_FILTER_KEYS)[number],
): UserDrawerFilters {
  return { ...filters, [key]: '' }
}

export type UserDrawerFilterErrors = Partial<Record<keyof UserDrawerFilters, string>>

function validateDateRange(
  from: string,
  to: string,
  fromKey: keyof UserDrawerFilters,
  toKey: keyof UserDrawerFilters,
): UserDrawerFilterErrors {
  if (from.trim() === '' || to.trim() === '' || from <= to) {
    return {}
  }

  return {
    [fromKey]: 'A data inicial não pode ser posterior à data final.',
    [toKey]: 'A data final não pode ser anterior à data inicial.',
  }
}

function validateNumericRange(
  min: string,
  max: string,
  minKey: keyof UserDrawerFilters,
  maxKey: keyof UserDrawerFilters,
): UserDrawerFilterErrors {
  if (min.trim() === '' || max.trim() === '') {
    return {}
  }

  const minValue = Number(min)
  const maxValue = Number(max)

  if (Number.isNaN(minValue) || Number.isNaN(maxValue) || minValue <= maxValue) {
    return {}
  }

  return {
    [minKey]: 'O valor mínimo não pode ser maior que o máximo.',
    [maxKey]: 'O valor máximo não pode ser menor que o mínimo.',
  }
}

export function validateUserDrawerFilters(filters: UserDrawerFilters): UserDrawerFilterErrors {
  return {
    ...validateDateRange(filters.hired_from, filters.hired_to, 'hired_from', 'hired_to'),
    ...validateDateRange(filters.created_from, filters.created_to, 'created_from', 'created_to'),
    ...validateNumericRange(filters.salary_min, filters.salary_max, 'salary_min', 'salary_max'),
  }
}

export function hasUserDrawerFilterErrors(errors: UserDrawerFilterErrors): boolean {
  return Object.keys(errors).length > 0
}
