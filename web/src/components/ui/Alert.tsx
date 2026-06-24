import type { ReactNode } from 'react'

type AlertVariant = 'success' | 'warning' | 'danger'

type AlertProps = {
  variant: AlertVariant
  children: ReactNode
}

const variantClasses: Record<AlertVariant, string> = {
  success: 'bg-success-muted text-success shadow-surface',
  warning: 'bg-warning-muted text-warning shadow-surface',
  danger: 'bg-danger-muted text-danger shadow-surface',
}

export function Alert({ variant, children }: AlertProps) {
  return (
    <p className={`rounded-lg px-3 py-2.5 text-sm ${variantClasses[variant]}`}>{children}</p>
  )
}
