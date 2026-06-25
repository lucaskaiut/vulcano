import type { WorkflowInstanceStatus } from '../../types/workflow'

const STATUS_CONFIG: Record<
  WorkflowInstanceStatus,
  { label: string; bg: string; text: string }
> = {
  in_progress: {
    label: 'Em andamento',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
  },
  approved: {
    label: 'Aprovado',
    bg: 'bg-green-100',
    text: 'text-green-800',
  },
  rejected: {
    label: 'Reprovado',
    bg: 'bg-red-100',
    text: 'text-red-800',
  },
  cancelled: {
    label: 'Cancelado',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
  },
}

type WorkflowStatusBadgeProps = {
  status: WorkflowInstanceStatus
}

export function WorkflowStatusBadge({ status }: WorkflowStatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  )
}
