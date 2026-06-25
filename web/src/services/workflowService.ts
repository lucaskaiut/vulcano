import { apiFetch } from './api'

export type WorkflowItem = {
  id: number
  name: string
  description: string | null
  is_active: boolean
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

export async function listWorkflows(): Promise<WorkflowItem[]> {
  const response = await apiFetch<{ data: WorkflowItem[] }>('/workflows')

  return response.data
}

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
