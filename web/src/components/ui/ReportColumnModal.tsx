import { useEffect, useId, useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from './Button'
import type { ReportType } from '../../lib/reportColumns'
import { REPORT_COLUMNS } from '../../lib/reportColumns'

type ReportColumnModalProps = {
  open: boolean
  reportType: ReportType
  savedColumns: string[]
  onExport: (selectedColumns: string[]) => void
  onCancel: () => void
}

export function ReportColumnModal({
  open,
  reportType,
  savedColumns,
  onExport,
  onCancel,
}: ReportColumnModalProps) {
  const titleId = useId()
  const [selected, setSelected] = useState<Set<string>>(new Set(savedColumns))

  useEffect(() => {
    if (open) {
      setSelected(new Set(savedColumns))
    }
  }, [open, savedColumns])

  const columns = REPORT_COLUMNS[reportType]

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size > 1) next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  function handleExport() {
    onExport(Array.from(selected))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-70 flex items-end justify-center p-4 sm:items-center" role="presentation">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-foreground/30"
        onClick={onCancel}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md rounded-lg bg-surface p-5 shadow-overlay sm:p-6"
      >
        <h2 id={titleId} className="text-base font-semibold text-foreground sm:text-lg">
          Colunas do relatório
        </h2>
        <p className="mt-1 text-sm text-foreground-muted">
          Selecione as colunas que deseja incluir na exportação.
        </p>

        <div className="mt-4 space-y-0.5">
          {columns.map((col) => {
            const isSelected = selected.has(col.key)
            return (
              <label
                key={col.key}
                onClick={() => toggle(col.key)}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-surface-sunken"
              >
                <div
                  className={`flex size-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-surface-sunken bg-surface'
                  }`}
                >
                  {isSelected && <Check className="size-3.5" aria-hidden />}
                </div>
                <span className="text-sm text-foreground">{col.label}</span>
              </label>
            )
          })}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleExport}>
            Exportar
          </Button>
        </div>
      </div>
    </div>
  )
}
