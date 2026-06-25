import { apiFetch } from './api'
import type { ItemResponse, PaginatedResponse } from '../types/acl'
import type { AllowedPerPage, TableSort } from '../types/preferences'
import type { VacationBalance, VacationGrant, VacationPeriod, VacationRequest } from '../types/vacation'

type ListQueryParams = {
  sorts?: TableSort[]
  page?: number
  per_page?: AllowedPerPage
  user_id?: number
}

function buildSortParam(sorts: TableSort[]): string | undefined {
  if (sorts.length === 0) {
    return undefined
  }

  return sorts.map((sort) => `${sort.column}:${sort.direction}`).join(',')
}

function buildListQuery({ sorts = [], page, per_page, user_id }: ListQueryParams = {}): string {
  const query = new URLSearchParams()

  const sort = buildSortParam(sorts)
  if (sort) {
    query.set('sort', sort)
  }

  if (page !== undefined) {
    query.set('page', String(page))
  }

  if (per_page !== undefined) {
    query.set('per_page', String(per_page))
  }

  if (user_id !== undefined) {
    query.set('user_id', String(user_id))
  }

  const queryString = query.toString()

  return queryString ? `?${queryString}` : ''
}

export async function listVacationBalances(
  params: ListQueryParams = {},
): Promise<PaginatedResponse<VacationBalance>> {
  return apiFetch<PaginatedResponse<VacationBalance>>(`/vacation-balances${buildListQuery(params)}`)
}

export async function getVacationBalanceForUser(userId: number): Promise<VacationBalance | null> {
  const response = await listVacationBalances({ user_id: userId, per_page: 10 })
  return response.data[0] ?? null
}

export async function getVacationBalance(id: number): Promise<VacationBalance> {
  const response = await apiFetch<ItemResponse<VacationBalance>>(`/vacation-balances/${id}`)
  return response.data
}

export async function createVacationBalance(payload: {
  user_id: number
  additional_days?: number
}): Promise<VacationBalance> {
  const response = await apiFetch<ItemResponse<VacationBalance>>('/vacation-balances', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function updateVacationBalance(
  id: number,
  payload: { additional_days?: number; additional_days_entries?: { description: string; days: number }[] },
): Promise<VacationBalance> {
  const response = await apiFetch<ItemResponse<VacationBalance>>(`/vacation-balances/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function listVacationPeriods(userId: number): Promise<VacationPeriod[]> {
  const response = await apiFetch<ItemResponse<VacationPeriod[]>>(
    `/vacation-periods?user_id=${userId}`,
  )

  return response.data
}

export async function createVacationPeriod(payload: {
  user_id: number
  start_date: string
}): Promise<VacationPeriod> {
  const response = await apiFetch<ItemResponse<VacationPeriod>>('/vacation-periods', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function closeVacationPeriod(
  id: number,
  payload: { end_date: string },
): Promise<VacationPeriod> {
  const response = await apiFetch<ItemResponse<VacationPeriod>>(
    `/vacation-periods/${id}/close`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )

  return response.data
}

export async function listVacationGrants(userId: number): Promise<VacationGrant[]> {
  const response = await apiFetch<ItemResponse<VacationGrant[]>>(
    `/vacation-grants?user_id=${userId}`,
  )

  return response.data
}

export async function createVacationGrant(payload: {
  user_id: number
  start_date: string
  end_date: string
  days_used: number
}): Promise<VacationGrant> {
  const response = await apiFetch<ItemResponse<VacationGrant>>('/vacation-grants', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function listVacationRequests(): Promise<VacationRequest[]> {
  const response = await apiFetch<{ data: VacationRequest[] }>('/vacation-requests')
  return response.data
}

export async function createVacationRequest(payload: {
  start_date: string
  end_date: string
  justification?: string | null
}): Promise<VacationRequest> {
  const response = await apiFetch<{ data: VacationRequest; message: string }>(
    '/vacation-requests',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
  return response.data
}

export async function cancelVacationRequest(id: number): Promise<VacationRequest> {
  const response = await apiFetch<{ data: VacationRequest; message: string }>(
    `/vacation-requests/${id}/cancel`,
    { method: 'POST' },
  )
  return response.data
}
