import { LogOut } from 'lucide-react'
import { useCallback } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../contexts/AuthContext'
import { isNavItemActive, useFilteredNavigation } from '../../config/navigation'
import { getInitials } from '../../lib/layout'

export function Sidebar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const items = useFilteredNavigation()

  const goTo = useCallback(
    (href: string) => {
      navigate({ to: href })
    },
    [navigate],
  )

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col bg-surface shadow-overlay md:flex">
      <div className="px-6 py-5">
        <p className="text-lg font-semibold tracking-tight text-primary">Vulcano</p>
      </div>

      {user && (
        <div className="flex items-center gap-3 px-4 pb-5">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-muted text-sm font-semibold text-primary shadow-surface"
            aria-hidden
          >
            {getInitials(user.name)}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs text-foreground-muted">{user.email}</p>
          </div>

          <button
            type="button"
            onClick={() => logout()}
            aria-label="Sair"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-foreground-muted transition hover:bg-surface-sunken hover:text-foreground"
          >
            <LogOut className="size-4" aria-hidden />
          </button>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const isActive = isNavItemActive(item.href, pathname)

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => goTo(item.href)}
              className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                isActive
                  ? 'bg-primary-muted text-primary shadow-surface'
                  : 'text-foreground-muted hover:bg-surface-sunken hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
