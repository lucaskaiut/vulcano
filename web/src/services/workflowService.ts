import { apiFetch } from './api'

// ---------------------------------------------------------------
// Types
// ---------------------------------------------------------------
export type WorkflowItem = {
  id: number
  name: string
  description: string | null
  is_active: boolean
  steps?: WorkflowStep[]
}

export type WorkflowDetail = WorkflowItem & {
  steps: WorkflowStep[]
  created_at: string
  updated_at: string
}

export type WorkflowStep = {
  id: number
  workflow_id: number
  name: string
  order: number
  responsible_role_id: number | null
  responsible_user_id: number | null
  responsible_role?: {
    id: number
    name: string
  } | null
}

export type WorkflowInstance = {
  id: number
  status: string
  status_label: string
  current_step?: {
    id: number
    name: string
  } | null
}

// ---------------------------------------------------------------
// Workflows CRUD
// ---------------------------------------------------------------
export async function listWorkflows(): Promise<WorkflowItem[]> {
  const response = await apiFetch<{ data: WorkflowItem[] }>('/workflows')
  return response.data
}

export async function getWorkflow(id: number): Promise<WorkflowDetail> {
  const response = await apiFetch<{ data: WorkflowDetail }>(`/workflows/${id}`)
  return response.data
}

export async function createWorkflow(payload: {
  name: string
  description?: string
}): Promise<WorkflowDetail> {
  const response = await apiFetch<{ data: WorkflowDetail }>('/workflows', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function updateWorkflow(
  id: number,
  payload: { name: string; description?: string; is_active?: boolean },
): Promise<WorkflowDetail> {
  const response = await apiFetch<{ data: WorkflowDetail }>(`/workflows/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return response.data
}

// ---------------------------------------------------------------
// Steps
// ---------------------------------------------------------------
export async function addWorkflowStep(
  workflowId: number,
  payload: { name: string; order: number; responsible_role_id?: number | null; responsible_user_id?: number | null },
): Promise<WorkflowStep> {
  const response = await apiFetch<{ data: WorkflowStep }>(`/workflows/${workflowId}/steps`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function updateWorkflowStep(
  stepId: number,
  payload: { name?: string; order?: number; responsible_role_id?: number | null },
): Promise<WorkflowStep> {
  const response = await apiFetch<{ data: WorkflowStep }>(`/workflow-steps/${stepId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function deleteWorkflowStep(stepId: number): Promise<void> {
  await apiFetch(`/workflow-steps/${stepId}`, { method: 'DELETE' })
}

// ---------------------------------------------------------------
// Instances
// ---------------------------------------------------------------
export async function approveWorkflowInstance(id: number): Promise<WorkflowInstance> {
  const response = await apiFetch<{ data: WorkflowInstance }>(`/workflow-instances/${id}/approve`, {
    method: 'POST',
  })
  return response.data
}

export async function rejectWorkflowInstance(id: number): Promise<WorkflowInstance> {
  const response = await apiFetch<{ data: WorkflowInstance }>(`/workflow-instances/${id}/reject`, {
    method: 'POST',
  })
  return response.data
}
