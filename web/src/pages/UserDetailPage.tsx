import { useQuery } from '@tanstack/react-query'
import { Link, Navigate, useNavigate, useParams } from '@tanstack/react-router'
import * as aclService from '../services/aclService'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { UserSalaryHistorySection } from '../components/users/UserSalaryHistorySection'
import { PageHeader } from '../components/ui/PageHeader'
import { formatDate, formatSalary } from '../lib/format'
import type { AclUser } from '../types/acl'

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

export function UserDetailPage() {
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const userId = id ? Number(id) : null

  const userQuery = useQuery({
    queryKey: ['users', userId],
    queryFn: () => aclService.getUser(userId!),
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
        <UserSalaryHistorySection userId={user.id} currentSalary={user.salary} readonly />
      </Card>
    </div>
  )
}
