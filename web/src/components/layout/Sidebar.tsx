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
    <aside className="hidden h-screen sticky top-0 w-64 shrink-0 flex-col bg-sidebar md:flex">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-sidebar-hover">
        <p className="text-lg font-semibold tracking-tight text-white">Vulcano</p>
      </div>

      {/* User info */}
      {user && (
        <div className="flex items-center gap-3 px-4 py-5">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sidebar-hover text-sm font-semibold text-white"
            aria-hidden
          >
            {getInitials(user.name)}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-300">{user.name}</p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>

          <button
            type="button"
            onClick={() => logout()}
            aria-label="Sair"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-gray-300 transition hover:bg-sidebar-hover hover:text-white"
          >
            <LogOut className="size-4" aria-hidden />
          </button>
        </div>
      )}

      {/* Navigation — WITH icons */}
      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const isActive = isNavItemActive(item.href, pathname)
          const Icon = item.icon

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => goTo(item.href)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                isActive
                  ? 'bg-sidebar-active text-white'
                  : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}