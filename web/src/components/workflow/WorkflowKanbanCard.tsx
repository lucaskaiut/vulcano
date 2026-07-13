import { Download, Eye } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import type { WorkflowInstance } from '../../types/workflow'
import { Button } from '../ui/Button'

type WorkflowKanbanCardProps = {
  instance: WorkflowInstance
  onApprove: (id: number) => void
  onReject: (id: number) => void
  downloadUrl?: string | null
  onViewDetails?: (instanceId: number) => void
}

export function WorkflowKanbanCard({
  instance,
  onApprove,
  onReject,
  downloadUrl,
  onViewDetails,
}: WorkflowKanbanCardProps) {
  const { user } = useAuth()
  const currentStep = instance.current_step
  const isInProgress = instance.status === 'in_progress'

  const userRoleIds = user?.roles?.map((r) => r.id) ?? []

  const approvalRules = Array.isArray(currentStep?.approval_rules) ? currentStep.approval_rules : []

  const isResponsible = (() => {
    if (!currentStep || !user) return false

    for (const rule of approvalRules) {
      if (rule.type === 'user' && rule.id === user.id) return true
      if (rule.type === 'role' && rule.id && userRoleIds.includes(rule.id)) return true
      if (rule.type === 'manager') {
        const initiatorManagerId = instance.initiated_by?.manager_id ?? null
        if (user.id === initiatorManagerId) return true
      }
    }

    return false
  })()

  const showActions = isInProgress && isResponsible

  const responsibleLabel = (() => {
    if (!currentStep) return null
    const rules = approvalRules
    if (rules.length === 0) return null

    const labels = rules.map((rule) => {
      if (rule.type === 'manager') return 'Gestor do solicitante'
      if (rule.type === 'role') return 'Perfil'
      if (rule.type === 'user') return 'Usuário'
      return null
    }).filter(Boolean)

    return labels.length > 0 ? labels.join(', ') : null
  })()

  return (
    <div className="rounded-lg bg-surface p-3 shadow-sm">
      <p className="text-sm font-medium text-foreground">{instance.title}</p>

      <p className="mt-0.5 text-xs text-foreground-muted">
        {instance.initiated_by?.name ?? '-'}
      </p>

      {isInProgress && !isResponsible && responsibleLabel && (
        <p className="mt-1 text-[10px] leading-tight text-foreground-subtle">
          Aprovação: {responsibleLabel}
        </p>
      )}

      {showActions && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button size="sm" variant="primary" onClick={() => onApprove(instance.id)}>
            Aprovar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-danger"
            onClick={() => onReject(instance.id)}
          >
            Reprovar
          </Button>
          {onViewDetails && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onViewDetails(instance.id)}
              aria-label="Detalhes"
            >
              <Eye className="size-3.5" />
            </Button>
          )}
        </div>
      )}

      {downloadUrl && (
        <div className="mt-2">
          <a
            href={downloadUrl}
            download
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-foreground-muted transition-colors hover:bg-surface-sunken hover:text-foreground"
          >
            <Download className="size-3" aria-hidden />
            Download
          </a>
        </div>
      )}
    </div>
  )
}
