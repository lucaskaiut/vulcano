import { apiFetch } from './api'
import type { Invoice } from '../types/invoice'

type ItemResponse<T> = { data: T; message?: string }
type ListResponse<T> = { data: T[] }

export async function listInvoices(): Promise<Invoice[]> {
  const response = await apiFetch<ListResponse<Invoice>>('/invoices')
  return response.data
}

export async function listUserInvoices(userId: number): Promise<Invoice[]> {
  const response = await apiFetch<ListResponse<Invoice>>(`/users/${userId}/invoices`)
  return response.data
}

export async function createInvoice(payload: {
  competence: string
  invoice_number: string
  amount: number
  issue_date: string
  file: File
}): Promise<Invoice> {
  const formData = new FormData()
  formData.append('competence', payload.competence)
  formData.append('invoice_number', payload.invoice_number)
  formData.append('amount', String(payload.amount))
  formData.append('issue_date', payload.issue_date)
  formData.append('file', payload.file)

  const response = await apiFetch<ItemResponse<Invoice>>('/invoices', {
    method: 'POST',
    body: formData,
  })

  return response.data
}

export function getInvoiceDownloadUrl(id: number): string {
  return `${import.meta.env.VITE_API_BASE_URL ?? '/api'}/invoices/${id}/download`
}
