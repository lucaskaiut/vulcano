import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  approveInstance,
  rejectInstance,
} from '../services/workflowService'
import {
  cancelVacationRequest,
  createVacationRequest,
  listVacationRequests,
} from '../services/vacationService'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { DatePicker } from '../components/ui/DatePicker'
import { Input } from '../components/ui/Input'
import { PageHeader } from '../components/ui/PageHeader'
import { WorkflowKanban } from '../components/workflow/WorkflowKanban'
import { WORKFLOW_TYPE_LABELS } from '../services/workflowService'
import type { WorkflowInstanceStatus, WorkflowType } from '../types/workflow'

export function VacationRequestsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [justification, setJustification] = useState('')
  const [formError, setFormError] = useState('')
  const [rejectTarget, setRejectTarget] = useState<number | null>(null)
  const [cancelTarget, setCancelTarget] = useState<number | null>(null)

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['vacation-requests'],
    queryFn: listVacationRequests,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createVacationRequest({
        start_date: startDate,
        end_date: endDate,
        justification: justification || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacation-requests'] })
      setShowForm(false)
      setStartDate('')
      setEndDate('')
      setJustification('')
      setFormError('')
    },
    onError: (err: any) => {
      setFormError(
        err?.errors?.start_date?.[0] ||
          err?.errors?.end_date?.[0] ||
          'Erro ao criar solicitação.',
      )
    },
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => approveInstance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacation-requests'] })
      queryClient.invalidateQueries({ queryKey: ['workflow-instances'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) => rejectInstance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacation-requests'] })
      queryClient.invalidateQueries({ queryKey: ['workflow-instances'] })
      setRejectTarget(null)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => cancelVacationRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacation-requests'] })
      setCancelTarget(null)
    },
  })

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['vacation-requests'] })
  }

  const kanbanInstances = requests
    .filter((r) => r.workflow_instance)
    .map((r) => ({
      id: r.workflow_instance!.id,
      workflow_type: 'vacation_request' as WorkflowType,
      title: `${r.user.name} — ${r.start_date} a ${r.end_date}`,
      status: r.workflow_instance!.status as WorkflowInstanceStatus,
      status_label: r.workflow_instance!.status_label,
      current_step: r.workflow_instance!.current_step
        ? {
            id: r.workflow_instance!.current_step.id,
            name: r.workflow_instance!.current_step.name,
            workflow_type: 'vacation_request' as WorkflowType,
            order: r.workflow_instance!.current_step.order,
            created_at: '',
            updated_at: '',
            responsible_role: r.workflow_instance!.current_step.responsible_role,
            responsible_user: r.workflow_instance!.current_step.responsible_user,
          }
        : null,
      initiated_by: { id: r.user.id, name: r.user.name },
      histories: [],
      created_at: r.created_at,
      updated_at: r.updated_at,
    }))

  return (
    <>
      <PageHeader
        title="Solicitações de Férias"
        action={
          <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Solicitar férias'}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="text-left">
            <CardTitle>Nova solicitação</CardTitle>
          </CardHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <DatePicker
                label="Data de início"
                value={startDate}
                onChange={setStartDate}
              />
              <DatePicker
                label="Data de término"
                value={endDate}
                onChange={setEndDate}
              />
            </div>

            <Input
              label="Justificativa (opcional)"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Ex: Férias programadas"
            />

            {formError && (
              <p className="text-sm text-danger">{formError}</p>
            )}

            <Button
              variant="primary"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !startDate || !endDate}
            >
              {createMutation.isPending ? 'Enviando...' : 'Enviar solicitação'}
            </Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <p className="py-8 text-center text-sm text-foreground-muted">
          Carregando...
        </p>
      ) : (
        <WorkflowKanban
          type="vacation_request"
          instances={kanbanInstances}
          onApprove={(instanceId) => approveMutation.mutate(instanceId)}
          onReject={(instanceId) => {
            const req = requests.find((r) => r.workflow_instance?.id === instanceId)
            if (req) setRejectTarget(req.id)
          }}
          onRefresh={refresh}
        />
      )}

      <ConfirmModal
        open={rejectTarget !== null}
        title="Reprovar solicitação"
        description="Tem certeza que deseja reprovar esta solicitação de férias?"
        confirmLabel="Reprovar"
        isLoading={rejectMutation.isPending}
        onConfirm={() => {
          if (rejectTarget !== null) {
            const req = requests.find((r) => r.id === rejectTarget)
            if (req?.workflow_instance) {
              rejectMutation.mutate(req.workflow_instance.id)
            }
          }
        }}
        onCancel={() => setRejectTarget(null)}
      />

      <ConfirmModal
        open={cancelTarget !== null}
        title="Cancelar solicitação"
        description="Tem certeza que deseja cancelar esta solicitação de férias?"
        confirmLabel="Cancelar"
        isLoading={cancelMutation.isPending}
        onConfirm={() => {
          if (cancelTarget !== null) {
            cancelMutation.mutate(cancelTarget)
          }
        }}
        onCancel={() => setCancelTarget(null)}
      />
    </>
  )
}
