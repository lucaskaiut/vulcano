import { useEffect, useId, useRef } from 'react'
import { Button } from './Button'

type ConfirmModalProps = {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const titleId = useId()
  const descriptionId = useId()
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    confirmButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isLoading) {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, isLoading, onCancel])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-70 flex items-end justify-center p-4 sm:items-center" role="presentation">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-foreground/30"
        disabled={isLoading}
        onClick={onCancel}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative w-full max-w-md rounded-lg bg-surface p-5 shadow-overlay sm:p-6"
      >
        <h2 id={titleId} className="text-base font-semibold text-foreground sm:text-lg">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm text-foreground-muted">
          {description}
        </p>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" disabled={isLoading} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            ref={confirmButtonRef}
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="bg-danger text-danger-foreground shadow-surface hover:brightness-95 active:brightness-90 disabled:opacity-50"
          >
            {isLoading ? 'Excluindo...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
