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
  invoice_number?: string | null
  invoice_file?: File | null
}): Promise<Sale> {
  const formData = new FormData()
  formData.append('enterprise_id', String(payload.enterprise_id))
  formData.append('unit', payload.unit)
  formData.append('sale_date', payload.sale_date)
  formData.append('sale_amount', String(payload.sale_amount))
  formData.append('percentage', String(payload.percentage))
  if (payload.notes) formData.append('notes', payload.notes)
  if (payload.invoice_number) formData.append('invoice_number', payload.invoice_number)
  if (payload.invoice_file) formData.append('invoice_file', payload.invoice_file)

  const response = await apiFetch<{ data: Sale; message: string }>('/sales', {
    method: 'POST',
    body: formData,
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

export function getInvoiceDownloadUrl(saleId: number): string {
  return `${import.meta.env.VITE_API_BASE_URL ?? '/api'}/sales/${saleId}/invoice-download`
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
