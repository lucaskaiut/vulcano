export type ReportCollaborator = {
  id: number; name: string; job_title: string; email: string
  salary: string; hired_at: string; roles: string[]
}
export type ReportVacationRequest = {
  id: number; user_name: string; start_date: string; end_date: string
  requested_days: number; status: string; justification: string | null
}
export type ReportInvoice = {
  id: number; user_name: string; competence: string; invoice_number: string
  amount: string; issue_date: string; status: string
}
export type ReportMedicalExam = {
  id: number; user_name: string; exam_type: string
  execution_date: string; expiration_date: string; notes: string | null
}
