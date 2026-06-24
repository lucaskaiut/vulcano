import { apiFetch } from './api'
import type { PreferencesPayload, UserPreferences } from '../types/preferences'

type PreferencesResponse = {
  data: UserPreferences
  message?: string
}

export async function getPreferences(): Promise<UserPreferences> {
  const response = await apiFetch<PreferencesResponse>('/me/preferences')
  return response.data
}

export async function mergePreferences(partial: PreferencesPayload): Promise<UserPreferences> {
  const response = await apiFetch<PreferencesResponse>('/me/preferences', {
    method: 'PATCH',
    body: JSON.stringify(partial),
  })

  return response.data
}

export async function mergePreferencesOptimistic(
  partial: PreferencesPayload,
): Promise<UserPreferences | null> {
  try {
    return await mergePreferences(partial)
  } catch {
    return null
  }
}
