export type DocumentType = {
  id: number
  name: string
  expiration_required: boolean
}

export type Document = {
  id: number
  user_id: number
  original_name: string
  mime_type: string | null
  size: number | null
  expiration_date: string | null
  document_type: {
    id: number
    name: string
    expiration_required: boolean
  } | null
  created_at: string
}
