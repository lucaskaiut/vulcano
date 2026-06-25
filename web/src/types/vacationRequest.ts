export type VacationRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export type VacationRequest = {
  id: number
  user_id: number
  user?: {
    id: number
    name: string
    job_title: string
  }
  start_date: string
  end_date: string
  requested_days: number
  justification: string | null
  status: VacationRequestStatus
  status_label: string
  workflow_instance_id: number | null
  workflow_instance?: {
    id: number
    status: string
    status_label: string
    current_step?: {
      id: number
      name: string
    } | null
  }
  created_at: string
}
