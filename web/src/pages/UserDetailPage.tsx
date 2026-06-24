import { useQuery } from '@tanstack/react-query'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import * as aclService from '../services/aclService'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { UserSalaryHistorySection } from '../components/users/UserSalaryHistorySection'
import { PageHeader } from '../components/ui/PageHeader'
import { formatDate, formatSalary } from '../lib/format'

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-foreground-muted">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  )
}

export function UserDetailPage() {
  const { id } = useParams()
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
        <Link to="/users" className="text-sm text-primary hover:underline">
          Voltar para colaboradores
        </Link>
      </div>
    )
  }

  const user = userQuery.data
  const rolesLabel = user.roles?.map((role) => role.name).join(', ') || '—'

  return (
    <div>
      <PageHeader
        title={user.name}
        description={user.job_title}
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="ghost" onClick={() => navigate('/users')}>
              Voltar
            </Button>
            <Button type="button" onClick={() => navigate(`/users/${user.id}/editar`)}>
              Editar
            </Button>
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
            <DetailItem label="Remuneração" value={formatSalary(user.salary)} />
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

      <Card className="mt-4 p-6">
        <UserSalaryHistorySection
          userId={user.id}
          currentSalary={user.salary}
          readonly
        />
      </Card>
    </div>
  )
}
