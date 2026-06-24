import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type AuthLayoutProps = {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-6 sm:py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-lg font-semibold tracking-tight text-primary">Vulcano</p>
        </div>

        <div className="rounded-xl bg-surface p-6 shadow-overlay sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="mt-2 text-sm text-foreground-muted">{description}</p>
          </div>

          {children}
        </div>

        {footer && (
          <p className="mt-6 text-center text-sm text-foreground-muted">{footer}</p>
        )}
      </div>
    </div>
  )
}

export function AuthLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="font-medium text-primary hover:text-primary-hover">
      {children}
    </Link>
  )
}
