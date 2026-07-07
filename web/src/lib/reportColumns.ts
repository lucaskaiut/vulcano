export type ReportColumn = {
  key: string
  label: string
}

export type ReportType = 'collaborators' | 'vacation-requests' | 'invoices' | 'medical-exams' | 'costs'

const collaboratorsColumns: ReportColumn[] = [
  { key: 'name', label: 'Nome' },
  { key: 'job_title', label: 'Cargo' },
  { key: 'email', label: 'E-mail' },
  { key: 'salary', label: 'Remuneração' },
  { key: 'hired_at', label: 'Contratação' },
  { key: 'roles', label: 'Perfis' },
]

const vacationRequestsColumns: ReportColumn[] = [
  { key: 'user_name', label: 'Colaborador' },
  { key: 'start_date', label: 'Início' },
  { key: 'end_date', label: 'Fim' },
  { key: 'requested_days', label: 'Dias' },
  { key: 'status', label: 'Status' },
  { key: 'justification', label: 'Justificativa' },
]

const invoicesColumns: ReportColumn[] = [
  { key: 'user_name', label: 'Colaborador' },
  { key: 'competence', label: 'Competência' },
  { key: 'invoice_number', label: 'Nº Nota' },
  { key: 'amount', label: 'Valor' },
  { key: 'issue_date', label: 'Emissão' },
  { key: 'status', label: 'Status' },
]

const medicalExamsColumns: ReportColumn[] = [
  { key: 'user_name', label: 'Colaborador' },
  { key: 'exam_type', label: 'Tipo' },
  { key: 'execution_date', label: 'Realização' },
  { key: 'expiration_date', label: 'Vencimento' },
  { key: 'notes', label: 'Observações' },
]

const costsColumns: ReportColumn[] = [
  { key: 'user_name', label: 'Colaborador' },
  { key: 'category', label: 'Categoria' },
  { key: 'amount', label: 'Valor' },
]

export const REPORT_COLUMNS: Record<ReportType, ReportColumn[]> = {
  collaborators: collaboratorsColumns,
  'vacation-requests': vacationRequestsColumns,
  invoices: invoicesColumns,
  'medical-exams': medicalExamsColumns,
  costs: costsColumns,
}

export function getSavedColumns(type: ReportType, preferences: Record<string, unknown> | null | undefined): string[] {
  const reportColumns = (preferences as { report_columns?: Record<string, string[]> } | null | undefined)?.report_columns
  const saved = reportColumns?.[type]

  if (saved && saved.length > 0) {
    const available = REPORT_COLUMNS[type].map((c) => c.key)
    return saved.filter((k) => available.includes(k))
  }

  return REPORT_COLUMNS[type].map((c) => c.key)
}
