import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export function Input({ label, id, className = '', error, ...props }: InputProps) {
  const inputId = id ?? props.name

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground-muted">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-lg bg-surface-sunken px-3 py-2.5 text-foreground shadow-inset outline-none placeholder:text-foreground-subtle focus:bg-surface focus:shadow-raised ${error ? 'ring-2 ring-danger/30' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  )
}
