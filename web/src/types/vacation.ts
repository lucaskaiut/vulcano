export type VacationUserSummary = {
  id: number
  name: string
  job_title: string
}

export type VacationGrant = {
  id: number
  user_id: number
  start_date: string
  end_date: string
  days_used: number
  created_at: string
  updated_at: string
}

export type VacationPeriod = {
  id: number
  user_id: number
  start_date: string
  end_date: string | null
  entitled_days: number | null
  status: 'open' | 'closed'
  status_label: string
  created_at: string
  updated_at: string
}

export type VacationBalance = {
  id: number
  user_id: number
  user?: VacationUserSummary
  available_days: number
  accrued_days: number
  used_days: number
  additional_days: number
  grants?: VacationGrant[]
  periods?: VacationPeriod[]
  created_at: string
  updated_at: string
}

export type VacationRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export type VacationRequestWorkflowInstance = {
  id: number
  status: string
  status_label: string
  current_step: {
    id: number
    name: string
    order: number
  } | null
}

export type VacationRequest = {
  id: number
  start_date: string
  end_date: string
  requested_days: number
  justification: string | null
  status: VacationRequestStatus
  status_label: string
  user: VacationUserSummary
  workflow_instance_id: number | null
  workflow_instance: VacationRequestWorkflowInstance | null
  created_at: string
  updated_at: string
}
