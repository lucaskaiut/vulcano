import { apiFetch } from './api'
import type { DashboardSummary } from '../types/dashboard'

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiFetch<{ data: DashboardSummary }>('/dashboard')
  return response.data
}
