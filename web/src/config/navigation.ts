import { CalendarPlus, GitBranch, LayoutDashboard, Palmtree, Shield, Users, type LucideIcon } from 'lucide-react'

export type NavigationItem = {
  label: string
  href: string
  title: string
  icon: LucideIcon
}

export const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', href: '/', title: 'Dashboard', icon: LayoutDashboard },
  { label: 'Colaboradores', href: '/users', title: 'Colaboradores', icon: Users },
  { label: 'Férias', href: '/vacation-balances', title: 'Saldos de férias', icon: Palmtree },
  { label: 'Solicitações', href: '/vacation-requests', title: 'Solicitações de férias', icon: CalendarPlus },
  { label: 'Perfis', href: '/roles', title: 'Perfis', icon: Shield },
  { label: 'Workflows', href: '/workflows', title: 'Fluxos de Aprovação', icon: GitBranch },
]

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
  if (pathname === '/vacation-requests') return 'Solicitações de férias'
  if (pathname === '/workflow-instances') return 'Processos'
  if (/^\/workflow-instances\/\d+$/.test(pathname)) return 'Detalhes do processo'

  const exactMatch = navigationItems.find((item) => item.href === pathname)
  if (exactMatch) {
    return exactMatch.title
  }

  const prefixMatch = navigationItems.find(
    (item) => item.href !== '/' && pathname.startsWith(item.href),
  )

  return prefixMatch?.title ?? 'Vulcano'
}
