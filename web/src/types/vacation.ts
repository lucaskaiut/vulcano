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
