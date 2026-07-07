import { LogOut, ChevronDown } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../contexts/AuthContext'
import { isNavItemActive, useFilteredNavigation } from '../../config/navigation'
import type { NavigationItem } from '../../config/navigation'
import { getInitials } from '../../lib/layout'

type NavigationGroup = {
  label: string
  icon: typeof LogOut
  children: NavigationItem[]
  permission?: string
}

function isGroup(item: NavigationItem | NavigationGroup): item is NavigationGroup {
  return 'children' in item
}

function NavItem({ item, pathname, goTo }: { item: NavigationItem; pathname: string; goTo: (href: string) => void }) {
  const isActive = isNavItemActive(item.href, pathname)
  const Icon = item.icon

  return (
    <button
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
}

function NavGroup({ group, pathname, goTo }: { group: NavigationGroup; pathname: string; goTo: (href: string) => void }) {
  const [expanded, setExpanded] = useState(
    group.children.some((child) => isNavItemActive(child.href, pathname)),
  )
  const Icon = group.icon
  const isAnyChildActive = group.children.some((child) => isNavItemActive(child.href, pathname))

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
          isAnyChildActive
            ? 'text-white'
            : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
        }`}
      >
        <Icon className="size-5 shrink-0" aria-hidden />
        <span className="flex-1">{group.label}</span>
        <ChevronDown
          className={`size-4 shrink-0 transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>

      {expanded && (
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-sidebar-hover pl-3">
          {group.children.map((child) => (
            <NavItem key={child.href} item={child} pathname={pathname} goTo={goTo} />
          ))}
        </div>
      )}
    </div>
  )
}

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

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {items.map((item) => {
          if (isGroup(item)) {
            return <NavGroup key={item.label} group={item} pathname={pathname} goTo={goTo} />
          }

          return <NavItem key={item.href} item={item} pathname={pathname} goTo={goTo} />
        })}
      </nav>
    </aside>
  )
}
