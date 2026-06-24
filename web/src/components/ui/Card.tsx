import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-xl bg-surface p-6 shadow-overlay sm:p-8 ${className}`}>{children}</div>
  )
}

export function CardHeader({ children, className = '' }: CardProps) {
  return <div className={`mb-8 text-center ${className}`}>{children}</div>
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-2xl font-semibold tracking-tight text-foreground">{children}</h1>
}

export function CardDescription({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-sm text-foreground-muted">{children}</p>
}
