export type Invoice = {
  id: number
  user_id: number
  user: { id: number; name: string } | null
  competence: string
  invoice_number: string
  amount: string
  issue_date: string
  status: string
  original_name: string
  mime_type: string | null
  size: number | null
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
  created_at: string
}
