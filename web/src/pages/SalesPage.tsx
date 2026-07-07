import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'
import { approveInstance, rejectInstance } from '../services/workflowService'
import { createSale, listEnterprises, listSales, payCommission } from '../services/commissionService'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { DatePicker } from '../components/ui/DatePicker'
import { Input } from '../components/ui/Input'
import { PageHeader } from '../components/ui/PageHeader'
import { SearchSelect } from '../components/ui/SearchSelect'
import { Textarea } from '../components/ui/Textarea'
import { WorkflowKanban } from '../components/workflow/WorkflowKanban'
import type { WorkflowInstanceStatus, WorkflowType } from '../types/workflow'

export function SalesPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [enterpriseId, setEnterpriseId] = useState<number | null>(null)
  const [unit, setUnit] = useState('')
  const [saleDate, setSaleDate] = useState('')
  const [saleAmount, setSaleAmount] = useState(0)
  const [percentage, setPercentage] = useState('')
  const [notes, setNotes] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formError, setFormError] = useState('')

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: listSales,
    refetchInterval: 10_000,
    placeholderData: keepPreviousData,
  })

  const searchEnterprises = useCallback(async (query: string) => {
    const enterprises = await listEnterprises()
    const normalizedQuery = query
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    return enterprises
      .filter((e) => {
        if (query.trim() === '') return true
        return e.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalizedQuery)
      })
      .map((e) => ({ value: e.id, label: e.name }))
  }, [])

  const createMutation = useMutation({
    mutationFn: () =>
      createSale({
        enterprise_id: enterpriseId!,
        unit,
        sale_date: saleDate,
        sale_amount: saleAmount,
        percentage: parseFloat(percentage),
        notes: notes || undefined,
        invoice_number: invoiceNumber || undefined,
        invoice_file: invoiceFile || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      setShowForm(false)
      setEnterpriseId(null)
      setUnit('')
      setSaleDate('')
      setSaleAmount(0)
      setPercentage('')
      setNotes('')
      setInvoiceNumber('')
      setInvoiceFile(null)
      setFormError('')
    },
    onError: (err: any) => {
      setFormError(err?.errors?.enterprise_id?.[0] || err?.errors?.sale_amount?.[0] || 'Erro ao registrar venda.')
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
      title: `${s.enterprise?.name ?? '—'} / ${s.unit}`,
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
              <SearchSelect
                label="Empreendimento"
                value={enterpriseId}
                onChange={setEnterpriseId}
                onSearch={searchEnterprises}
                placeholder="Selecione o empreendimento"
                searchPlaceholder="Buscar empreendimento..."
                emptyMessage="Digite para buscar empreendimentos."
                noResultsMessage="Nenhum empreendimento encontrado."
                clearLabel="Limpar"
              />
              <Input label="Unidade" value={unit} onChange={(e) => setUnit(e.target.value)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <DatePicker label="Data da venda" value={saleDate} onChange={setSaleDate} />
              <CurrencyInput label="Valor da venda" value={saleAmount} onChange={setSaleAmount} />
              <Input label="Comissão (%)" type="number" step="0.01" min="0" max="100" value={percentage} onChange={(e) => setPercentage(e.target.value)} />
            </div>

            {saleAmount > 0 && percentage && (
              <p className="text-sm text-foreground-muted">
                Valor da comissão:{' '}
                <span className="font-medium text-foreground">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    saleAmount * (parseFloat(percentage) || 0) / 100,
                  )}
                </span>
              </p>
            )}

            <Textarea label="Observações (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Número da NF" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="Opcional" />
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground-muted">Upload da NF</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setInvoiceFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-foreground-muted file:mr-3 file:rounded-md file:border-0 file:bg-surface-sunken file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-surface"
                />
                {invoiceFile && (
                  <p className="mt-1 text-xs text-foreground-muted">{invoiceFile.name}</p>
                )}
              </div>
            </div>

            {formError && <p className="text-sm text-danger">{formError}</p>}

            <Button
              variant="primary"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !enterpriseId || !unit || !saleDate || !saleAmount || !percentage}
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
                    {sale.enterprise?.name ?? '—'} / {sale.unit}
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
