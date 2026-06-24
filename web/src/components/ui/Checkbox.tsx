import type { InputHTMLAttributes } from 'react'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
}

export function Checkbox({ label, id, className = '', ...props }: CheckboxProps) {
  const inputId = id ?? props.name

  return (
    <label htmlFor={inputId} className={`flex cursor-pointer items-center gap-2 text-sm ${className}`}>
      <input
        id={inputId}
        type="checkbox"
        className="size-4 rounded accent-primary"
        {...props}
      />
      <span className="text-foreground">{label}</span>
    </label>
  )
}

type CheckboxGroupProps = {
  label: string
  error?: string
  children: React.ReactNode
}

export function CheckboxGroup({ label, error, children }: CheckboxGroupProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground-muted">{label}</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  )
}
