import { apiFetch } from './api'
import type { AuditLog } from '../types/audit'

type PaginatedResponse<T> = {
  data: T[]
  meta: { current_page: number; last_page: number; per_page: number; total: number }
}

export async function listAuditLogs(params: {
  page?: number; per_page?: number; entity?: string; action?: string; user_id?: string; from?: string; to?: string
} = {}): Promise<PaginatedResponse<AuditLog>> {
  const query = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') query.set(k, String(v))
  }
  const qs = query.toString()
  return apiFetch<PaginatedResponse<AuditLog>>(`/audit-logs${qs ? `?${qs}` : ''}`)
}
