import { useQuery } from '@tanstack/react-query'
import { Link, Navigate, useNavigate, useParams } from '@tanstack/react-router'
import { Download } from 'lucide-react'
import * as aclService from '../services/aclService'
import * as documentService from '../services/documentService'
import * as invoiceService from '../services/invoiceService'
import * as medicalExamService from '../services/medicalExamService'
import * as vacationService from '../services/vacationService'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { UserSalaryHistorySection } from '../components/users/UserSalaryHistorySection'
import { PageHeader } from '../components/ui/PageHeader'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../components/ui/Table'
import { formatDate, formatSalary } from '../lib/format'
import type { AclUser } from '../types/acl'
import type { VacationGrant } from '../types/vacation'
import type { Document } from '../types/document'
import type { Invoice } from '../types/invoice'
import type { MedicalExam } from '../types/medicalExam'

const CONTRACT_LABELS: Record<string, string> = {
  clt: 'CLT', pj: 'PJ', hybrid: 'Híbrido', other: 'Outros',
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-foreground-muted">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  )
}

function OptionalDetail({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return <DetailItem label={label} value={value} />
}

function formatContract(user: AclUser): string {
  if (!user.contract_type) return '—'
  return CONTRACT_LABELS[user.contract_type] ?? user.contract_type
}

function formatAddress(user: AclUser): string | null {
  const parts = [user.street, user.number, user.neighborhood, user.city, user.state].filter(Boolean)
  if (parts.length === 0) return null
  return `${user.street ?? ''}${user.number ? `, ${user.number}` : ''}${user.neighborhood ? ` - ${user.neighborhood}` : ''}${user.city ? ` - ${user.city}` : ''}${user.state ? `/${user.state}` : ''}`
}

function SectionHeader({ title }: { title: string }) {
  return <h2 className="text-base font-semibold text-foreground">{title}</h2>
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-dashed border-surface-sunken px-4 py-6 text-center text-sm text-foreground-muted">
      {message}
    </p>
  )
}

function VacationGrantsTable({ grants }: { grants: VacationGrant[] }) {
  if (grants.length === 0) return <EmptyState message="Nenhuma concessão de férias registrada." />

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Início</TableHeaderCell>
          <TableHeaderCell>Fim</TableHeaderCell>
          <TableHeaderCell>Dias</TableHeaderCell>
          <TableHeaderCell>Motivo</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {grants.map((grant) => (
          <TableRow key={grant.id}>
            <TableCell className="text-foreground-muted">{formatDate(grant.start_date)}</TableCell>
            <TableCell className="text-foreground-muted">{formatDate(grant.end_date)}</TableCell>
            <TableCell className="font-medium">{grant.days_used}</TableCell>
            <TableCell className="text-foreground-muted">{grant.reason || '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function DocumentsTable({ documents }: { documents: Document[] }) {
  if (documents.length === 0) return <EmptyState message="Nenhum documento cadastrado." />

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Nome</TableHeaderCell>
          <TableHeaderCell>Tipo</TableHeaderCell>
          <TableHeaderCell>Vencimento</TableHeaderCell>
          <TableHeaderCell> </TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell className="font-medium text-foreground">{doc.original_name}</TableCell>
            <TableCell className="text-foreground-muted">{doc.document_type?.name ?? '—'}</TableCell>
            <TableCell className="text-foreground-muted">{formatDate(doc.expiration_date)}</TableCell>
            <TableCell>
              <a
                href={documentService.getDocumentDownloadUrl(doc.id)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary-muted"
              >
                <Download className="size-3.5" aria-hidden />
                Baixar
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function MedicalExamsTable({ exams }: { exams: MedicalExam[] }) {
  if (exams.length === 0) return <EmptyState message="Nenhum exame cadastrado." />

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Tipo</TableHeaderCell>
          <TableHeaderCell>Realização</TableHeaderCell>
          <TableHeaderCell>Vencimento</TableHeaderCell>
          <TableHeaderCell>Observações</TableHeaderCell>
          <TableHeaderCell> </TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {exams.map((exam) => (
          <TableRow key={exam.id}>
            <TableCell className="font-medium text-foreground">{exam.exam_type}</TableCell>
            <TableCell className="text-foreground-muted">{formatDate(exam.execution_date)}</TableCell>
            <TableCell className={new Date(exam.expiration_date) < new Date() ? 'font-medium text-danger' : 'text-foreground-muted'}>
              {formatDate(exam.expiration_date)}
            </TableCell>
            <TableCell className="text-foreground-muted">{exam.notes || '—'}</TableCell>
            <TableCell>
              {exam.original_name && (
                <a
                  href={medicalExamService.getMedicalExamDownloadUrl(exam.id)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary-muted"
                >
                  <Download className="size-3.5" aria-hidden />
                  Baixar
                </a>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) return <EmptyState message="Nenhuma nota fiscal cadastrada." />

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Competência</TableHeaderCell>
          <TableHeaderCell>Nº Nota</TableHeaderCell>
          <TableHeaderCell>Valor</TableHeaderCell>
          <TableHeaderCell>Emissão</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell> </TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium text-foreground">{invoice.competence}</TableCell>
            <TableCell className="text-foreground-muted">{invoice.invoice_number}</TableCell>
            <TableCell>{formatSalary(invoice.amount)}</TableCell>
            <TableCell className="text-foreground-muted">{formatDate(invoice.issue_date)}</TableCell>
            <TableCell>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                invoice.status === 'approved' ? 'bg-success/10 text-success' :
                invoice.status === 'rejected' ? 'bg-danger/10 text-danger' :
                'bg-warning/10 text-warning'
              }`}>{invoice.status}</span>
            </TableCell>
            <TableCell>
              <a
                href={invoiceService.getInvoiceDownloadUrl(invoice.id)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary-muted"
              >
                <Download className="size-3.5" aria-hidden />
                Baixar
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function UserDetailPage() {
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const userId = id ? Number(id) : null

  const userQuery = useQuery({
    queryKey: ['users', userId],
    queryFn: () => aclService.getUser(userId!),
    enabled: userId !== null && !Number.isNaN(userId),
  })

  const grantsQuery = useQuery({
    queryKey: ['vacation-grants', userId],
    queryFn: () => vacationService.listVacationGrants(userId!),
    enabled: userId !== null && !Number.isNaN(userId),
  })

  const documentsQuery = useQuery({
    queryKey: ['documents', userId],
    queryFn: () => documentService.listDocuments(userId!),
    enabled: userId !== null && !Number.isNaN(userId),
  })

  const examsQuery = useQuery({
    queryKey: ['medical-exams', userId],
    queryFn: () => medicalExamService.listMedicalExams(userId!),
    enabled: userId !== null && !Number.isNaN(userId),
  })

  const invoicesQuery = useQuery({
    queryKey: ['invoices', userId],
    queryFn: () => invoiceService.listUserInvoices(userId!),
    enabled: userId !== null && !Number.isNaN(userId),
  })

  if (id && (userId === null || Number.isNaN(userId))) {
    return <Navigate to="/users" replace />
  }

  if (userQuery.isLoading) {
    return <p className="text-sm text-foreground-muted">Carregando colaborador...</p>
  }

  if (userQuery.isError || !userQuery.data) {
    return (
      <div className="space-y-4">
        <Alert variant="danger">Colaborador não encontrado.</Alert>
        <Link to="/users" className="text-sm text-primary hover:underline">Voltar para colaboradores</Link>
      </div>
    )
  }

  const user = userQuery.data
  const rolesLabel = user.roles?.map((role) => role.name).join(', ') || '—'
  const address = formatAddress(user)

  return (
    <div>
      <PageHeader
        title={user.name}
        description={user.job_title}
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="ghost" onClick={() => navigate({ to: '/users' })}>Voltar</Button>
            <Button type="button" onClick={() => navigate({ to: `/users/${user.id}/editar` })}>Editar</Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">Dados do colaborador</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Nome" value={user.name} />
            <DetailItem label="Cargo" value={user.job_title} />
            <DetailItem label="Contratação" value={formatDate(user.hired_at)} />
            <DetailItem label="Gestor" value={user.manager?.name ?? '—'} />
            <DetailItem label="Setor" value={user.sector?.name ?? '—'} />
            <DetailItem label="Remuneração" value={formatSalary(user.salary)} />
            <OptionalDetail label="Modalidade" value={formatContract(user)} />
            <OptionalDetail label="Empresa tomadora" value={user.contracting_company} />
            <OptionalDetail label="Dia emissão NF" value={user.invoice_due_day ? `Dia ${user.invoice_due_day}` : null} />
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">Acesso ao sistema</h2>
          <dl className="grid gap-4">
            <DetailItem label="E-mail" value={user.email} />
            <DetailItem label="Perfis" value={rolesLabel} />
          </dl>
        </Card>
      </div>

      {(user.cpf || user.rg || user.birth_date || user.phone) && (
        <Card className="mt-4 p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">Dados pessoais</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <OptionalDetail label="CPF" value={user.cpf} />
            <OptionalDetail label="RG" value={user.rg} />
            <OptionalDetail label="Nascimento" value={user.birth_date ? formatDate(user.birth_date) : null} />
            <OptionalDetail label="Telefone" value={user.phone} />
          </dl>
        </Card>
      )}

      {(user.company_name || user.cnpj) && (
        <Card className="mt-4 p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">Dados da empresa</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <OptionalDetail label="Razão social" value={user.company_name} />
            <OptionalDetail label="CNPJ" value={user.cnpj} />
          </dl>
        </Card>
      )}

      {address && (
        <Card className="mt-4 p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">Endereço</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <OptionalDetail label="CEP" value={user.zip_code} />
            <OptionalDetail label="Rua" value={user.street} />
            <OptionalDetail label="Número" value={user.number} />
            <OptionalDetail label="Bairro" value={user.neighborhood} />
            <OptionalDetail label="Cidade" value={user.city} />
            <OptionalDetail label="Estado" value={user.state} />
          </dl>
        </Card>
      )}

      {user.benefits && user.benefits.length > 0 && (
        <Card className="mt-4 p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">Benefícios</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            {user.benefits.map((b) => (
              <DetailItem key={b.id} label={b.name} value={formatSalary(b.price)} />
            ))}
          </dl>
        </Card>
      )}

      {(user.bank_details || user.emergency_contacts) && (
        <Card className="mt-4 p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">Adicionais</h2>
          <dl className="grid gap-4">
            <OptionalDetail label="Dados bancários" value={user.bank_details} />
            <OptionalDetail label="Contatos de emergência" value={user.emergency_contacts} />
          </dl>
        </Card>
      )}

      {user.observations && (
        <Card className="mt-4 p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">Observações</h2>
          <p className="text-sm text-foreground-muted whitespace-pre-wrap">{user.observations}</p>
        </Card>
      )}

      <Card className="mt-4 p-6">
        <SectionHeader title="Férias concedidas" />
        <div className="mt-4 overflow-x-auto rounded-xl border border-surface-sunken">
          {!grantsQuery.isLoading && grantsQuery.data ? (
            <VacationGrantsTable grants={grantsQuery.data} />
          ) : (
            <p className="px-4 py-6 text-center text-sm text-foreground-muted">Carregando...</p>
          )}
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <SectionHeader title="Documentos" />
        <div className="mt-4 overflow-x-auto rounded-xl border border-surface-sunken">
          {!documentsQuery.isLoading && documentsQuery.data ? (
            <DocumentsTable documents={documentsQuery.data} />
          ) : (
            <p className="px-4 py-6 text-center text-sm text-foreground-muted">Carregando...</p>
          )}
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <SectionHeader title="Exames" />
        <div className="mt-4 overflow-x-auto rounded-xl border border-surface-sunken">
          {!examsQuery.isLoading && examsQuery.data ? (
            <MedicalExamsTable exams={examsQuery.data} />
          ) : (
            <p className="px-4 py-6 text-center text-sm text-foreground-muted">Carregando...</p>
          )}
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <SectionHeader title="Notas Fiscais" />
        <div className="mt-4 overflow-x-auto rounded-xl border border-surface-sunken">
          {!invoicesQuery.isLoading && invoicesQuery.data ? (
            <InvoicesTable invoices={invoicesQuery.data} />
          ) : (
            <p className="px-4 py-6 text-center text-sm text-foreground-muted">Carregando...</p>
          )}
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <UserSalaryHistorySection userId={user.id} currentSalary={user.salary} readonly />
      </Card>
    </div>
  )
}
