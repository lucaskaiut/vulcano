import { Download, ExternalLink, FileText, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { Sale } from '../../types/commission'
import { getInvoiceDownloadUrl } from '../../services/commissionService'
import { formatDate } from '../../lib/format'

type SaleDetailModalProps = {
  open: boolean
  sale: Sale | null
  onClose: () => void
}

export function SaleDetailModal({ open, sale, onClose }: SaleDetailModalProps) {
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [invoicePreviewUrl, setInvoicePreviewUrl] = useState<string | null>(null)
  const [invoiceError, setInvoiceError] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
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
        if (!cancelled) {
          setInvoicePreviewUrl(objectUrl.createObjectURL(blob))
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInvoiceError(true)
        }
      })

    return () => {
      cancelled = true
      if (invoicePreviewUrl) {
        objectUrl.revokeObjectURL(invoicePreviewUrl)
      }
    }
  }, [open, sale?.id])

  if (!open || !sale) return null

  const downloadUrl = getInvoiceDownloadUrl(sale.id)
  const fileName = sale.invoice_file_name ?? ''
  const extension = fileName.split('.').pop()?.toLowerCase() ?? ''
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)
  const isPdf = extension === 'pdf'
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
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-lg bg-surface p-5 shadow-overlay sm:p-6"
      >
        <div className="flex items-start justify-between">
          <h2 id={titleId} className="text-base font-semibold text-foreground">
            Detalhes da venda
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="rounded-md p-1 text-foreground-muted hover:bg-surface-sunken hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoField label="Empreendimento" value={sale.enterprise?.name ?? '—'} />
            <InfoField label="Unidade" value={sale.unit} />
            <InfoField label="Colaborador" value={sale.user.name} />
            <InfoField label="Data da venda" value={formatDate(sale.sale_date)} />
            <InfoField label="Valor da venda" value={currency(sale.sale_amount)} />
            <InfoField label="Comissão" value={`${Number(sale.percentage)}%`} />
            <InfoField label="Valor da comissão" value={currency(sale.commission_amount)} />
            {sale.invoice_number && (
              <InfoField label="Número da NF" value={sale.invoice_number} />
            )}
          </div>

          {sale.notes && (
            <div>
              <p className="text-xs font-medium text-foreground-muted">Observações</p>
              <p className="mt-0.5 text-sm text-foreground">{sale.notes}</p>
            </div>
          )}

          {sale.invoice_file_name && (
            <div>
              <p className="text-xs font-medium text-foreground-muted">Nota fiscal</p>
              <div className="mt-1 flex items-center gap-2">
                <FileText className="size-4 text-foreground-subtle" aria-hidden />
                <span className="text-sm text-foreground">{sale.invoice_file_name}</span>
              </div>

              <div className="mt-3 space-y-3">
                {invoicePreviewUrl && isImage && (
                  <img
                    src={invoicePreviewUrl}
                    alt={sale.invoice_file_name}
                    className="max-h-96 w-full rounded-lg border border-surface-sunken object-contain"
                  />
                )}

                {invoicePreviewUrl && isPdf && (
                  <iframe
                    src={invoicePreviewUrl}
                    title={sale.invoice_file_name}
                    className="h-96 w-full rounded-lg border border-surface-sunken"
                  />
                )}

                {invoiceError && !isImage && !isPdf && (
                  <p className="text-sm text-foreground-muted">Pré-visualização não disponível para este formato.</p>
                )}

                <div className="flex gap-2">
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-surface-sunken px-3 py-1.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface hover:text-foreground"
                  >
                    <ExternalLink className="size-3.5" aria-hidden />
                    Visualizar
                  </a>
                  <a
                    href={downloadUrl}
                    download={sale.invoice_file_name}
                    className="inline-flex items-center gap-1.5 rounded-md bg-surface-sunken px-3 py-1.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface hover:text-foreground"
                  >
                    <Download className="size-3.5" aria-hidden />
                    Download
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-foreground-muted">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  )
}
