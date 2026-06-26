import { apiFetch } from './api'
import type { Document, DocumentType } from '../types/document'

type ItemResponse<T> = { data: T; message?: string }
type ListResponse<T> = { data: T[] }
type MessageResponse = { message: string }

export async function listDocumentTypes(): Promise<DocumentType[]> {
  const response = await apiFetch<ListResponse<DocumentType>>('/document-types')
  return response.data
}

export async function createDocumentType(payload: { name: string; expiration_required?: boolean }): Promise<DocumentType> {
  const response = await apiFetch<ItemResponse<DocumentType>>('/document-types', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function updateDocumentType(id: number, payload: { name?: string; expiration_required?: boolean }): Promise<DocumentType> {
  const response = await apiFetch<ItemResponse<DocumentType>>(`/document-types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return response.data
}

export async function listDocuments(userId: number): Promise<Document[]> {
  const response = await apiFetch<ListResponse<Document>>(`/users/${userId}/documents`)
  return response.data
}

export async function uploadDocument(
  userId: number,
  file: File,
  documentTypeId: number,
  expirationDate?: string | null,
): Promise<Document> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('document_type_id', String(documentTypeId))
  if (expirationDate) {
    formData.append('expiration_date', expirationDate)
  }

  const response = await apiFetch<ItemResponse<Document>>(`/users/${userId}/documents`, {
    method: 'POST',
    body: formData,
  })

  return response.data
}

export async function deleteDocument(id: number): Promise<void> {
  await apiFetch<MessageResponse>(`/documents/${id}`, { method: 'DELETE' })
}

export function getDocumentDownloadUrl(id: number): string {
  return `${import.meta.env.VITE_API_BASE_URL ?? '/api'}/documents/${id}/download`
}

export function getDocumentPreviewUrl(id: number): string {
  return `${import.meta.env.VITE_API_BASE_URL ?? '/api'}/documents/${id}/preview`
}
