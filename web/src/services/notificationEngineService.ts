import { apiFetch } from './api'
import type { NotificationRule, NotificationTemplate } from '../types/notificationEngine'
import type { NotificationItem } from '../types/notification'

type ListResponse<T> = { data: T[] }
type ItemResponse<T> = { data: T; message?: string }
type MessageResponse = { message: string }

// Rules
export async function listRules(): Promise<NotificationRule[]> {
  const r = await apiFetch<ListResponse<NotificationRule>>('/notification-rules')
  return r.data
}

export async function getRule(id: number): Promise<NotificationRule> {
  const r = await apiFetch<ItemResponse<NotificationRule>>(`/notification-rules/${id}`)
  return r.data
}

export async function createRule(payload: {
  name: string
  description?: string
  event: string
  channel: string
  schedule_type: string
  schedule_config?: Record<string, unknown>
  template_id?: number | null
  active?: boolean
}): Promise<NotificationRule> {
  const r = await apiFetch<ItemResponse<NotificationRule>>('/notification-rules', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return r.data
}

export async function updateRule(id: number, payload: Record<string, unknown>): Promise<NotificationRule> {
  const r = await apiFetch<ItemResponse<NotificationRule>>(`/notification-rules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return r.data
}

export async function deleteRule(id: number): Promise<void> {
  await apiFetch<MessageResponse>(`/notification-rules/${id}`, { method: 'DELETE' })
}

// Templates
export async function listTemplates(): Promise<NotificationTemplate[]> {
  const r = await apiFetch<ListResponse<NotificationTemplate>>('/notification-templates')
  return r.data
}

export async function getTemplate(id: number): Promise<NotificationTemplate> {
  const r = await apiFetch<ItemResponse<NotificationTemplate>>(`/notification-templates/${id}`)
  return r.data
}

export async function createTemplate(payload: {
  name: string
  subject: string
  body: string
  available_variables?: string[]
  active?: boolean
}): Promise<NotificationTemplate> {
  const r = await apiFetch<ItemResponse<NotificationTemplate>>('/notification-templates', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return r.data
}

export async function updateTemplate(id: number, payload: Record<string, unknown>): Promise<NotificationTemplate> {
  const r = await apiFetch<ItemResponse<NotificationTemplate>>(`/notification-templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return r.data
}

export async function deleteTemplate(id: number): Promise<void> {
  await apiFetch<MessageResponse>(`/notification-templates/${id}`, { method: 'DELETE' })
}

// Variables
export async function listVariables(): Promise<Record<string, string>> {
  const r = await apiFetch<ListResponse<Record<string, string>>>('/notification-variables')
  return r.data as unknown as Record<string, string>
}

// Test send
export async function testSendRule(ruleId: number, userId: number): Promise<void> {
  await apiFetch<MessageResponse>(`/notification-rules/${ruleId}/test-send`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  })
}

// Notification history
export async function listNotificationHistory(params?: {
  status?: string
  user_id?: number
}): Promise<NotificationItem[]> {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.user_id) qs.set('user_id', String(params.user_id))
  const query = qs.toString()
  const r = await apiFetch<ListResponse<NotificationItem>>(`/notifications/all${query ? `?${query}` : ''}`)
  return r.data
}

export async function retryNotification(id: number): Promise<void> {
  await apiFetch<MessageResponse>(`/notifications/${id}/retry`, { method: 'POST' })
}
