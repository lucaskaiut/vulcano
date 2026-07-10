import { Download, ExternalLink, FileText, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { Sale } from '../../types/commission'
import { getInvoiceDownloadUrl } from '../../services/commissionService'
import { formatDate, formatDateTime } from '../../lib/format'

type SaleDetailModalProps = {
  open: boolean
  sale: Sale | null
  onClose: () => void
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'bg-warning-muted text-warning' },
  approved: { label: 'Aprovada', className: 'bg-success-muted text-success' },
  rejected: { label: 'Rejeitada', className: 'bg-danger/10 text-danger' },
  paid: { label: 'Paga', className: 'bg-primary-muted text-primary' },
}

export function SaleDetailModal({ open, sale, onClose }: SaleDetailModalProps) {
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [invoicePreviewUrl, setInvoicePreviewUrl] = useState<string | null>(null)
  const [invoiceError, setInvoiceError] = useState(false)

  useEffect(() => {
    if (!open) return

    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open || !sale?.invoice_file_name) {
      setInvoicePreviewUrl(null)
      setInvoiceError(false)
      return
    }

    let cancelled = false
    const objectUrl = window.URL || window.webkitURL

    fetch(getInvoiceDownloadUrl(sale.id), { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar')
        return res.blob()
      })
      .then((blob) => {
        if (!cancelled) setInvoicePreviewUrl(objectUrl.createObjectURL(blob))
      })
      .catch(() => {
        if (!cancelled) setInvoiceError(true)
      })

    return () => {
      cancelled = true
      if (invoicePreviewUrl) objectUrl.revokeObjectURL(invoicePreviewUrl)
    }
  }, [open, sale?.id])

  if (!open || !sale) return null

  const downloadUrl = sale.invoice_file_name ? getInvoiceDownloadUrl(sale.id) : null
  const fileName = sale.invoice_file_name ?? ''
  const extension = fileName.split('.').pop()?.toLowerCase() ?? ''
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)
  const isPdf = extension === 'pdf'
  const hasInvoice = !!sale.invoice_file_name
  const status = sale.commission?.status ?? 'pending'
  const currency = (v: number | string) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v))

  return (
    <div className="fixed inset-0 z-70 flex items-end justify-center p-4 sm:items-center" role="presentation">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-foreground/30"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface shadow-overlay sm:rounded-3xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-surface-sunken bg-surface/95 p-5 backdrop-blur-sm sm:p-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 id={titleId} className="text-lg font-semibold text-foreground">
                Detalhes da Comissão
              </h2>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig[status]?.className ?? ''}`}>
                {statusConfig[status]?.label ?? status}
              </span>
            </div>
            <p className="mt-1 text-sm text-foreground-muted">
              Venda #{sale.id} &middot; {formatDate(sale.sale_date)}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-surface-sunken hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {/* Summary Cards */}
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            <SummaryCard label="Valor da venda" value={currency(sale.sale_amount)} />
            <SummaryCard label="Comissão" value={currency(sale.commission_amount)} />
            <SummaryCard label="Percentual" value={`${Number(sale.percentage)}%`} />
            <SummaryCard
              label="NF"
              value={sale.invoice_number ? `#${sale.invoice_number}` : '—'}
              muted={!sale.invoice_number}
            />
          </div>

          {/* Dados da Venda */}
          <div className="mt-6">
            <SectionTitle>Dados da venda</SectionTitle>
            <div className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              <InfoField label="Empreendimento" value={sale.enterprise?.name ?? '—'} />
              <InfoField label="Unidade" value={sale.unit} />
              <InfoField label="Colaborador" value={sale.user.name} />
              <InfoField label="Data da venda" value={formatDate(sale.sale_date)} />
            </div>
          </div>

          {/* Observações */}
          {sale.notes && (
            <div className="mt-6">
              <SectionTitle>Observações</SectionTitle>
              <div className="mt-3 rounded-xl bg-surface-sunken p-4">
                <p className="text-sm leading-relaxed text-foreground">{sale.notes}</p>
              </div>
            </div>
          )}

          {/* Documento Fiscal */}
          {hasInvoice && (
            <div className="mt-6">
              <SectionTitle>Documento fiscal</SectionTitle>
              <div className="mt-3 rounded-xl bg-surface-sunken p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-danger/10">
                    <FileText className="size-5 text-danger" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{fileName}</p>
                    <p className="text-xs text-foreground-muted">
                      {extension.toUpperCase()} &middot; Enviado em {formatDateTime(sale.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {invoicePreviewUrl && isImage && (
                <div className="mt-3 overflow-hidden rounded-xl bg-surface-sunken">
                  <img
                    src={invoicePreviewUrl}
                    alt={fileName}
                    className="max-h-96 w-full object-contain"
                  />
                </div>
              )}

              {invoicePreviewUrl && isPdf && (
                <div className="mt-3 overflow-hidden rounded-xl bg-surface-sunken">
                  <iframe
                    src={invoicePreviewUrl}
                    title={fileName}
                    className="h-[400px] w-full"
                  />
                </div>
              )}

              {invoiceError && !isImage && !isPdf && (
                <p className="mt-3 text-sm text-foreground-muted">
                  Pré-visualização não disponível para este formato.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {hasInvoice && (
          <div className="sticky bottom-0 flex gap-2 border-t border-surface-sunken bg-surface/95 p-5 backdrop-blur-sm sm:p-6">
            <a
              href={downloadUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:brightness-95"
            >
              <ExternalLink className="size-4" />
              Visualizar documento
            </a>
            <a
              href={downloadUrl!}
              download={fileName}
              className="inline-flex items-center gap-2 rounded-xl bg-surface-sunken px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              <Download className="size-4" />
              Download PDF
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-xl bg-surface-sunken p-4">
      <p className="text-xs font-medium text-foreground-muted">{label}</p>
      <p className={`mt-1 text-lg font-bold tracking-tight ${muted ? 'text-foreground-muted' : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3">
      <h3 className="text-sm font-semibold text-foreground">{children}</h3>
      <div className="h-px flex-1 bg-surface-sunken" />
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-foreground-muted">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
