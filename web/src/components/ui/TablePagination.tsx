import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginatedMeta } from '../../types/acl'
import type { AllowedPerPage } from '../../types/preferences'
import { Button } from './Button'
import { Select } from './Select'

type TablePaginationProps = {
  meta: PaginatedMeta
  perPage: AllowedPerPage
  allowedPerPageOptions: readonly AllowedPerPage[]
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: AllowedPerPage) => void
}

function getRange(meta: PaginatedMeta): { from: number; to: number; total: number } | null {
  if (meta.total === 0) {
    return null
  }

  const from = (meta.current_page - 1) * meta.per_page + 1
  const to = Math.min(meta.current_page * meta.per_page, meta.total)

  return { from, to, total: meta.total }
}

export function TablePagination({
  meta,
  perPage,
  allowedPerPageOptions,
  onPageChange,
  onPerPageChange,
}: TablePaginationProps) {
  const canGoPrevious = meta.current_page > 1
  const canGoNext = meta.current_page < meta.last_page
  const range = getRange(meta)

  return (
    <div className="mt-4 flex items-center justify-between gap-2 rounded-md bg-primary-muted/40 px-3 py-2 shadow-surface sm:gap-3 sm:px-4 sm:py-2.5">
      <p className="min-w-0 shrink text-xs font-medium text-foreground-muted sm:text-sm">
        {range ? (
          <>
            <span className="font-semibold text-primary">
              {range.from}–{range.to}
            </span>
            <span className="text-foreground-muted"> de </span>
            <span className="font-semibold text-foreground">{range.total}</span>
          </>
        ) : (
          <span className="text-foreground-muted">Nenhum registro</span>
        )}
      </p>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <label className="flex items-center gap-1.5">
          <span className="hidden text-xs font-medium text-foreground-muted sm:inline">Por página</span>
          <Select
            value={perPage}
            onChange={onPerPageChange}
            aria-label="Itens por página"
            placement="top"
            options={allowedPerPageOptions.map((option) => ({
              value: option,
              label: String(option),
            }))}
          />
        </label>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!canGoPrevious}
            onClick={() => onPageChange(meta.current_page - 1)}
            aria-label="Página anterior"
            className="size-11 rounded-md! p-0 text-primary hover:bg-primary-muted"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>

          <span className="min-w-10 rounded-md bg-primary px-2 py-1 text-center text-xs font-semibold text-primary-foreground sm:min-w-12 sm:text-sm">
            {meta.current_page}/{meta.last_page}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!canGoNext}
            onClick={() => onPageChange(meta.current_page + 1)}
            aria-label="Próxima página"
            className="size-11 rounded-md! p-0 text-primary hover:bg-primary-muted"
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  )
}
