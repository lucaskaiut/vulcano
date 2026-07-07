import { apiFetch } from './api'
import type { ReportCollaborator, ReportVacationRequest, ReportInvoice, ReportMedicalExam } from '../types/report'

type ListResponse<T> = { data: T[] }

function buildQuery(filters: Record<string, string | undefined>, format?: string): string {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v) params.set(k, v)
  }
  if (format) params.set('format', format)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export async function reportCollaborators(filters: {
  search?: string; hired_from?: string; hired_to?: string
  salary_min?: string; salary_max?: string
}): Promise<ReportCollaborator[]> {
  const r = await apiFetch<ListResponse<ReportCollaborator>>(`/reports/collaborators${buildQuery(filters)}`)
  return r.data
}

export async function reportVacationRequests(filters: {
  status?: string; user_id?: string; date_from?: string; date_to?: string
}): Promise<ReportVacationRequest[]> {
  const r = await apiFetch<ListResponse<ReportVacationRequest>>(`/reports/vacation-requests${buildQuery(filters)}`)
  return r.data
}

export async function reportInvoices(filters: {
  status?: string; competence?: string; user_id?: string
}): Promise<ReportInvoice[]> {
  const r = await apiFetch<ListResponse<ReportInvoice>>(`/reports/invoices${buildQuery(filters)}`)
  return r.data
}

export async function reportMedicalExams(filters: {
  expired?: string; user_id?: string
}): Promise<ReportMedicalExam[]> {
  const r = await apiFetch<ListResponse<ReportMedicalExam>>(`/reports/medical-exams${buildQuery(filters)}`)
  return r.data
}

export function getReportDownloadUrl(type: string, filters: Record<string, string | undefined>, format: 'pdf' | 'xlsx', columns?: string[]): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? '/api'
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v) qs.set(k, v)
  }
  qs.set('format', format)
  if (columns && columns.length > 0) {
    qs.set('columns', columns.join(','))
  }
  return `${base}/reports/${type}?${qs.toString()}`
}

export async function downloadReportFile(
  type: string,
  filters: Record<string, string | undefined>,
  format: 'pdf' | 'xlsx',
  columns?: string[],
): Promise<void> {
  function getCsrfToken(): string | null {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
    return match ? decodeURIComponent(match[1]) : null
  }

  const headers = new Headers()
  headers.set('Accept', format === 'xlsx'
    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    : 'application/pdf')

  const xsrfToken = getCsrfToken()
  if (xsrfToken) {
    headers.set('X-XSRF-TOKEN', xsrfToken)
  }

  const response = await fetch(getReportDownloadUrl(type, filters, format, columns), {
    credentials: 'include',
    headers,
  })

  if (!response.ok) {
    throw new Error('Falha ao baixar o relatório.')
  }

  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition')
  const filenameMatch = disposition?.match(/filename="?([^"]+)"?/)
  const filename = filenameMatch?.[1] ?? `relatorio.${format}`

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
