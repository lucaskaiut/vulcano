export type Commission = {
  id: number
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  status_label: string
  paid_at: string | null
  workflow_instance: {
    id: number
    status: string
    status_label: string
    current_step: {
      id: number
      name: string
      order: number
      visibility_rules: { type: string; id?: number }[]
      approval_rules: { type: string; id?: number }[]
    } | null
  } | null
}

export type Enterprise = {
  id: number
  name: string
}

export type Sale = {
  id: number
  enterprise_id: number
  enterprise: Enterprise | null
  unit: string
  sale_date: string
  sale_amount: string
  percentage: string
  commission_amount: string
  notes: string | null
  invoice_number: string | null
  invoice_file_name: string | null
  user: { id: number; name: string; manager_id: number | null }
  commission: Commission | null
  created_at: string
}
