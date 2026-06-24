import { LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { navigationItems } from '../../config/navigation'
import { getInitials } from '../../lib/layout'

export function Sidebar() {
  const { user, logout } = useAuth()

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
        {navigationItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/'}
            onClick={() => {
              document.body.style.overflow = ''
            }}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-primary-muted text-primary shadow-surface'
                  : 'text-foreground-muted hover:bg-surface-sunken hover:text-foreground'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
