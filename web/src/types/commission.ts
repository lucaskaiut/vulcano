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
      responsible_role: { id: number; name: string } | null
      responsible_user: { id: number; name: string } | null
    } | null
  } | null
}

export type Sale = {
  id: number
  development_name: string
  unit: string
  sale_date: string
  sale_amount: string
  percentage: string
  commission_amount: string
  notes: string | null
  user: { id: number; name: string }
  commission: Commission | null
  created_at: string
}
