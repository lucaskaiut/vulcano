import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  DollarSign,
  FileText,
  Percent,
  Stethoscope,
  Users,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { usePermissions } from '../hooks/usePermissions'
import { getDashboardSummary } from '../services/dashboardService'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'

function currency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function number(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
  color,
  canAccess = true,
}: {
  icon: typeof Users
  label: string
  value: string
  href?: string
  color: { bg: string; text: string; muted: string }
  canAccess?: boolean
}) {
  const content = (
    <div className="flex items-start gap-4">
      <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${color.muted}`}>
        <Icon className={`size-5 ${color.text}`} aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="mt-0.5 text-sm text-foreground-muted">{label}</p>
      </div>
    </div>
  )

  if (href && canAccess) {
    return (
      <Link to={href} className="group block rounded-xl bg-surface p-5 shadow-overlay transition-shadow hover:shadow-lg">
        {content}
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-foreground-subtle opacity-0 transition-opacity group-hover:opacity-100">
          Acessar <ArrowRight className="size-3" aria-hidden />
        </div>
      </Link>
    )
  }

  return (
    <div className="rounded-xl bg-surface p-5 shadow-overlay">
      {content}
    </div>
  )
}

export function HomePage() {
  const { user } = useAuth()
  const { can } = usePermissions()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardSummary,
  })

  const colors = {
    blue: { bg: 'bg-primary', text: 'text-primary', muted: 'bg-primary-muted' },
    green: { bg: 'bg-success', text: 'text-success', muted: 'bg-success-muted' },
    amber: { bg: 'bg-warning', text: 'text-warning', muted: 'bg-warning-muted' },
    red: { bg: 'bg-danger', text: 'text-danger', muted: 'bg-danger/10' },
    accent: { bg: 'bg-accent', text: 'text-accent', muted: 'bg-accent-muted' },
    secondary: { bg: 'bg-secondary', text: 'text-secondary', muted: 'bg-secondary-muted' },
  }

  const today = new Date()
  const greeting =
    today.getHours() < 12 ? 'Bom dia' : today.getHours() < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0]}`}
        description="Visão geral do sistema"
      />

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-surface p-5 shadow-overlay">
                <div className="flex items-start gap-4">
                  <div className="size-11 rounded-xl bg-surface-sunken" />
                  <div className="flex-1 space-y-2">
                    <div className="h-7 w-20 rounded bg-surface-sunken" />
                    <div className="h-4 w-28 rounded bg-surface-sunken" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Primary metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Users}
              label="Colaboradores ativos"
              value={number(data.total_collaborators)}
              href={can('users.view') ? '/users' : undefined}
              color={colors.blue}
              canAccess={can('users.view')}
            />
            <StatCard
              icon={DollarSign}
              label="Custo mensal estimado"
              value={currency(data.total_cost)}
              href={can('costs.view') ? '/costs' : undefined}
              color={colors.green}
              canAccess={can('costs.view')}
            />
            <StatCard
              icon={Clock}
              label="Férias pendentes"
              value={number(data.pending_vacation_requests)}
              href={can('vacation_requests.view') ? '/vacation-requests' : undefined}
              color={colors.amber}
              canAccess={can('vacation_requests.view')}
            />
            <StatCard
              icon={Percent}
              label="Comissões pendentes"
              value={number(data.pending_commissions)}
              href={can('commissions.view') ? '/sales' : undefined}
              color={colors.secondary}
              canAccess={can('commissions.view')}
            />
          </div>

          {/* Secondary metrics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={FileText}
              label="Notas fiscais pendentes"
              value={number(data.pending_invoices)}
              href={can('invoices.view') ? '/invoices' : undefined}
              color={colors.accent}
              canAccess={can('invoices.view')}
            />
            <StatCard
              icon={AlertTriangle}
              label="Exames vencidos"
              value={number(data.expired_exams)}
              color={colors.red}
            />
            <StatCard
              icon={Stethoscope}
              label="Exames vencendo em 30 dias"
              value={number(data.expiring_exams)}
              color={colors.amber}
            />
          </div>

          {/* Quick actions */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-foreground">Acesso rápido</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {can('users.create') && (
                <Link
                  to="/users/novo"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-surface-sunken px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-primary-muted hover:text-primary"
                >
                  <Users className="size-4" aria-hidden />
                  Novo colaborador
                </Link>
              )}
              {can('invoices.create') && (
                <Link
                  to="/invoices"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-surface-sunken px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-primary-muted hover:text-primary"
                >
                  <FileText className="size-4" aria-hidden />
                  Enviar nota fiscal
                </Link>
              )}
              {can('commissions.create') && (
                <Link
                  to="/sales"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-surface-sunken px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-primary-muted hover:text-primary"
                >
                  <DollarSign className="size-4" aria-hidden />
                  Registrar venda
                </Link>
              )}
              {can('vacation_requests.create') && (
                <Link
                  to="/vacation-requests"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-surface-sunken px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-primary-muted hover:text-primary"
                >
                  <Clock className="size-4" aria-hidden />
                  Solicitar férias
                </Link>
              )}
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-sm text-foreground-muted">Não foi possível carregar os dados do dashboard.</p>
        </Card>
      )}
    </div>
  )
}
