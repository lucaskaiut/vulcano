import { useQuery } from '@tanstack/react-query'
import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import type { WorkflowInstance, WorkflowType } from '../../types/workflow'
import { listSteps } from '../../services/workflowService'
import { WorkflowKanbanCard } from './WorkflowKanbanCard'
import { ConfirmModal } from '../ui/ConfirmModal'
import { WORKFLOW_TYPE_LABELS } from '../../services/workflowService'

type WorkflowKanbanProps = {
  type: WorkflowType
  instances: WorkflowInstance[]
  onApprove: (id: number) => void
  onReject: (id: number) => void
  onRefresh: () => void
  getDownloadUrl?: (instanceId: number) => string | null
  onViewDetails?: (instanceId: number) => void
}

export function WorkflowKanban({
  type,
  instances,
  onApprove,
  onReject,
  onRefresh: _onRefresh,
  getDownloadUrl,
  onViewDetails,
}: WorkflowKanbanProps) {
  const [rejectTarget, setRejectTarget] = useState<number | null>(null)

  const { data: steps = [] } = useQuery({
    queryKey: ['workflow-steps', type],
    queryFn: () => listSteps(type),
  })

  function handleRejectConfirm() {
    if (rejectTarget !== null) {
      onReject(rejectTarget)
      setRejectTarget(null)
    }
  }

  const inProgress = instances.filter((i) => i.status === 'in_progress')
  const finished = instances.filter((i) => i.status !== 'in_progress')

  if (steps.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-surface-sunken p-8 text-center">
        <p className="text-sm text-foreground-muted">
          Nenhuma etapa configurada para o fluxo &quot;{WORKFLOW_TYPE_LABELS[type]}&quot;.
        </p>
        <p className="mt-1 text-xs text-foreground-subtle">
          Configure as etapas antes de visualizar o kanban.
        </p>
      </div>
    )
  }

  function getCardsForStep(stepId: number): WorkflowInstance[] {
    return inProgress.filter(
      (i) => i.current_step?.id === stepId,
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${steps.length + 1}, minmax(240px, 1fr))`,
            minWidth: `${(steps.length + 1) * 260}px`,
          }}
        >
          {steps.map((step) => {
            const cards = getCardsForStep(step.id)

            return (
              <div
                key={step.id}
                className="rounded-lg bg-surface-sunken p-3"
              >
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  {step.name}
                  {cards.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-primary-muted px-1.5 py-0.5 text-xs text-primary">
                      {cards.length}
                    </span>
                  )}
                </h3>

                <div className="space-y-2">
                  {cards.length === 0 && (
                    <p className="py-4 text-center text-xs text-foreground-subtle">
                      Nenhuma solicitação
                    </p>
                  )}

                  {cards.map((instance) => (
                    <WorkflowKanbanCard
                      key={instance.id}
                      instance={instance}
                      onApprove={onApprove}
                      onReject={(id) => setRejectTarget(id)}
                      downloadUrl={getDownloadUrl?.(instance.id) ?? null}
                      onViewDetails={onViewDetails}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          <div className="rounded-lg bg-surface-sunken p-3">
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <CheckCircle2 className="size-4 text-green-500" aria-hidden />
              Concluído
              {finished.length > 0 && (
                <span className="rounded-full bg-primary-muted px-1.5 py-0.5 text-xs text-primary">
                  {finished.length}
                </span>
              )}
            </h3>

            <div className="space-y-2">
              {finished.length === 0 && (
                <p className="py-4 text-center text-xs text-foreground-subtle">
                  Nenhuma solicitação concluída
                </p>
              )}

              {finished.map((instance) => (
                <WorkflowKanbanCard
                  key={instance.id}
                  instance={instance}
                  onApprove={onApprove}
                  onReject={(id) => setRejectTarget(id)}
                  downloadUrl={getDownloadUrl?.(instance.id) ?? null}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={rejectTarget !== null}
        title="Reprovar solicitação"
        description="Tem certeza que deseja reprovar esta solicitação?"
        confirmLabel="Reprovar"
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectTarget(null)}
      />
    </>
  )
}
