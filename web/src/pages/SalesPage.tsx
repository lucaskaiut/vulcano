import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { useState } from 'react'
import { approveInstance, rejectInstance } from '../services/workflowService'
import { createSale, listSales, payCommission } from '../services/commissionService'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { DatePicker } from '../components/ui/DatePicker'
import { Input } from '../components/ui/Input'
import { PageHeader } from '../components/ui/PageHeader'
import { Textarea } from '../components/ui/Textarea'
import { WorkflowKanban } from '../components/workflow/WorkflowKanban'
import type { WorkflowInstanceStatus, WorkflowType } from '../types/workflow'

export function SalesPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [developmentName, setDevelopmentName] = useState('')
  const [unit, setUnit] = useState('')
  const [saleDate, setSaleDate] = useState('')
  const [saleAmount, setSaleAmount] = useState('')
  const [percentage, setPercentage] = useState('')
  const [notes, setNotes] = useState('')
  const [formError, setFormError] = useState('')

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: listSales,
    refetchInterval: 10_000,
    placeholderData: keepPreviousData,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createSale({
        development_name: developmentName,
        unit,
        sale_date: saleDate,
        sale_amount: parseFloat(saleAmount),
        percentage: parseFloat(percentage),
        notes: notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      setShowForm(false)
      setDevelopmentName('')
      setUnit('')
      setSaleDate('')
      setSaleAmount('')
      setPercentage('')
      setNotes('')
      setFormError('')
    },
    onError: (err: any) => {
      setFormError(err?.errors?.development_name?.[0] || err?.errors?.sale_amount?.[0] || 'Erro ao registrar venda.')
    },
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => approveInstance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['workflow-instances'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) => rejectInstance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['workflow-instances'] })
    },
  })

  const payMutation = useMutation({
    mutationFn: (commissionId: number) => payCommission(commissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
    },
  })

  const kanbanInstances = sales
    .filter((s) => s.commission?.workflow_instance)
    .map((s) => ({
      id: s.commission!.workflow_instance!.id,
      workflow_type: 'commission' as WorkflowType,
      title: `${s.development_name} / ${s.unit}`,
      status: s.commission!.workflow_instance!.status as WorkflowInstanceStatus,
      status_label: s.commission!.workflow_instance!.status_label,
      current_step: s.commission!.workflow_instance!.current_step
        ? {
            id: s.commission!.workflow_instance!.current_step.id,
            name: s.commission!.workflow_instance!.current_step.name,
            workflow_type: 'commission' as WorkflowType,
            order: s.commission!.workflow_instance!.current_step.order,
            created_at: '',
            updated_at: '',
            responsible_role: s.commission!.workflow_instance!.current_step.responsible_role,
            responsible_user: s.commission!.workflow_instance!.current_step.responsible_user,
          }
        : null,
      initiated_by: { id: s.user.id, name: s.user.name },
      histories: [],
      created_at: s.created_at,
      updated_at: s.created_at,
    }))

  const approvedUnpaid = sales.filter(
    (s) => s.commission?.status === 'approved',
  )

  return (
    <>
      <PageHeader
        title="Comissões"
        action={
          <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Registrar venda'}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="text-left">
            <CardTitle>Registrar venda</CardTitle>
          </CardHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Empreendimento" value={developmentName} onChange={(e) => setDevelopmentName(e.target.value)} />
              <Input label="Unidade" value={unit} onChange={(e) => setUnit(e.target.value)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <DatePicker label="Data da venda" value={saleDate} onChange={setSaleDate} />
              <Input label="Valor da venda (R$)" type="number" step="0.01" min="0" value={saleAmount} onChange={(e) => setSaleAmount(e.target.value)} />
              <Input label="Comissão (%)" type="number" step="0.01" min="0" max="100" value={percentage} onChange={(e) => setPercentage(e.target.value)} />
            </div>

            {saleAmount && percentage && (
              <p className="text-sm text-foreground-muted">
                Valor da comissão:{' '}
                <span className="font-medium text-foreground">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    (parseFloat(saleAmount) || 0) * (parseFloat(percentage) || 0) / 100,
                  )}
                </span>
              </p>
            )}

            <Textarea label="Observações (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

            {formError && <p className="text-sm text-danger">{formError}</p>}

            <Button
              variant="primary"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !developmentName || !unit || !saleDate || !saleAmount || !percentage}
            >
              {createMutation.isPending ? 'Registrando...' : 'Registrar venda'}
            </Button>
          </div>
        </Card>
      )}

      {approvedUnpaid.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="text-left">
            <CardTitle>Comissões aprovadas — aguardando pagamento</CardTitle>
          </CardHeader>

          <div className="space-y-2">
            {approvedUnpaid.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between rounded-lg bg-surface-sunken p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {sale.development_name} / {sale.unit}
                  </p>
                  <p className="text-xs text-foreground-muted">
                    {sale.user.name} — {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(sale.commission_amount))}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => sale.commission && payMutation.mutate(sale.commission.id)}
                  disabled={payMutation.isPending}
                >
                  Marcar como paga
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {isLoading ? (
        <p className="py-8 text-center text-sm text-foreground-muted">Carregando...</p>
      ) : (
        <WorkflowKanban
          type="commission"
          instances={kanbanInstances}
          onApprove={(id) => approveMutation.mutate(id)}
          onReject={(id) => rejectMutation.mutate(id)}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['sales'] })}
        />
      )}
    </>
  )
}
