export type MedicalExam = {
  id: number
  user_id: number
  exam_type: string
  execution_date: string
  expiration_date: string
  notes: string | null
  original_name: string | null
  mime_type: string | null
  size: number | null
  created_at: string
}
