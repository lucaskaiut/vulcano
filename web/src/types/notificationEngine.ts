export type NotificationEvent = {
  id: number
  name: string
  label: string
  description: string | null
  available_variables: string[] | null
  active: boolean
  rules?: NotificationRule[]
  created_at: string
  updated_at: string
}

export type NotificationRule = {
  id: number
  name: string
  description: string | null
  event: string
  channel: string
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'once'
  schedule_config: Record<string, unknown> | null
  template_id: number | null
  template?: NotificationTemplate | null
  active: boolean
  created_at: string
  updated_at: string
}

export type NotificationTemplate = {
  id: number
  name: string
  subject: string
  body: string
  available_variables: string[] | null
  active: boolean
  created_at: string
  updated_at: string
}

export const EVENT_OPTIONS: { value: string; label: string }[] = [
  { value: 'monthly_invoice_reminder', label: 'Lembrete mensal de NF' },
  { value: 'document_expiring', label: 'Documento próximo do vencimento' },
  { value: 'exam_expiring', label: 'Exame próximo do vencimento' },
]

export function eventLabel(value: string): string {
  return EVENT_OPTIONS.find((e) => e.value === value)?.label ?? value
}
