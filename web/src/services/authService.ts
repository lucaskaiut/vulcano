import { apiFetch } from './api'
import type { Permission, Role } from '../types/acl'
import type { UserPreferences } from '../types/preferences'

export type User = {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  roles?: Role[]
  permissions?: Permission[]
  preferences?: UserPreferences
}

type UserResponse = {
  data: User
}

type MessageResponse = {
  message: string
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiFetch<UserResponse>('/me')
  return response.data
}

export async function login(email: string, password: string): Promise<User> {
  const response = await apiFetch<UserResponse & MessageResponse>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  return response.data
}

export async function logout(): Promise<void> {
  await apiFetch<MessageResponse>('/logout', {
    method: 'POST',
  })
}

export async function forgotPassword(email: string): Promise<string> {
  const response = await apiFetch<MessageResponse>('/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })

  return response.message
}

export async function resetPassword(payload: {
  email: string
  password: string
  password_confirmation: string
  token: string
}): Promise<string> {
  const response = await apiFetch<MessageResponse>('/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.message
}
