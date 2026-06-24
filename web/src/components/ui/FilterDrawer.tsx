import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { Button } from './Button'

type FilterDrawerProps = {
  open: boolean
  title: string
  onClose: () => void
  onApply: () => void
  onClear: () => void
  isApplying?: boolean
  applyDisabled?: boolean
  children: ReactNode
}

export function FilterDrawer({
  open,
  title,
  onClose,
  onApply,
  onClear,
  isApplying = false,
  applyDisabled = false,
  children,
}: FilterDrawerProps) {
  useEffect(() => {
    if (!open) {
      return
    }

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

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-70" role="presentation">
      <button
        type="button"
        aria-label="Fechar filtros"
        className="absolute inset-0 bg-foreground/30"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface shadow-overlay"
      >
        <div className="flex items-center justify-between border-b border-surface-sunken px-4 py-4 sm:px-5">
          <h2 className="text-base font-semibold text-foreground sm:text-lg">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex size-9 items-center justify-center rounded-lg text-foreground-muted transition hover:bg-surface-sunken hover:text-foreground"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">{children}</div>

        <div className="flex flex-col-reverse gap-2 border-t border-surface-sunken px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
          <Button type="button" variant="ghost" onClick={onClear}>
            Limpar
          </Button>
          <Button type="button" onClick={onApply} disabled={isApplying || applyDisabled}>
            Aplicar filtros
          </Button>
        </div>
      </aside>
    </div>
  )
}
