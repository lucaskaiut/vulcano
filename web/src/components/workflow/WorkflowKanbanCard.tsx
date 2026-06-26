import { Download } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import type { WorkflowInstance } from '../../types/workflow'
import { Button } from '../ui/Button'

type WorkflowKanbanCardProps = {
  instance: WorkflowInstance
  onApprove: (id: number) => void
  onReject: (id: number) => void
  downloadUrl?: string | null
}

export function WorkflowKanbanCard({
  instance,
  onApprove,
  onReject,
}: WorkflowKanbanCardProps) {
  const { user } = useAuth()
  const currentStep = instance.current_step
  const isInProgress = instance.status === 'in_progress'

  const stepResponsibleRoleId = currentStep?.responsible_role?.id
  const stepResponsibleUserId = currentStep?.responsible_user?.id
  const userRoleIds = user?.roles?.map((r) => r.id) ?? []

  const isResponsible =
    (!!stepResponsibleUserId && stepResponsibleUserId === user?.id) ||
    (!!stepResponsibleRoleId && userRoleIds.includes(stepResponsibleRoleId))

  const showActions = isInProgress && isResponsible

  return (
    <div className="rounded-lg bg-surface p-3 shadow-sm">
      <p className="text-sm font-medium text-foreground">{instance.title}</p>

      <p className="mt-0.5 text-xs text-foreground-muted">
        {instance.initiated_by?.name ?? '-'}
      </p>

      {isInProgress && !isResponsible && currentStep && (
        <p className="mt-1 text-[10px] leading-tight text-foreground-subtle">
          Responsável: {currentStep.responsible_role?.name ?? currentStep.responsible_user?.name ?? '—'}
        </p>
      )}

      {showActions && (
        <div className="mt-2 flex gap-2">
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
