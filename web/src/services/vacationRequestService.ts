import { apiFetch } from './api'
import type { VacationRequest } from '../types/vacationRequest'

export async function listVacationRequests(userId?: number): Promise<VacationRequest[]> {
  const query = userId ? `?user_id=${userId}` : ''

  const response = await apiFetch<{ data: VacationRequest[] }>(`/vacation-requests${query}`)

  return response.data
}

export async function getVacationRequest(id: number): Promise<VacationRequest> {
  const response = await apiFetch<{ data: VacationRequest }>(`/vacation-requests/${id}`)

  return response.data
}

export async function createVacationRequest(payload: {
  user_id: number
  workflow_id: number
  start_date: string
  end_date: string
  requested_days: number
  justification?: string
}): Promise<VacationRequest> {
  const response = await apiFetch<{ data: VacationRequest }>('/vacation-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function cancelVacationRequest(id: number): Promise<VacationRequest> {
  const response = await apiFetch<{ data: VacationRequest }>(`/vacation-requests/${id}/cancel`, {
    method: 'POST',
  })

  return response.data
}
