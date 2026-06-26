import { CalendarPlus, DollarSign, GitBranch, LayoutDashboard, Palmtree, Shield, Users, type LucideIcon } from 'lucide-react'
import { usePermissions } from '../hooks/usePermissions'
import { useMemo } from 'react'

export type NavigationItem = {
  label: string
  href: string
  title: string
  icon: LucideIcon
  permission?: string
}

const allNavigationItems: NavigationItem[] = [
  { label: 'Dashboard', href: '/', title: 'Dashboard', icon: LayoutDashboard },
  { label: 'Colaboradores', href: '/users', title: 'Colaboradores', icon: Users, permission: 'users.view' },
  { label: 'Férias', href: '/vacation-balances', title: 'Saldos de férias', icon: Palmtree, permission: 'vacation_balances.view' },
  { label: 'Solicitações', href: '/vacation-requests', title: 'Solicitações de férias', icon: CalendarPlus, permission: 'vacation_requests.view' },
  { label: 'Comissões', href: '/sales', title: 'Comissões', icon: DollarSign, permission: 'commissions.view' },
  { label: 'Perfis', href: '/roles', title: 'Perfis', icon: Shield, permission: 'roles.view' },
  { label: 'Workflows', href: '/workflows', title: 'Fluxos de Aprovação', icon: GitBranch, permission: 'workflow_steps.update' },
]

const routePermissionMap: Record<string, string> = {
  '/users': 'users.view',
  '/users/novo': 'users.create',
  '/sales': 'commissions.view',
  '/vacation-balances': 'vacation_balances.view',
  '/vacation-requests': 'vacation_requests.view',
  '/roles': 'roles.view',
  '/roles/novo': 'roles.create',
  '/workflows': 'workflow_steps.update',
  '/workflow-instances': 'workflow_instances.view',
}

const ROUTE_EDIT_PATTERNS: { pattern: RegExp; permission: string }[] = [
  { pattern: /^\/users\/\d+\/editar$/, permission: 'users.update' },
  { pattern: /^\/roles\/\d+\/editar$/, permission: 'roles.update' },
]

const ROUTE_VIEW_PATTERNS: { pattern: RegExp; permission: string }[] = [
  { pattern: /^\/users\/\d+$/, permission: 'users.view' },
  { pattern: /^\/workflow-instances\/\d+$/, permission: 'workflow_instances.view' },
]

export function routeRequiresPermission(pathname: string): string | null {
  if (routePermissionMap[pathname]) {
    return routePermissionMap[pathname]
  }

  for (const { pattern, permission } of ROUTE_EDIT_PATTERNS) {
    if (pattern.test(pathname)) return permission
  }

  for (const { pattern, permission } of ROUTE_VIEW_PATTERNS) {
    if (pattern.test(pathname)) return permission
  }

  return null
}

export function useFilteredNavigation(): NavigationItem[] {
  const { can } = usePermissions()

  return useMemo(
    () => allNavigationItems.filter((item) => !item.permission || can(item.permission)),
    [can],
  )
}

export { allNavigationItems }

export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === '/') {
    return pathname === '/'
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function getNavigationTitle(pathname: string): string {
  if (pathname === '/users/novo') return 'Novo colaborador'
  if (/^\/users\/\d+\/editar$/.test(pathname)) return 'Editar colaborador'
  if (/^\/users\/\d+$/.test(pathname)) return 'Detalhes do colaborador'
  if (pathname === '/roles/novo') return 'Novo perfil'
  if (/^\/roles\/\d+\/editar$/.test(pathname)) return 'Editar perfil'
  if (pathname === '/sales') return 'Comissões'
  if (pathname === '/vacation-requests') return 'Solicitações de férias'
  if (pathname === '/workflow-instances') return 'Processos'
  if (/^\/workflow-instances\/\d+$/.test(pathname)) return 'Detalhes do processo'

  const exactMatch = allNavigationItems.find((item) => item.href === pathname)
  if (exactMatch) {
    return exactMatch.title
  }

  const prefixMatch = allNavigationItems.find(
    (item) => item.href !== '/' && pathname.startsWith(item.href),
  )

  return prefixMatch?.title ?? 'Vulcano'
}
