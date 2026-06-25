export type WorkflowType = 'vacation_request' | 'commission' | 'document'

export type WorkflowInstanceStatus = 'in_progress' | 'approved' | 'rejected' | 'cancelled'

export type WorkflowHistoryAction = 'started' | 'approved' | 'rejected' | 'cancelled'

export interface WorkflowTypeInfo {
  type: WorkflowType
  label: string
}

export interface WorkflowStepResponsible {
  id: number
  name: string
}

export interface WorkflowStep {
  id: number
  workflow_type: WorkflowType
  name: string
  order: number
  responsible_role: WorkflowStepResponsible | null
  responsible_user: WorkflowStepResponsible | null
  created_at: string
  updated_at: string
}

export interface WorkflowInstanceHistory {
  id: number
  action: WorkflowHistoryAction
  action_label: string
  description: string
  notes: string | null
  user: { id: number; name: string } | null
  step: { id: number; name: string } | null
  created_at: string
}

export interface WorkflowInstance {
  id: number
  workflow_type: WorkflowType
  title: string
  status: WorkflowInstanceStatus
  status_label: string
  current_step: WorkflowStep | null
  initiated_by: { id: number; name: string } | null
  histories: WorkflowInstanceHistory[]
  created_at: string
  updated_at: string
}
