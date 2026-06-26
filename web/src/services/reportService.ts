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

export function getReportDownloadUrl(type: string, filters: Record<string, string | undefined>, format: 'pdf' | 'xlsx'): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? '/api'
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v) qs.set(k, v)
  }
  qs.set('format', format)
  return `${base}/reports/${type}?${qs.toString()}`
}
