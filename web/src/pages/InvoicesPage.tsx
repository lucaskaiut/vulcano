import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { useState } from 'react'
import { approveInstance, rejectInstance } from '../services/workflowService'
import { createInvoice, getInvoiceDownloadUrl, listInvoices } from '../services/invoiceService'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { DatePicker } from '../components/ui/DatePicker'
import { Input } from '../components/ui/Input'
import { PageHeader } from '../components/ui/PageHeader'
import { WorkflowKanban } from '../components/workflow/WorkflowKanban'
import { formatDate } from '../lib/format'
import type { WorkflowInstanceStatus, WorkflowType } from '../types/workflow'
import type { Invoice } from '../types/invoice'
import { useAuth } from '../contexts/AuthContext'

function mapToKanban(invoice: Invoice) {
  if (!invoice.workflow_instance) return null
  return {
    id: invoice.workflow_instance.id,
    workflow_type: 'invoice' as WorkflowType,
    title: `${invoice.user?.name ?? '—'} — NF ${invoice.invoice_number} — ${invoice.competence}`,
    status: invoice.workflow_instance.status as WorkflowInstanceStatus,
    status_label: invoice.workflow_instance.status_label,
    current_step: invoice.workflow_instance.current_step
      ? {
          id: invoice.workflow_instance.current_step.id,
          name: invoice.workflow_instance.current_step.name,
          workflow_type: 'invoice' as WorkflowType,
          order: invoice.workflow_instance.current_step.order,
          created_at: '',
          updated_at: '',
          responsible_role: invoice.workflow_instance.current_step.responsible_role,
          responsible_user: invoice.workflow_instance.current_step.responsible_user,
        }
      : null,
    initiated_by: invoice.user ?? { id: 0, name: '—' },
    histories: [],
    created_at: invoice.created_at,
    updated_at: invoice.created_at,
  }
}

function currency(value: number | string): string {
  const v = typeof value === 'string' ? Number(value) : value
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function InvoicesPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [competence, setCompetence] = useState(new Date().toISOString().slice(0, 7))
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [formError, setFormError] = useState('')

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: listInvoices,
    refetchInterval: 10_000,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createInvoice({
        competence,
        invoice_number: invoiceNumber,
        amount: parseFloat(amount),
        issue_date: issueDate,
        file: file!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['workflow-instances'] })
      setShowForm(false)
      setCompetence(new Date().toISOString().slice(0, 7))
      setInvoiceNumber('')
      setAmount('')
      setIssueDate('')
      setFile(null)
      setFormError('')
    },
    onError: (err: any) => {
      setFormError(err?.message ?? 'Erro ao enviar nota fiscal.')
    },
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => approveInstance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['workflow-instances'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) => rejectInstance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['workflow-instances'] })
    },
  })

  const kanbanInstances = invoices
    .map(mapToKanban)
    .filter((i): i is NonNullable<ReturnType<typeof mapToKanban>> => i !== null)

  return (
    <>
      <PageHeader
        title="Notas Fiscais"
        action={
          <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Enviar nota fiscal'}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6">
          <CardHeader className="text-left">
            <CardTitle>Enviar nota fiscal</CardTitle>
          </CardHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Competência (AAAA-MM)"
                placeholder="2026-06"
                value={competence}
                onChange={(e) => setCompetence(e.target.value)}
              />
              <Input
                label="Número da nota"
                placeholder="NF-12345"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Valor (R$)"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <DatePicker label="Data de emissão" value={issueDate} onChange={setIssueDate} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Arquivo da nota</label>
              {file ? (
                <div className="flex items-center gap-3 rounded-lg border border-surface-sunken bg-surface p-3">
                  <span className="text-sm font-medium text-foreground">{file.name}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)}>
                    Trocar
                  </Button>
                </div>
              ) : (
                <div className="relative rounded-lg border-2 border-dashed border-surface-sunken p-6 text-center hover:border-foreground-subtle">
                  <input
                    type="file"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <p className="text-sm font-medium text-foreground">Arraste o arquivo ou clique para selecionar</p>
                  <p className="mt-1 text-xs text-foreground-subtle">PDF, Imagens até 10 MB</p>
                </div>
              )}
            </div>

            {formError && <p className="text-sm text-danger">{formError}</p>}

            <Button
              variant="primary"
              onClick={() => createMutation.mutate()}
              disabled={
                createMutation.isPending ||
                !competence ||
                !invoiceNumber ||
                !amount ||
                !issueDate ||
                !file
              }
            >
              {createMutation.isPending ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <p className="py-8 text-center text-sm text-foreground-muted">Carregando...</p>
      ) : (
        <WorkflowKanban
          type="invoice"
          instances={kanbanInstances}
          onApprove={(id) => approveMutation.mutate(id)}
          onReject={(id) => rejectMutation.mutate(id)}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ['invoices'] })}
          getDownloadUrl={(instanceId) => {
            const inv = invoices.find((i) => i.workflow_instance?.id === instanceId)
            return inv ? getInvoiceDownloadUrl(inv.id) : null
          }}
        />
      )}
    </>
  )
}
