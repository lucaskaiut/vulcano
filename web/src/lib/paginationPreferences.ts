import {
  ALLOWED_PER_PAGE,
  DEFAULT_PER_PAGE,
  type AllowedPerPage,
  type UserPreferences,
} from '../types/preferences'

export function isAllowedPerPage(value: number): value is AllowedPerPage {
  return (ALLOWED_PER_PAGE as readonly number[]).includes(value)
}

export function getPerPagePreference(preferences: UserPreferences | undefined): AllowedPerPage {
  const pagination = preferences?.pagination

  if (!pagination || typeof pagination !== 'object') {
    return DEFAULT_PER_PAGE
  }

  const perPage = (pagination as { perPage?: unknown }).perPage

  if (typeof perPage === 'number' && isAllowedPerPage(perPage)) {
    return perPage
  }

  return DEFAULT_PER_PAGE
}
