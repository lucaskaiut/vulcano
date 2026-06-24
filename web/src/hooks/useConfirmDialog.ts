import { useCallback, useState } from 'react'

type ConfirmDialogOptions = {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
}

type PendingConfirm = ConfirmDialogOptions & {
  resolve: (confirmed: boolean) => void
}

export type ConfirmDialogState = ConfirmDialogOptions

export function useConfirmDialog() {
  const [pending, setPending] = useState<PendingConfirm | null>(null)

  const confirm = useCallback((options: ConfirmDialogOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve })
    })
  }, [])

  const resolveConfirm = useCallback(() => {
    setPending((current) => {
      current?.resolve(true)
      return null
    })
  }, [])

  const rejectConfirm = useCallback(() => {
    setPending((current) => {
      current?.resolve(false)
      return null
    })
  }, [])

  const confirmState: ConfirmDialogState | null = pending
    ? {
        title: pending.title,
        description: pending.description,
        confirmLabel: pending.confirmLabel,
        cancelLabel: pending.cancelLabel,
      }
    : null

  return {
    confirm,
    confirmState,
    resolveConfirm,
    rejectConfirm,
  }
}
