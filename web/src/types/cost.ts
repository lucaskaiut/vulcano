export type CostCategory = {
  id: number
  name: string
  type: string
  active: boolean
}

export type CollaboratorCost = {
  id: number
  user_id: number
  user: { id: number; name: string } | null
  amount: string
  recurring: boolean
  reference_month: string | null
  category: { id: number; name: string; type: string } | null
  created_at: string
}

export type MonthlyCostReport = {
  user_id: number
  user_name: string
  total: number
  categories: Record<string, number>
}
