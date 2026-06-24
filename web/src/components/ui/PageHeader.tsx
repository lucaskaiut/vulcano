import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-foreground sm:text-xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-foreground-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0 [&_a]:block [&_button]:w-full sm:[&_button]:w-auto">{action}</div>}
    </div>
  )
}
