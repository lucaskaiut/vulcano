import { apiFetch } from './api'
import type { MedicalExam } from '../types/medicalExam'

type ItemResponse<T> = { data: T; message?: string }
type ListResponse<T> = { data: T[] }

export async function listMedicalExams(userId: number): Promise<MedicalExam[]> {
  const response = await apiFetch<ListResponse<MedicalExam>>(`/users/${userId}/medical-exams`)
  return response.data
}

export async function createMedicalExam(
  userId: number,
  payload: { exam_type: string; execution_date: string; expiration_date: string; notes?: string; file?: File | null },
): Promise<MedicalExam> {
  const formData = new FormData()
  formData.append('exam_type', payload.exam_type)
  formData.append('execution_date', payload.execution_date)
  formData.append('expiration_date', payload.expiration_date)
  if (payload.notes) formData.append('notes', payload.notes)
  if (payload.file) formData.append('file', payload.file)

  const response = await apiFetch<ItemResponse<MedicalExam>>(`/users/${userId}/medical-exams`, {
    method: 'POST',
    body: formData,
  })
  return response.data
}

export async function updateMedicalExam(
  id: number,
  payload: { exam_type?: string; execution_date?: string; expiration_date?: string; notes?: string | null; file?: File | null },
): Promise<MedicalExam> {
  const formData = new FormData()
  if (payload.exam_type) formData.append('exam_type', payload.exam_type)
  if (payload.execution_date) formData.append('execution_date', payload.execution_date)
  if (payload.expiration_date) formData.append('expiration_date', payload.expiration_date)
  if (payload.notes !== undefined) formData.append('notes', payload.notes ?? '')
  if (payload.file) formData.append('file', payload.file)

  const response = await apiFetch<ItemResponse<MedicalExam>>(`/medical-exams/${id}`, {
    method: 'PUT',
    body: formData,
  })
  return response.data
}

export async function deleteMedicalExam(id: number): Promise<void> {
  await apiFetch<{ message: string }>(`/medical-exams/${id}`, { method: 'DELETE' })
}

export function getMedicalExamDownloadUrl(id: number): string {
  return `${import.meta.env.VITE_API_BASE_URL ?? '/api'}/medical-exams/${id}/download`
}
