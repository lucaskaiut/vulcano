import type { TextareaHTMLAttributes } from 'react'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  error?: string
}

export function Textarea({ label, id, className = '', error, ...props }: TextareaProps) {
  const textareaId = id ?? props.name

  return (
    <div>
      <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-foreground-muted">
        {label}
      </label>
      <textarea
        id={textareaId}
        aria-invalid={error ? true : undefined}
        className={`min-h-24 w-full resize-y rounded-lg bg-surface-sunken px-3 py-2.5 text-foreground shadow-inset outline-none placeholder:text-foreground-subtle focus:bg-surface focus:shadow-raised ${error ? 'ring-2 ring-danger/30' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  )
}
