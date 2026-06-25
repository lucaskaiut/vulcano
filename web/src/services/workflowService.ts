import { apiFetch } from './api'
import type {
  WorkflowInstance,
  WorkflowStep,
  WorkflowType,
} from '../types/workflow'

export const WORKFLOW_TYPE_LABELS: Record<WorkflowType, string> = {
  vacation_request: 'Aprovação de Férias',
  commission: 'Aprovação de Comissão',
  document: 'Aprovação de Documentos',
}

export const WORKFLOW_TYPES: WorkflowType[] = [
  'vacation_request',
  'commission',
  'document',
]

export async function listSteps(type: WorkflowType): Promise<WorkflowStep[]> {
  const json = await apiFetch<{ data: WorkflowStep[] }>(
    `/workflow-types/${type}/steps`,
  )
  return json.data
}

export async function createStep(
  type: WorkflowType,
  payload: {
    name: string
    order?: number
    responsible_role_id?: number | null
    responsible_user_id?: number | null
  },
): Promise<WorkflowStep> {
  const json = await apiFetch<{ data: WorkflowStep; message: string }>(
    `/workflow-types/${type}/steps`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
  return json.data
}

export async function updateStep(
  stepId: number,
  payload: {
    name?: string
    order?: number
    responsible_role_id?: number | null
    responsible_user_id?: number | null
  },
): Promise<WorkflowStep> {
  const json = await apiFetch<{ data: WorkflowStep; message: string }>(
    `/workflow-steps/${stepId}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  )
  return json.data
}

export async function deleteStep(stepId: number): Promise<void> {
  await apiFetch<{ message: string }>(`/workflow-steps/${stepId}`, {
    method: 'DELETE',
  })
}

export async function reorderStep(
  stepId: number,
  order: number,
): Promise<WorkflowStep> {
  const json = await apiFetch<{ data: WorkflowStep; message: string }>(
    `/workflow-steps/${stepId}/reorder`,
    {
      method: 'PUT',
      body: JSON.stringify({ order }),
    },
  )
  return json.data
}

export async function listInstances(): Promise<WorkflowInstance[]> {
  const json = await apiFetch<{ data: WorkflowInstance[] }>(
    '/workflow-instances',
  )
  return json.data
}

export async function getInstance(id: number): Promise<WorkflowInstance> {
  const json = await apiFetch<{ data: WorkflowInstance }>(
    `/workflow-instances/${id}`,
  )
  return json.data
}

export async function startInstance(payload: {
  workflow_type: WorkflowType
  title: string
  subject_type?: string | null
  subject_id?: number | null
}): Promise<WorkflowInstance> {
  const json = await apiFetch<{ data: WorkflowInstance; message: string }>(
    '/workflow-instances',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
  return json.data
}

export async function approveInstance(
  id: number,
  notes?: string | null,
): Promise<WorkflowInstance> {
  const json = await apiFetch<{ data: WorkflowInstance; message: string }>(
    `/workflow-instances/${id}/approve`,
    {
      method: 'POST',
      body: JSON.stringify({ notes }),
    },
  )
  return json.data
}

export async function rejectInstance(
  id: number,
  notes?: string | null,
): Promise<WorkflowInstance> {
  const json = await apiFetch<{ data: WorkflowInstance; message: string }>(
    `/workflow-instances/${id}/reject`,
    {
      method: 'POST',
      body: JSON.stringify({ notes }),
    },
  )
  return json.data
}

export async function cancelInstance(
  id: number,
  notes?: string | null,
): Promise<WorkflowInstance> {
  const json = await apiFetch<{ data: WorkflowInstance; message: string }>(
    `/workflow-instances/${id}/cancel`,
    {
      method: 'POST',
      body: JSON.stringify({ notes }),
    },
  )
  return json.data
}
