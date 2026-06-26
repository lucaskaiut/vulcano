import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { listUserInvoices, getInvoiceDownloadUrl } from '../../services/invoiceService'
import { formatDate } from '../../lib/format'
import { usePermissions } from '../../hooks/usePermissions'

function currency(value: number | string): string {
  const v = typeof value === 'string' ? Number(value) : value
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Reprovada',
}

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-danger/10 text-danger',
}

type UserInvoicesSectionProps = {
  userId: number
}

export function UserInvoicesSection({ userId }: UserInvoicesSectionProps) {
  const { can } = usePermissions()
  const canView = can('invoices.view')

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['users', userId, 'invoices'],
    queryFn: () => listUserInvoices(userId),
    enabled: canView,
  })

  if (!canView) return null

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Notas Fiscais</h2>
        <p className="mt-1 text-sm text-foreground-muted">
          {invoices.length} nota{invoices.length !== 1 ? 's' : ''} fiscal{invoices.length !== 1 ? 's' : ''} enviada{invoices.length !== 1 ? 's' : ''}
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-foreground-muted">Carregando notas fiscais...</p>
      ) : invoices.length === 0 ? (
        <div className="rounded-lg border border-dashed border-surface-sunken px-4 py-6 text-center">
          <p className="text-sm text-foreground-muted">Nenhuma nota fiscal enviada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map((invoice) => (
            <article key={invoice.id} className="flex items-center justify-between rounded-lg border border-surface-sunken bg-surface p-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    NF {invoice.invoice_number}
                  </p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[invoice.status] ?? STATUS_CLASSES.pending}`}>
                    {STATUS_LABELS[invoice.status] ?? invoice.status}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-foreground-muted">
                  Competência {invoice.competence} — {currency(invoice.amount)} — {formatDate(invoice.issue_date)}
                </p>
              </div>
              <a
                href={getInvoiceDownloadUrl(invoice.id)}
                download
                className="ml-3 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-foreground-muted transition-colors hover:bg-surface-sunken hover:text-foreground"
                title={`Download NF ${invoice.invoice_number}`}
              >
                <Download className="size-4" aria-hidden />
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
