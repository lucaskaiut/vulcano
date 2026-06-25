import { Ban, Check, Play, X } from 'lucide-react'
import type {
  WorkflowHistoryAction,
  WorkflowInstanceHistory,
} from '../../types/workflow'

const ACTION_CONFIG: Record<
  WorkflowHistoryAction,
  { icon: typeof Play; iconColor: string; bg: string }
> = {
  started: { icon: Play, iconColor: 'text-blue-500', bg: 'bg-blue-100' },
  approved: { icon: Check, iconColor: 'text-green-500', bg: 'bg-green-100' },
  rejected: { icon: X, iconColor: 'text-red-500', bg: 'bg-red-100' },
  cancelled: { icon: Ban, iconColor: 'text-gray-500', bg: 'bg-gray-100' },
}

function formatDate(iso?: string | null): string {
  if (!iso) return '-'

  const date = new Date(iso)

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type WorkflowHistoryTimelineProps = {
  histories: WorkflowInstanceHistory[]
}

export function WorkflowHistoryTimeline({
  histories,
}: WorkflowHistoryTimelineProps) {
  if (histories.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-foreground-muted">
        Nenhum histórico registrado.
      </p>
    )
  }

  return (
    <div className="relative ml-2 border-l-2 border-surface-sunken">
      {histories.map((entry) => {
        const config = ACTION_CONFIG[entry.action]
        const Icon = config.icon

        return (
          <div key={entry.id} className="relative pb-5 pl-6 last:pb-0">
            <div
              className={`absolute -left-[13px] top-0.5 flex size-6 items-center justify-center rounded-full ${config.bg}`}
            >
              <Icon className={`size-3.5 ${config.iconColor}`} aria-hidden />
            </div>

            <div className="rounded-lg bg-surface-sunken p-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-foreground">
                  {entry.user?.name ?? 'Sistema'}
                </span>
                <span className="text-foreground-muted">
                  {entry.description}
                </span>
              </div>

              {entry.notes && (
                <p className="mt-1 text-xs text-foreground-subtle">
                  {entry.notes}
                </p>
              )}

              <p className="mt-1 text-xs text-foreground-subtle">
                {formatDate(entry.created_at)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
