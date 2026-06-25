import { useAuth } from '../../contexts/AuthContext'
import type { WorkflowInstance } from '../../types/workflow'
import { Button } from '../ui/Button'

type WorkflowKanbanCardProps = {
  instance: WorkflowInstance
  onApprove: (id: number) => void
  onReject: (id: number) => void
}

export function WorkflowKanbanCard({
  instance,
  onApprove,
  onReject,
}: WorkflowKanbanCardProps) {
  const { user } = useAuth()
  const currentStep = instance.current_step

  const userCanAct =
    currentStep &&
    instance.status === 'in_progress' &&
    user &&
    ((currentStep.responsible_user && currentStep.responsible_user.id === user.id) ||
      (currentStep.responsible_role &&
        user.roles?.some((r) => r.id === currentStep.responsible_role!.id)))

  return (
    <div className="rounded-lg bg-surface p-3 shadow-sm">
      <p className="text-sm font-medium text-foreground">{instance.title}</p>

      <p className="mt-0.5 text-xs text-foreground-muted">
        {instance.initiated_by?.name ?? '-'}
      </p>

      {instance.status === 'in_progress' && userCanAct && (
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
    </div>
  )
}
