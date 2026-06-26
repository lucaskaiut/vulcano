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
  payload: { exam_type: string; execution_date: string; expiration_date: string; notes?: string },
): Promise<MedicalExam> {
  const response = await apiFetch<ItemResponse<MedicalExam>>(`/users/${userId}/medical-exams`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function updateMedicalExam(
  id: number,
  payload: { exam_type?: string; execution_date?: string; expiration_date?: string; notes?: string | null },
): Promise<MedicalExam> {
  const response = await apiFetch<ItemResponse<MedicalExam>>(`/medical-exams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function deleteMedicalExam(id: number): Promise<void> {
  await apiFetch<{ message: string }>(`/medical-exams/${id}`, { method: 'DELETE' })
}
