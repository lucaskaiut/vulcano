import { apiFetch } from './api'
import type { Enterprise, Sale } from '../types/commission'
import type { PaginatedResponse } from '../types/acl'

export async function listSales(): Promise<Sale[]> {
  const response = await apiFetch<{ data: Sale[] }>('/sales')
  return response.data
}

export async function createSale(payload: {
  enterprise_id: number
  unit: string
  sale_date: string
  sale_amount: number
  percentage: number
  notes?: string | null
}): Promise<Sale> {
  const response = await apiFetch<{ data: Sale; message: string }>('/sales', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function payCommission(id: number): Promise<{ id: number; status: string }> {
  const response = await apiFetch<{ data: { id: number; status: string }; message: string }>(
    `/commissions/${id}/pay`,
    { method: 'POST' },
  )
  return response.data
}

export async function listEnterprises(): Promise<Enterprise[]> {
  const response = await apiFetch<{ data: Enterprise[] }>('/enterprises/list')
  return response.data
}

export async function paginateEnterprises(params: {
  page?: number
  per_page?: number
} = {}): Promise<PaginatedResponse<Enterprise>> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.per_page) query.set('per_page', String(params.per_page))
  const qs = query.toString()
  return apiFetch<PaginatedResponse<Enterprise>>(`/enterprises${qs ? `?${qs}` : ''}`)
}

export async function getEnterprise(id: number): Promise<Enterprise> {
  const response = await apiFetch<{ data: Enterprise }>(`/enterprises/${id}`)
  return response.data
}

export async function createEnterprise(payload: { name: string }): Promise<Enterprise> {
  const response = await apiFetch<{ data: Enterprise; message: string }>('/enterprises', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function updateEnterprise(id: number, payload: { name?: string }): Promise<Enterprise> {
  const response = await apiFetch<{ data: Enterprise; message: string }>(`/enterprises/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return response.data
}
