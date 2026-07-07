export type NotificationItem = {
  id: number
  user_id: number
  user_name?: string
  type: string
  title: string
  body: string
  status: 'pending' | 'sent' | 'failed'
  error?: string | null
  sent_at: string | null
  channel?: string
  created_at: string
}
