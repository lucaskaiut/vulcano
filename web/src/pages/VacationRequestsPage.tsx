import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../components/ui/Table'
import { formatDate } from '../lib/format'
import { ApiError } from '../services/api'
import * as vacationRequestService from '../services/vacationRequestService'
import * as workflowService from '../services/workflowService'
import type { VacationRequest } from '../types/vacationRequest'

function StatusBadge({ status, label }: { status: string; label: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-600',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? 'bg-surface-sunken text-foreground-muted'}`}>
      {label}
    </span>
  )
}

export default function VacationRequestsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const requestsQuery = useQuery({
    queryKey: ['vacation-requests'],
    queryFn: () => vacationRequestService.listVacationRequests(),
  })

  const approveMutation = useMutation({
    mutationFn: (instanceId: number) => workflowService.approveWorkflowInstance(instanceId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vacation-requests'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (instanceId: number) => workflowService.rejectWorkflowInstance(instanceId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vacation-requests'] })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => vacationRequestService.cancelVacationRequest(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vacation-requests'] })
    },
  })

  const getError = useCallback((error: unknown) => {
    return error instanceof ApiError ? error.message : 'Erro na operação.'
  }, [])

  const requests = requestsQuery.data ?? []

  return (
    <div>
      <PageHeader
        title="Solicitações de férias"
        description="Gerencie solicitações de férias dos colaboradores."
        action={
          <Button type="button" onClick={() => navigate({ to: '/vacation-requests/novo' })}>
            Nova solicitação
          </Button>
        }
      />

      {requestsQuery.isLoading ? (
        <p className="text-sm text-foreground-muted">Carregando solicitações...</p>
      ) : requestsQuery.isError ? (
        <Alert variant="danger">Não foi possível carregar as solicitações.</Alert>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Colaborador</TableHeaderCell>
                <TableHeaderCell>Período</TableHeaderCell>
                <TableHeaderCell>Dias</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Etapa atual</TableHeaderCell>
                <TableHeaderCell className="w-40 text-right">Ações</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-foreground-muted">
                    Nenhuma solicitação de férias encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <RequestRow
                    key={req.id}
                    request={req}
                    errorMessage={getError}
                    onApprove={(instanceId) => approveMutation.mutate(instanceId)}
                    onReject={(instanceId) => rejectMutation.mutate(instanceId)}
                    onCancel={(id) => cancelMutation.mutate(id)}
                    isApproving={approveMutation.isPending}
                    isRejecting={rejectMutation.isPending}
                    isCancelling={cancelMutation.isPending}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}

type RequestRowProps = {
  request: VacationRequest
  errorMessage: (error: unknown) => string
  onApprove: (instanceId: number) => void
  onReject: (instanceId: number) => void
  onCancel: (id: number) => void
  isApproving: boolean
  isRejecting: boolean
  isCancelling: boolean
}

function RequestRow({
  request,
  onApprove,
  onReject,
  onCancel,
  isApproving,
  isRejecting,
  isCancelling,
}: RequestRowProps) {
  const isPending = request.status === 'pending'
  const instanceId = request.workflow_instance_id

  return (
    <TableRow>
      <TableCell className="truncate">
        <p className="font-medium text-foreground">{request.user?.name ?? `#${request.user_id}`}</p>
        {request.user?.job_title && (
          <p className="text-xs text-foreground-muted">{request.user.job_title}</p>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-sm">
        {formatDate(request.start_date)} — {formatDate(request.end_date)}
      </TableCell>
      <TableCell className="text-sm">{request.requested_days}</TableCell>
      <TableCell>
        <StatusBadge status={request.status} label={request.status_label} />
      </TableCell>
      <TableCell className="text-sm text-foreground-muted">
        {request.workflow_instance?.current_step?.name ?? '—'}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          {isPending && instanceId && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isApproving}
                onClick={() => onApprove(instanceId)}
              >
                Aprovar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isRejecting}
                onClick={() => onReject(instanceId)}
              >
                Reprovar
              </Button>
            </>
          )}
          {isPending && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isCancelling}
              onClick={() => onCancel(request.id)}
            >
              Cancelar
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
