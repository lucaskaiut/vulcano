import { apiFetch } from './api'
import type { Sale } from '../types/commission'

export async function listSales(): Promise<Sale[]> {
  const response = await apiFetch<{ data: Sale[] }>('/sales')
  return response.data
}

export async function createSale(payload: {
  development_name: string
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
