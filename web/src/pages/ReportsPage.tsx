import { useQuery } from '@tanstack/react-query'
import { FileSpreadsheet, FileText, Loader2 } from 'lucide-react'
import { useState, useMemo } from 'react'
import * as reportService from '../services/reportService'
import { getReportDownloadUrl } from '../services/reportService'
import type { ReportCollaborator, ReportVacationRequest, ReportInvoice, ReportMedicalExam } from '../types/report'
import { formatDate, formatSalary } from '../lib/format'
import { PageHeader } from '../components/ui/PageHeader'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table'
import { usePermissions } from '../hooks/usePermissions'

const TABS = [
  { key: 'collaborators', label: 'Colaboradores', permission: 'users.view' },
  { key: 'vacation-requests', label: 'Férias', permission: 'vacation_requests.view' },
  { key: 'invoices', label: 'Notas Fiscais', permission: 'invoices.view' },
  { key: 'medical-exams', label: 'Exames', permission: 'medical_exams.view' },
] as const

type TabKey = typeof TABS[number]['key']

export function ReportsPage() {
  const { can } = usePermissions()
  const [tab, setTab] = useState<TabKey>('collaborators')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [expiredFilter, setExpiredFilter] = useState('')

  const filters = useMemo(() => ({ search: search || undefined }), [search])

  const availableTabs = TABS.filter((t) => can(t.permission))

  const collabQuery = useQuery({
    queryKey: ['reports', 'collaborators', search],
    queryFn: () => reportService.reportCollaborators(filters),
    enabled: tab === 'collaborators',
  })

  const vacationQuery = useQuery({
    queryKey: ['reports', 'vacation-requests', statusFilter],
    queryFn: () => reportService.reportVacationRequests({ status: statusFilter || undefined }),
    enabled: tab === 'vacation-requests',
  })

  const invoiceQuery = useQuery({
    queryKey: ['reports', 'invoices', statusFilter],
    queryFn: () => reportService.reportInvoices({ status: statusFilter || undefined }),
    enabled: tab === 'invoices',
  })

  const examQuery = useQuery({
    queryKey: ['reports', 'medical-exams', expiredFilter],
    queryFn: () => reportService.reportMedicalExams({ expired: expiredFilter || undefined }),
    enabled: tab === 'medical-exams',
  })

  const currentData = tab === 'collaborators' ? collabQuery.data
    : tab === 'vacation-requests' ? vacationQuery.data
    : tab === 'invoices' ? invoiceQuery.data
    : examQuery.data

  const isLoading = tab === 'collaborators' ? collabQuery.isLoading
    : tab === 'vacation-requests' ? vacationQuery.isLoading
    : tab === 'invoices' ? invoiceQuery.isLoading
    : examQuery.isLoading

  function getDownloadFilter(): Record<string, string | undefined> {
    if (tab === 'collaborators') return { search: search || undefined }
    if (tab === 'vacation-requests') return { status: statusFilter || undefined }
    if (tab === 'invoices') return { status: statusFilter || undefined }
    return { expired: expiredFilter || undefined }
  }

  if (availableTabs.length === 0) {
    return <PageHeader title="Relatórios" description="Você não tem permissão para acessar nenhum relatório." />
  }

  return (
    <div>
      <PageHeader title="Relatórios" description="Exporte dados em PDF ou planilha" />

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-surface-sunken p-1">
        {availableTabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-surface text-foreground shadow-sm'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        {tab === 'collaborators' && (
          <div className="w-64">
            <Input
              label=""
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
        {tab === 'vacation-requests' && (
          <div className="w-44">
            <Select
              value={statusFilter}
              options={[
                { value: '', label: 'Todos os status' },
                { value: 'pending', label: 'Pendente' },
                { value: 'approved', label: 'Aprovada' },
                { value: 'rejected', label: 'Reprovada' },
                { value: 'cancelled', label: 'Cancelada' },
              ]}
              onChange={(v) => setStatusFilter(v as string)}
              aria-label="Filtrar por status"
            />
          </div>
        )}
        {tab === 'invoices' && (
          <div className="w-44">
            <Select
              value={statusFilter}
              options={[
                { value: '', label: 'Todos os status' },
                { value: 'pending', label: 'Pendente' },
                { value: 'approved', label: 'Aprovada' },
                { value: 'rejected', label: 'Reprovada' },
              ]}
              onChange={(v) => setStatusFilter(v as string)}
              aria-label="Filtrar por status"
            />
          </div>
        )}
        {tab === 'medical-exams' && (
          <div className="w-44">
            <Select
              value={expiredFilter}
              options={[
                { value: '', label: 'Todos' },
                { value: '1', label: 'Vencidos' },
                { value: '0', label: 'Válidos' },
              ]}
              onChange={(v) => setExpiredFilter(v as string)}
              aria-label="Filtrar por vencimento"
            />
          </div>
        )}

        {/* Export buttons */}
        <div className="flex gap-2 sm:ml-auto">
          <a
            href={getReportDownloadUrl(tab, getDownloadFilter(), 'xlsx')}
            className="inline-flex items-center gap-1.5 rounded-md bg-surface-sunken px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-success-muted hover:text-success"
          >
            <FileSpreadsheet className="size-4" aria-hidden />
            Excel
          </a>
          <a
            href={getReportDownloadUrl(tab, getDownloadFilter(), 'pdf')}
            className="inline-flex items-center gap-1.5 rounded-md bg-surface-sunken px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-danger/10 hover:text-danger"
          >
            <FileText className="size-4" aria-hidden />
            PDF
          </a>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-5 animate-spin text-foreground-muted" aria-hidden />
        </div>
      ) : currentData && currentData.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-surface-sunken">
          <Table>
            <TableHead>
              {tab === 'collaborators' && (
                <TableRow>
                  <TableHeaderCell>Nome</TableHeaderCell>
                  <TableHeaderCell>Cargo</TableHeaderCell>
                  <TableHeaderCell>E-mail</TableHeaderCell>
                  <TableHeaderCell>Remuneração</TableHeaderCell>
                  <TableHeaderCell>Contratação</TableHeaderCell>
                  <TableHeaderCell>Perfis</TableHeaderCell>
                </TableRow>
              )}
              {tab === 'vacation-requests' && (
                <TableRow>
                  <TableHeaderCell>Colaborador</TableHeaderCell>
                  <TableHeaderCell>Início</TableHeaderCell>
                  <TableHeaderCell>Fim</TableHeaderCell>
                  <TableHeaderCell>Dias</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              )}
              {tab === 'invoices' && (
                <TableRow>
                  <TableHeaderCell>Colaborador</TableHeaderCell>
                  <TableHeaderCell>Competência</TableHeaderCell>
                  <TableHeaderCell>Nº Nota</TableHeaderCell>
                  <TableHeaderCell>Valor</TableHeaderCell>
                  <TableHeaderCell>Emissão</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              )}
              {tab === 'medical-exams' && (
                <TableRow>
                  <TableHeaderCell>Colaborador</TableHeaderCell>
                  <TableHeaderCell>Tipo</TableHeaderCell>
                  <TableHeaderCell>Realização</TableHeaderCell>
                  <TableHeaderCell>Vencimento</TableHeaderCell>
                  <TableHeaderCell>Observações</TableHeaderCell>
                </TableRow>
              )}
            </TableHead>
            <TableBody>
              {tab === 'collaborators' && (currentData as ReportCollaborator[]).map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-foreground-muted">{r.job_title}</TableCell>
                  <TableCell className="text-foreground-muted">{r.email}</TableCell>
                  <TableCell>{formatSalary(r.salary)}</TableCell>
                  <TableCell className="text-foreground-muted">{formatDate(r.hired_at)}</TableCell>
                  <TableCell className="text-foreground-muted">{r.roles.join(', ')}</TableCell>
                </TableRow>
              ))}
              {tab === 'vacation-requests' && (currentData as ReportVacationRequest[]).map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.user_name}</TableCell>
                  <TableCell className="text-foreground-muted">{formatDate(r.start_date)}</TableCell>
                  <TableCell className="text-foreground-muted">{formatDate(r.end_date)}</TableCell>
                  <TableCell>{r.requested_days}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.status === 'approved' ? 'bg-success/10 text-success' :
                      r.status === 'rejected' ? 'bg-danger/10 text-danger' :
                      r.status === 'cancelled' ? 'bg-surface-sunken text-foreground-muted' :
                      'bg-warning/10 text-warning'
                    }`}>{r.status}</span>
                  </TableCell>
                </TableRow>
              ))}
              {tab === 'invoices' && (currentData as ReportInvoice[]).map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.user_name}</TableCell>
                  <TableCell className="text-foreground-muted">{r.competence}</TableCell>
                  <TableCell className="text-foreground-muted">{r.invoice_number}</TableCell>
                  <TableCell>{formatSalary(r.amount)}</TableCell>
                  <TableCell className="text-foreground-muted">{formatDate(r.issue_date)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.status === 'approved' ? 'bg-success/10 text-success' :
                      r.status === 'rejected' ? 'bg-danger/10 text-danger' :
                      'bg-warning/10 text-warning'
                    }`}>{r.status}</span>
                  </TableCell>
                </TableRow>
              ))}
              {tab === 'medical-exams' && (currentData as ReportMedicalExam[]).map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.user_name}</TableCell>
                  <TableCell className="text-foreground-muted">{r.exam_type}</TableCell>
                  <TableCell className="text-foreground-muted">{formatDate(r.execution_date)}</TableCell>
                  <TableCell className={new Date(r.expiration_date) < new Date() ? 'font-medium text-danger' : 'text-foreground-muted'}>
                    {formatDate(r.expiration_date)}
                  </TableCell>
                  <TableCell className="text-foreground-muted">{r.notes || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-surface-sunken px-4 py-12 text-center">
          <p className="text-sm text-foreground-muted">Nenhum dado encontrado com os filtros atuais.</p>
        </div>
      )}
    </div>
  )
}
