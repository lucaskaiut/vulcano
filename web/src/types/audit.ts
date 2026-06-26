export type AuditLog = {
  id: number
  action: string
  entity: string
  entity_id: number
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  user: { id: number; name: string } | null
  created_at: string
}
