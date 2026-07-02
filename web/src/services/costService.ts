import { apiFetch } from './api'
import type { CategoryGroup, CollaboratorCost, CostCategory, MonthlyCostReport, ProvisionRule } from '../types/cost'

export type PaginatedResponse<T> = {
  data: T[]
  meta: { current_page: number; last_page: number; per_page: number; total: number }
}

export async function listCategories(): Promise<CostCategory[]> {
  const response = await apiFetch<{ data: CostCategory[] }>('/cost-categories/list')
  return response.data
}

export async function paginateCategories(params: {
  page?: number
  per_page?: number
} = {}): Promise<PaginatedResponse<CostCategory>> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.per_page) query.set('per_page', String(params.per_page))
  const qs = query.toString()
  return apiFetch<PaginatedResponse<CostCategory>>(`/cost-categories${qs ? `?${qs}` : ''}`)
}

export async function getCategory(id: number): Promise<CostCategory> {
  const response = await apiFetch<{ data: CostCategory }>(`/cost-categories/${id}`)
  return response.data
}

export async function createCategory(payload: { name: string; type: string }): Promise<CostCategory> {
  const response = await apiFetch<{ data: CostCategory; message: string }>('/cost-categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function updateCategory(id: number, payload: { name?: string; type?: string; active?: boolean }): Promise<CostCategory> {
  const response = await apiFetch<{ data: CostCategory; message: string }>(`/cost-categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function getCost(id: number): Promise<CollaboratorCost> {
  const response = await apiFetch<{ data: CollaboratorCost }>(`/collaborator-costs/${id}`)
  return response.data
}

export async function paginateCosts(params: {
  page?: number
  per_page?: number
  user_id?: number
} = {}): Promise<PaginatedResponse<CollaboratorCost>> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.per_page) query.set('per_page', String(params.per_page))
  if (params.user_id) query.set('user_id', String(params.user_id))
  const qs = query.toString()
  return apiFetch<PaginatedResponse<CollaboratorCost>>(`/collaborator-costs${qs ? `?${qs}` : ''}`)
}

export async function createCost(payload: {
  user_id: number
  cost_category_id: number
  amount: number
  recurring?: boolean
  reference_month?: string | null
}): Promise<CollaboratorCost> {
  const response = await apiFetch<{ data: CollaboratorCost; message: string }>('/collaborator-costs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function updateCost(id: number, payload: { amount?: number; recurring?: boolean }): Promise<CollaboratorCost> {
  const response = await apiFetch<{ data: CollaboratorCost; message: string }>(`/collaborator-costs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function deleteCost(id: number): Promise<void> {
  await apiFetch<{ message: string }>(`/collaborator-costs/${id}`, { method: 'DELETE' })
}

export async function getReport(month?: string): Promise<{ data: MonthlyCostReport[]; groups: Record<string, CategoryGroup> }> {
  const query = month ? `?month=${month}` : ''
  return apiFetch<{ data: MonthlyCostReport[]; groups: Record<string, CategoryGroup> }>(`/costs-report${query}`)
}

export async function listProvisionRules(): Promise<ProvisionRule[]> {
  const response = await apiFetch<{ data: ProvisionRule[] }>('/provision-rules/list')
  return response.data
}

export async function paginateProvisionRules(params: {
  page?: number
  per_page?: number
} = {}): Promise<PaginatedResponse<ProvisionRule>> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.per_page) query.set('per_page', String(params.per_page))
  const qs = query.toString()
  return apiFetch<PaginatedResponse<ProvisionRule>>(`/provision-rules${qs ? `?${qs}` : ''}`)
}

export async function getProvisionRule(id: number): Promise<ProvisionRule> {
  const response = await apiFetch<{ data: ProvisionRule }>(`/provision-rules/${id}`)
  return response.data
}

export async function createProvisionRule(payload: {
  name: string
  percentage: number
  active?: boolean
}): Promise<ProvisionRule> {
  const response = await apiFetch<{ data: ProvisionRule; message: string }>('/provision-rules', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function updateProvisionRule(
  id: number,
  payload: { name?: string; percentage?: number; active?: boolean },
): Promise<ProvisionRule> {
  const response = await apiFetch<{ data: ProvisionRule; message: string }>(`/provision-rules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return response.data
}
