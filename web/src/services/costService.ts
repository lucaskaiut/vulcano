import { apiFetch } from './api'
import type { CollaboratorCost, CostCategory, MonthlyCostReport } from '../types/cost'
import type { ItemResponse } from './acl'

export async function listCategories(): Promise<CostCategory[]> {
  const response = await apiFetch<{ data: CostCategory[] }>('/cost-categories')
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

export async function listCosts(userId?: number): Promise<CollaboratorCost[]> {
  const query = userId ? `?user_id=${userId}` : ''
  const response = await apiFetch<{ data: CollaboratorCost[] }>(`/collaborator-costs${query}`)
  return response.data
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

export async function getReport(month?: string): Promise<MonthlyCostReport[]> {
  const query = month ? `?month=${month}` : ''
  const response = await apiFetch<{ data: MonthlyCostReport[] }>(`/costs-report${query}`)
  return response.data
}
