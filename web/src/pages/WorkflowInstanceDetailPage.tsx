import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  approveInstance,
  cancelInstance,
  getInstance,
  rejectInstance,
  WORKFLOW_TYPE_LABELS,
} from '../services/workflowService'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { Textarea } from '../components/ui/Textarea'
import { WorkflowStatusBadge } from '../components/workflow/WorkflowStatusBadge'
import { WorkflowHistoryTimeline } from '../components/workflow/WorkflowHistoryTimeline'
import type { WorkflowType } from '../types/workflow'

function formatDate(iso?: string | null): string {
  if (!iso) return '-'

  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function WorkflowInstanceDetailPage() {
  const { id } = useParams({ strict: false })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [actionModal, setActionModal] = useState<
    { type: 'approve' | 'reject' | 'cancel' } | false
  >(false)
  const [notes, setNotes] = useState('')
  const [actionError, setActionError] = useState('')

  const { data: instance, isLoading } = useQuery({
    queryKey: ['workflow-instance', id],
    queryFn: () => getInstance(Number(id)),
  })

  const approveMutation = useMutation({
    mutationFn: () => approveInstance(Number(id), notes || null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-instance', id] })
      queryClient.invalidateQueries({ queryKey: ['workflow-instances'] })
      setActionModal(false)
      setNotes('')
      setActionError('')
    },
    onError: (err: any) => {
      setActionError(
        err?.errors?.approver?.[0] ||
          err?.errors?.status?.[0] ||
          'Erro ao executar ação.',
      )
    },
  })

  const rejectMutation = useMutation({
    mutationFn: () => rejectInstance(Number(id), notes || null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-instance', id] })
      queryClient.invalidateQueries({ queryKey: ['workflow-instances'] })
      setActionModal(false)
      setNotes('')
      setActionError('')
    },
    onError: (err: any) => {
      setActionError(
        err?.errors?.approver?.[0] ||
          err?.errors?.status?.[0] ||
          'Erro ao executar ação.',
      )
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelInstance(Number(id), notes || null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-instance', id] })
      queryClient.invalidateQueries({ queryKey: ['workflow-instances'] })
      setActionModal(false)
      setNotes('')
      setActionError('')
    },
    onError: (err: any) => {
      setActionError(err?.errors?.status?.[0] || 'Erro ao executar ação.')
    },
  })

  function handleActionConfirm() {
    if (!actionModal) return

    switch (actionModal.type) {
      case 'approve':
        approveMutation.mutate()
        break
      case 'reject':
        rejectMutation.mutate()
        break
      case 'cancel':
        cancelMutation.mutate()
        break
    }
  }

  function getModalInfo() {
    if (!actionModal) return { title: '', description: '', confirmLabel: '' }

    switch (actionModal.type) {
      case 'approve':
        return {
          title: 'Aprovar etapa',
          description: 'Confirme a aprovação da etapa atual.',
          confirmLabel: 'Aprovar',
        }
      case 'reject':
        return {
          title: 'Reprovar processo',
          description: 'Tem certeza que deseja reprovar este processo?',
          confirmLabel: 'Reprovar',
        }
      case 'cancel':
        return {
          title: 'Cancelar processo',
          description: 'Tem certeza que deseja cancelar este processo?',
          confirmLabel: 'Cancelar',
        }
    }
  }

  const modalInfo = getModalInfo()
  const isActionLoading =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    cancelMutation.isPending

  if (isLoading) {
    return (
      <div className="py-8 text-center text-sm text-foreground-muted">
        Carregando...
      </div>
    )
  }

  if (!instance) {
    return (
      <div className="py-8 text-center text-sm text-foreground-muted">
        Processo não encontrado.
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title={instance.title}
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/workflow-instances' })}
          >
            Voltar
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="text-left">
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-foreground-muted">Status</dt>
                <dd className="text-sm font-medium text-foreground">
                  <WorkflowStatusBadge status={instance.status} />
                </dd>
              </div>
              <div>
                <dt className="text-sm text-foreground-muted">Tipo</dt>
                <dd className="text-sm font-medium text-foreground">
                  {WORKFLOW_TYPE_LABELS[instance.workflow_type as WorkflowType] ?? instance.workflow_type}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-foreground-muted">Solicitante</dt>
                <dd className="text-sm font-medium text-foreground">
                  {instance.initiated_by?.name ?? '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-foreground-muted">Etapa atual</dt>
                <dd className="text-sm font-medium text-foreground">
                  {instance.current_step?.name ?? '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-foreground-muted">Data de início</dt>
                <dd className="text-sm font-medium text-foreground">
                  {formatDate(instance.created_at)}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader className="text-left">
              <CardTitle>Histórico</CardTitle>
            </CardHeader>
            <WorkflowHistoryTimeline histories={instance.histories} />
          </Card>
        </div>

        <div>
          {instance.status === 'in_progress' && (
            <Card>
              <CardHeader className="text-left">
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <div className="flex flex-col gap-2">
                <Button
                  variant="primary"
                  onClick={() => {
                    setActionError('')
                    setNotes('')
                    setActionModal({ type: 'approve' })
                  }}
                >
                  Aprovar
                </Button>
                <Button
                  variant="ghost"
                  className="text-danger"
                  onClick={() => {
                    setActionError('')
                    setNotes('')
                    setActionModal({ type: 'reject' })
                  }}
                >
                  Reprovar
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setActionError('')
                    setNotes('')
                    setActionModal({ type: 'cancel' })
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {actionModal && (
        <div>
          <ConfirmModal
            open={true}
            title={modalInfo.title}
            description={modalInfo.description}
            confirmLabel={modalInfo.confirmLabel}
            isLoading={isActionLoading}
            onConfirm={handleActionConfirm}
            onCancel={() => {
              setActionModal(false)
              setNotes('')
              setActionError('')
            }}
          />
          <div className="mt-3 flex justify-center">
            <div className="w-full max-w-md">
              <Textarea
                label="Observação (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione uma observação..."
              />
              {actionError && (
                <p className="mt-1.5 text-sm text-danger">{actionError}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
